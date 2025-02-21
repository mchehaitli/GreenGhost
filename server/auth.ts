import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { eq } from "drizzle-orm";
import { fromZodError } from "zod-validation-error";
import { z } from "zod";
import { db } from "./db";
import { users, type SelectUser, insertUserSchema } from "../db/schema";
import pg from 'pg';

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);
const PostgresSessionStore = connectPg(session);

// Create a new pg Pool instance for session store
const sessionPool = new pg.Pool({
  connectionString: process.env.DATABASE_URL
});

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

async function getUserByUsername(username: string): Promise<SelectUser | undefined> {
  const [user] = await db.select().from(users).where(eq(users.username, username));
  return user;
}

export function setupAuth(app: Express) {
  // Initialize session store with proper pg Pool
  const store = new PostgresSessionStore({
    pool: sessionPool,
    createTableIfMissing: true,
    tableName: 'session'
  });

  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || 'dev-secret-key',
    resave: false,
    saveUninitialized: false,
    store,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    },
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username: string, password: string, done) => {
      try {
        console.log("Attempting login for username:", username);
        const user = await getUserByUsername(username);

        if (!user) {
          console.log("User not found");
          return done(null, false, { message: "Invalid username or password" });
        }

        // Hash the new admin's password if it hasn't been hashed yet
        if (!user.password.includes('.')) {
          user.password = await hashPassword(user.password);
          await db.update(users)
            .set({ password: user.password })
            .where(eq(users.id, user.id));
        }

        const isValid = await comparePasswords(password, user.password);
        if (!isValid) {
          console.log("Invalid password");
          return done(null, false, { message: "Invalid username or password" });
        }

        console.log("Login successful");
        return done(null, user);
      } catch (error) {
        console.error("Login error:", error);
        return done(error);
      }
    })
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      done(null, user || undefined);
    } catch (error) {
      console.error("Deserialization error:", error);
      done(error);
    }
  });

  // Authentication routes
  app.post("/api/login", (req, res, next) => {
    console.log("Login attempt:", req.body.username);

    passport.authenticate("local", (err: any, user: SelectUser | false, info: { message: string } | undefined) => {
      if (err) {
        console.error("Authentication error:", err);
        return next(err);
      }
      if (!user) {
        console.log("Authentication failed:", info?.message);
        return res.status(401).json({ error: info?.message || "Authentication failed" });
      }
      req.login(user, (err) => {
        if (err) {
          console.error("Login error:", err);
          return next(err);
        }
        console.log("Login successful for:", user.username);
        res.json({ id: user.id, username: user.username });
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    const username = req.user?.username;
    console.log("Logout attempt for:", username);

    req.logout((err) => {
      if (err) {
        console.error("Logout error:", err);
        return next(err);
      }
      console.log("Logout successful for:", username);
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const user = req.user as SelectUser;
    res.json({ id: user.id, username: user.username });
  });
}