import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").unique().notNull(),
  password: text("password").notNull(),
});

export const waitlist = pgTable("waitlist", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  zip_code: text("zip_code").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const quoteRequests = pgTable("quote_requests", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  address: text("address").notNull(),
  propertySize: text("property_size").notNull(),
  serviceType: text("service_type").notNull(),
  message: text("message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Create Zod schemas for waitlist
export const insertWaitlistSchema = createInsertSchema(waitlist);
export const selectWaitlistSchema = createSelectSchema(waitlist);
export type InsertWaitlist = typeof waitlist.$inferInsert;
export type SelectWaitlist = typeof waitlist.$inferSelect;

// Quote request schemas
export const insertQuoteSchema = createInsertSchema(quoteRequests);
export const selectQuoteSchema = createSelectSchema(quoteRequests);
export type InsertQuote = typeof quoteRequests.$inferInsert;
export type SelectQuote = typeof quoteRequests.$inferSelect;