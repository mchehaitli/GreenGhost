import express from 'express';
import { db } from '../db';
import { users } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { requireAuth } from '../auth';
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import { log } from '../vite';

const router = express.Router();
const scryptAsync = promisify(scrypt);

// Helper function to hash password
async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

// Schema for creating a new user
const createUserSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(8),
  is_admin: z.boolean().optional().default(false)
});

// Schema for updating a user
const updateUserSchema = z.object({
  username: z.string().min(3).max(50).optional(),
  password: z.string().min(8).optional(),
  is_admin: z.boolean().optional()
});

// Get all users (admin only)
router.get('/api/users', requireAuth, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user?.is_admin) {
      return res.status(403).json({ error: "Admin access required" });
    }

    const allUsers = await db.select({
      id: users.id,
      username: users.username,
      is_admin: users.is_admin,
      created_at: users.created_at
    }).from(users);

    res.json(allUsers);
  } catch (error) {
    log('Error fetching users:', error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Create a new user (admin only)
router.post('/api/users', requireAuth, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user?.is_admin) {
      return res.status(403).json({ error: "Admin access required" });
    }

    // Validate input
    const result = createUserSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.errors });
    }

    // Check if username already exists
    const existingUser = await db.select().from(users).where(eq(users.username, result.data.username)).limit(1);
    if (existingUser.length > 0) {
      return res.status(400).json({ error: "Username already exists" });
    }

    // Hash password
    const hashedPassword = await hashPassword(result.data.password);

    // Create user
    const [newUser] = await db.insert(users).values({
      username: result.data.username,
      password: hashedPassword,
      is_admin: result.data.is_admin
    }).returning({
      id: users.id,
      username: users.username,
      is_admin: users.is_admin,
      created_at: users.created_at
    });

    res.status(201).json(newUser);
  } catch (error) {
    log('Error creating user:', error);
    res.status(500).json({ error: "Failed to create user" });
  }
});

// Update user (admin only or self)
router.patch('/api/users/:id', requireAuth, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    // Check permissions - user can only update self unless admin
    if (!req.user?.is_admin && req.user?.id !== userId) {
      return res.status(403).json({ error: "You can only update your own account" });
    }

    // Validate input
    const result = updateUserSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.errors });
    }

    // If changing username, check if it already exists
    if (result.data.username) {
      const existingUser = await db.select().from(users)
        .where(eq(users.username, result.data.username))
        .limit(1);
      
      if (existingUser.length > 0 && existingUser[0].id !== userId) {
        return res.status(400).json({ error: "Username already exists" });
      }
    }

    // Prepare update data
    const updateData: Record<string, any> = {};
    if (result.data.username) updateData.username = result.data.username;
    if (result.data.password) updateData.password = await hashPassword(result.data.password);
    
    // Only allow admin updates if user is admin
    if (result.data.is_admin !== undefined) {
      if (!req.user?.is_admin) {
        return res.status(403).json({ error: "Only admins can change admin status" });
      }
      updateData.is_admin = result.data.is_admin;
    }

    // Update user
    const [updatedUser] = await db.update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning({
        id: users.id,
        username: users.username,
        is_admin: users.is_admin,
        created_at: users.created_at
      });

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(updatedUser);
  } catch (error) {
    log('Error updating user:', error);
    res.status(500).json({ error: "Failed to update user" });
  }
});

// Delete user (admin only)
router.delete('/api/users/:id', requireAuth, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user?.is_admin) {
      return res.status(403).json({ error: "Admin access required" });
    }

    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    // Don't allow deleting yourself
    if (req.user?.id === userId) {
      return res.status(400).json({ error: "You cannot delete your own account" });
    }

    // Delete user
    const [deletedUser] = await db.delete(users)
      .where(eq(users.id, userId))
      .returning({ id: users.id });

    if (!deletedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    log('Error deleting user:', error);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

export default router;