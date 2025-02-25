import { pgTable, text, serial, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { z } from "zod";

// Base tables
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const waitlist = pgTable("waitlist", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  name: text("name"),
  phone_number: text("phone_number"),
  address: text("address"),
  notes: text("notes"),
  zip_code: text("zip_code").default("").notNull(),
  verified: boolean("verified").default(false).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  expires_at: timestamp("expires_at"),
});

export const verificationTokens = pgTable("verification_tokens", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  token: text("token").notNull(),
  expires_at: timestamp("expires_at").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  used: boolean("used").default(false).notNull(),
});

// New tables for email template management
export const emailTemplates = pgTable("email_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  subject: text("subject").notNull(),
  html_content: text("html_content").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const emailSegments = pgTable("email_segments", {
  id: serial("id").primaryKey(),
  template_id: serial("template_id").references(() => emailTemplates.id),
  zip_codes: text("zip_codes").array(),
  sent_at: timestamp("sent_at").defaultNow().notNull(),
  total_recipients: serial("total_recipients").notNull(),
});

// New table for blog posts
export const blogPosts = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  summary: text("summary").notNull(),
  content: text("content").notNull(),
  author_id: serial("author_id").references(() => users.id),
  published: boolean("published").default(false).notNull(),
  published_at: timestamp("published_at"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
  tags: text("tags").array(),
  featured_image: text("featured_image"),
});

// Relations
export const verificationTokensRelations = relations(verificationTokens, ({ one }) => ({
  waitlist: one(waitlist, {
    fields: [verificationTokens.email],
    references: [waitlist.email],
  }),
}));

export const emailSegmentsRelations = relations(emailSegments, ({ one }) => ({
  template: one(emailTemplates, {
    fields: [emailSegments.template_id],
    references: [emailTemplates.id],
  }),
}));

export const blogPostsRelations = relations(blogPosts, ({ one }) => ({
  author: one(users, {
    fields: [blogPosts.author_id],
    references: [users.id],
  }),
}));

// Zod schemas for validation
export const insertUserSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const insertWaitlistSchema = z.object({
  email: z.string().email("Invalid email address"),
  zip_code: z.string().length(5, "ZIP code must be exactly 5 digits").regex(/^\d+$/, "ZIP code must be numeric"),
});

export const verificationSchema = z.object({
  email: z.string().email("Invalid email address"),
  code: z.string().length(6, "Verification code must be exactly 6 digits").regex(/^\d+$/, "Verification code must be numeric"),
});

export const insertEmailTemplateSchema = z.object({
  name: z.string().min(1, "Template name is required"),
  subject: z.string().min(1, "Email subject is required"),
  html_content: z.string().min(1, "Email content is required"),
});

export const insertBlogPostSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  summary: z.string().min(1, "Summary is required"),
  content: z.string().min(1, "Content is required"),
  tags: z.array(z.string()).optional(),
  featured_image: z.string().optional(),
});

// Export types
export const selectUserSchema = createSelectSchema(users);
export type InsertUser = typeof users.$inferInsert;
export type SelectUser = typeof users.$inferSelect;

export const selectWaitlistSchema = createSelectSchema(waitlist);
export type InsertWaitlist = typeof waitlist.$inferInsert;
export type SelectWaitlist = typeof waitlist.$inferSelect;

export const selectVerificationTokenSchema = createSelectSchema(verificationTokens);
export type InsertVerificationToken = typeof verificationTokens.$inferInsert;
export type SelectVerificationToken = typeof verificationTokens.$inferSelect;

export const selectEmailTemplateSchema = createSelectSchema(emailTemplates);
export type InsertEmailTemplate = typeof emailTemplates.$inferInsert;
export type SelectEmailTemplate = typeof emailTemplates.$inferSelect;

export const selectEmailSegmentSchema = createSelectSchema(emailSegments);
export type InsertEmailSegment = typeof emailSegments.$inferInsert;
export type SelectEmailSegment = typeof emailSegments.$inferSelect;

export const selectBlogPostSchema = createSelectSchema(blogPosts);
export type InsertBlogPost = typeof blogPosts.$inferInsert;
export type SelectBlogPost = typeof blogPosts.$inferSelect;