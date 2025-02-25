import { Router } from "express";
import { blogPosts, insertBlogPostSchema } from "@db/schema";
import { db } from "../db";
import { eq } from "drizzle-orm";
import { generateBlogPost, createBlogPost, publishBlogPost, unpublishBlogPost } from "../services/blog";
import { fromZodError } from "zod-validation-error";

const router = Router();

// Get all blog posts (with optional filter for published only)
router.get("/api/blog-posts", async (req, res) => {
  try {
    const posts = await db.select().from(blogPosts).orderBy(blogPosts.created_at);
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch blog posts" });
  }
});

// Get a single blog post by slug
router.get("/api/blog-posts/:slug", async (req, res) => {
  try {
    const [post] = await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.slug, req.params.slug))
      .limit(1);

    if (!post) {
      return res.status(404).json({ error: "Blog post not found" });
    }

    res.json(post);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch blog post" });
  }
});

// Create a new blog post
router.post("/api/blog-posts", async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const result = insertBlogPostSchema.safeParse(req.body);
    if (!result.success) {
      const error = fromZodError(result.error);
      return res.status(400).json({ error: error.toString() });
    }

    const post = await createBlogPost(result.data, req.user.id);
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ error: "Failed to create blog post" });
  }
});

// Generate a blog post draft using AI
router.post("/api/blog-posts/generate", async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const draft = await generateBlogPost();
    res.json(draft);
  } catch (error) {
    res.status(500).json({ error: "Failed to generate blog post" });
  }
});

// Update a blog post
router.patch("/api/blog-posts/:id", async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const result = insertBlogPostSchema.partial().safeParse(req.body);
    if (!result.success) {
      const error = fromZodError(result.error);
      return res.status(400).json({ error: error.toString() });
    }

    const [post] = await db
      .update(blogPosts)
      .set(result.data)
      .where(eq(blogPosts.id, parseInt(req.params.id)))
      .returning();

    res.json(post);
  } catch (error) {
    res.status(500).json({ error: "Failed to update blog post" });
  }
});

// Publish a blog post
router.post("/api/blog-posts/:id/publish", async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    await publishBlogPost(parseInt(req.params.id));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to publish blog post" });
  }
});

// Unpublish a blog post
router.post("/api/blog-posts/:id/unpublish", async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    await unpublishBlogPost(parseInt(req.params.id));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to unpublish blog post" });
  }
});

export default router;
