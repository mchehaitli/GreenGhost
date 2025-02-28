import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';
import { z } from 'zod';

// User table definition
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Zod schema for user creation/validation
export const insertUserSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Type for user selections from database
export type SelectUser = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
