import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull().default("User"),
  verified: integer("verified", { mode: "boolean" }).default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).defaultNow(),
});

export const tasks = sqliteTable("tasks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(), // No foreign key constraint for simplicity in lite mode, handled in app logic
  title: text("title").notNull(),
  description: text("description"),
  priority: text("priority").notNull().default("medium"),
  status: text("status").notNull().default("todo"),
  dueDate: integer("due_date", { mode: "timestamp" }),
  aiSummary: text("ai_summary"),
  tags: text("tags"), // JSON string
  createdAt: integer("created_at", { mode: "timestamp" }).defaultNow(),
});

export const emailVerifications = sqliteTable("email_verifications", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  otp: text("otp").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
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
