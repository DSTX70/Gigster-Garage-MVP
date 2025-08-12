import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const tasks = pgTable("tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  description: text("description").notNull(),
  completed: boolean("completed").notNull().default(false),
  dueDate: timestamp("due_date"),
  priority: text("priority", { enum: ["low", "medium", "high"] }).notNull().default("medium"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
});

export const updateTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
}).partial();

export type InsertTask = z.infer<typeof insertTaskSchema>;
export type UpdateTask = z.infer<typeof updateTaskSchema>;
export type Task = typeof tasks.$inferSelect;
