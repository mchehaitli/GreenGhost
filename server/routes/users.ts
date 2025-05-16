import { Router } from "express";
import { db } from "../db";
import { users } from "@db/schema";
import { eq } from "drizzle-orm";
import { updateUserSchema, insertUserSchema } from "@db/schema";
import { requireAuth, requireAdmin } from "../auth";
import { fromZodError } from "zod-validation-error";
import { log } from "../vite";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

const router = Router();
const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

// Get all users (admin only)
router.get("/", requireAdmin, async (req, res) => {
  try {
    const allUsers = await db.select({
      id: users.id,
      username: users.username,
      is_admin: users.is_admin,
      created_at: users.created_at
    }).from(users);
    
    res.json(allUsers);
  } catch (error) {
    log("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Update current user
router.patch("/me", requireAuth, async (req, res) => {
  try {
    const result = updateUserSchema.safeParse(req.body);
    if (!result.success) {
      const error = fromZodError(result.error);
      return res.status(400).json({ error: error.message });
    }

    const userId = req.user.id;
    const updates: any = {};

    // Handle username update
    if (result.data.username) {
      // Check if username is already taken
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.username, result.data.username))
        .limit(1);
      
      if (existingUser.length > 0 && existingUser[0].id !== userId) {
        return res.status(400).json({ error: "Username already exists" });
      }
      
      updates.username = result.data.username;
    }

    // Handle password update
    if (result.data.password) {
      updates.password = await hashPassword(result.data.password);
    }

    // Update user
    if (Object.keys(updates).length > 0) {
      const [updatedUser] = await db
        .update(users)
        .set(updates)
        .where(eq(users.id, userId))
        .returning({
          id: users.id,
          username: users.username,
          is_admin: users.is_admin,
          created_at: users.created_at
        });

      return res.json(updatedUser);
    } else {
      return res.status(400).json({ error: "No valid updates provided" });
    }
  } catch (error) {
    log("Error updating user:", error);
    res.status(500).json({ error: "Failed to update user" });
  }
});

// Create a new user (admin only)
router.post("/", requireAdmin, async (req, res) => {
  try {
    const result = insertUserSchema.safeParse(req.body);
    if (!result.success) {
      const error = fromZodError(result.error);
      return res.status(400).json({ error: error.message });
    }

    // Check if username is already taken
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.username, result.data.username))
      .limit(1);
    
    if (existingUser.length > 0) {
      return res.status(400).json({ error: "Username already exists" });
    }

    // Create user
    const [newUser] = await db
      .insert(users)
      .values({
        username: result.data.username,
        password: await hashPassword(result.data.password),
        is_admin: result.data.is_admin
      })
      .returning({
        id: users.id,
        username: users.username,
        is_admin: users.is_admin,
        created_at: users.created_at
      });

    res.status(201).json(newUser);
  } catch (error) {
    log("Error creating user:", error);
    res.status(500).json({ error: "Failed to create user" });
  }
});

// Update user (admin only)
router.patch("/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = parseInt(id);
    
    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const result = updateUserSchema.safeParse(req.body);
    if (!result.success) {
      const error = fromZodError(result.error);
      return res.status(400).json({ error: error.message });
    }

    // Check if user exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    
    if (existingUser.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const updates: any = {};

    // Handle username update
    if (result.data.username) {
      // Check if username is already taken by a different user
      const userWithSameUsername = await db
        .select()
        .from(users)
        .where(eq(users.username, result.data.username))
        .limit(1);
      
      if (userWithSameUsername.length > 0 && userWithSameUsername[0].id !== userId) {
        return res.status(400).json({ error: "Username already exists" });
      }
      
      updates.username = result.data.username;
    }

    // Handle password update
    if (result.data.password) {
      updates.password = await hashPassword(result.data.password);
    }

    // Handle admin status update
    if (typeof result.data.is_admin === 'boolean') {
      updates.is_admin = result.data.is_admin;
    }

    // Update user
    if (Object.keys(updates).length > 0) {
      const [updatedUser] = await db
        .update(users)
        .set(updates)
        .where(eq(users.id, userId))
        .returning({
          id: users.id,
          username: users.username,
          is_admin: users.is_admin,
          created_at: users.created_at
        });

      return res.json(updatedUser);
    } else {
      return res.status(400).json({ error: "No valid updates provided" });
    }
  } catch (error) {
    log("Error updating user:", error);
    res.status(500).json({ error: "Failed to update user" });
  }
});

// Delete user (admin only)
router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = parseInt(id);
    
    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    // Prevent deleting yourself
    if (userId === req.user.id) {
      return res.status(400).json({ error: "Cannot delete your own account" });
    }

    // Check if user exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    
    if (existingUser.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    // Delete user
    await db.delete(users).where(eq(users.id, userId));

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    log("Error deleting user:", error);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

export default router;