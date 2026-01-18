import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { api, errorSchemas } from "@shared/routes";
import { z } from "zod";
import { openai } from "./replit_integrations/image/client"; // reusing existing openai client setup

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Set up authentication
  setupAuth(app);

  // Protected route middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };

  // --- Task Routes ---

  app.get(api.tasks.list.path, requireAuth, async (req, res) => {
    const tasks = await storage.getTasks(req.user!.id);
    res.json(tasks);
  });

  app.get(api.tasks.get.path, requireAuth, async (req, res) => {
    const task = await storage.getTask(Number(req.params.id));
    if (!task) return res.status(404).json({ message: "Task not found" });
    if (task.userId !== req.user!.id) return res.status(403).json({ message: "Forbidden" });
    res.json(task);
  });

  app.post(api.tasks.create.path, requireAuth, async (req, res) => {
    try {
      const input = api.tasks.create.input.parse(req.body);
      const task = await storage.createTask({ ...input, userId: req.user!.id });
      res.status(201).json(task);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.patch(api.tasks.update.path, requireAuth, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const existing = await storage.getTask(id);
      if (!existing) return res.status(404).json({ message: "Task not found" });
      if (existing.userId !== req.user!.id) return res.status(403).json({ message: "Forbidden" });

      const updateSchema = insertTaskSchema.partial();
      const input = updateSchema.parse(req.body);
      const updated = await storage.updateTask(id, input);
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.tasks.delete.path, requireAuth, async (req, res) => {
    const id = Number(req.params.id);
    const existing = await storage.getTask(id);
    if (!existing) return res.status(404).json({ message: "Task not found" });
    if (existing.userId !== req.user!.id) return res.status(403).json({ message: "Forbidden" });

    await storage.deleteTask(id);
    res.status(204).send();
  });

  // --- AI Routes ---

  app.post(api.ai.prioritize.path, requireAuth, async (req, res) => {
    try {
      const { title, description } = api.ai.prioritize.input.parse(req.body);

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a task prioritization assistant. specificy priority as 'low', 'medium', or 'high'. Provide a short reason.",
          },
          {
            role: "user",
            content: `Task Title: ${title}\nDescription: ${description}\n\nWhat is the priority? Return JSON format: { "priority": "low"|"medium"|"high", "reason": "..." }`,
          },
        ],
        response_format: { type: "json_object" },
      });

      const content = JSON.parse(response.choices[0].message.content || "{}");
      res.json(content);
    } catch (error) {
      console.error("AI Prioritize Error:", error);
      res.status(500).json({ message: "Failed to prioritize task" });
    }
  });

  app.post(api.ai.summarize.path, requireAuth, async (req, res) => {
    try {
      const { description } = api.ai.summarize.input.parse(req.body);

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant that summarizes text concisely.",
          },
          {
            role: "user",
            content: `Summarize this task description in one sentence:\n\n${description}`,
          },
        ],
      });

      const summary = response.choices[0].message.content || "";
      res.json({ summary });
    } catch (error) {
      console.error("AI Summarize Error:", error);
      res.status(500).json({ message: "Failed to summarize task" });
    }
  });

  return httpServer;
}
