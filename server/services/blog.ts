import OpenAI from "openai";
import { db } from "../db";
import { blogPosts, type InsertBlogPost } from "@db/schema";
import { eq } from "drizzle-orm";
import slugify from "slugify";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const BLOG_TOPICS = [
  "lawn care tips for texas summer",
  "benefits of automated lawn mowing",
  "how to prepare your lawn for spring",
  "water conservation in lawn care",
  "common lawn problems and solutions",
  "eco-friendly lawn maintenance practices",
  "seasonal lawn care guide",
  "choosing the right grass type for your lawn",
  "lawn care myths debunked",
  "natural pest control for your lawn"
];

type BlogPostDraft = {
  title: string;
  summary: string;
  content: string;
  tags: string[];
};

export async function generateBlogPost(topic?: string): Promise<BlogPostDraft> {
  const selectedTopic = topic || BLOG_TOPICS[Math.floor(Math.random() * BLOG_TOPICS.length)];

  const prompt = `Write a comprehensive blog post about "${selectedTopic}" for a lawn care company website.
The blog post should be informative, engaging, and SEO-friendly.
Include practical tips and actionable advice.
Format the response as a JSON object with the following structure:
{
  "title": "catchy title here",
  "summary": "brief summary of the post (2-3 sentences)",
  "content": "full blog post content with HTML formatting",
  "tags": ["array", "of", "relevant", "tags"]
}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "You are a lawn care expert writing blog content for a modern landscaping company website."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    response_format: { type: "json_object" },
  });

  const result = JSON.parse(response.choices[0].message.content);
  return result as BlogPostDraft;
}

export async function createBlogPost(draft: BlogPostDraft, authorId: number): Promise<InsertBlogPost> {
  const slug = slugify(draft.title, { lower: true, strict: true });
  
  const [post] = await db.insert(blogPosts).values({
    title: draft.title,
    slug,
    summary: draft.summary,
    content: draft.content,
    author_id: authorId,
    tags: draft.tags,
    published: false,
  }).returning();

  return post;
}

export async function publishBlogPost(id: number): Promise<void> {
  await db.update(blogPosts)
    .set({ 
      published: true,
      published_at: new Date()
    })
    .where(eq(blogPosts.id, id));
}

export async function unpublishBlogPost(id: number): Promise<void> {
  await db.update(blogPosts)
    .set({ 
      published: false,
      published_at: null
    })
    .where(eq(blogPosts.id, id));
}

export async function getBlogPost(slug: string) {
  const [post] = await db.select()
    .from(blogPosts)
    .where(eq(blogPosts.slug, slug))
    .limit(1);
  return post;
}

export async function getPublishedPosts() {
  return db.select()
    .from(blogPosts)
    .where(eq(blogPosts.published, true))
    .orderBy(blogPosts.published_at);
}
