import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull().default("User"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(), // No foreign key constraint for simplicity in lite mode, handled in app logic
  title: text("title").notNull(),
  description: text("description"),
  priority: text("priority", { enum: ["low", "medium", "high"] }).default("medium").notNull(),
  status: text("status", { enum: ["todo", "in_progress", "completed"] }).default("todo").notNull(),
  dueDate: timestamp("due_date"),
  aiSummary: text("ai_summary"),
  tags: text("tags").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const tasksRelations = relations(tasks, ({ one }) => ({
  user: one(users, {
    fields: [tasks.userId],
    references: [users.id],
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  tasks: many(tasks),
}));

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertTaskSchema = createInsertSchema(tasks, {
  dueDate: z.union([z.date(), z.string().transform(v => new Date(v))]).optional(),
}).omit({ id: true, userId: true, createdAt: true, aiSummary: true });

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;

// AI Request/Response types
export const aiPrioritySchema = z.object({
  title: z.string(),
  description: z.string(),
});

export const aiSummarizeSchema = z.object({
  description: z.string(),
});
