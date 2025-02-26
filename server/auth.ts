import type { Express } from "express";
import session from "express-session";
import connectPg from "connect-pg-simple";
import pg from 'pg';
import { log } from "./vite";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { users, insertUserSchema, type SelectUser } from "../db/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { fromZodError } from "zod-validation-error";

interface AuthInfo {
  message?: string;
}

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);
const PostgresSessionStore = connectPg(session);

// Create a new pg Pool instance for session store
const sessionPool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10
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

async function getUserByUsername(username: string) {
  return db.select().from(users).where(eq(users.username, username)).limit(1);
}

export function setupAuth(app: Express) {
  const store = new PostgresSessionStore({
    pool: sessionPool,
    createTableIfMissing: true,
    tableName: 'session'
  });

  // Explicitly set session secret for development
  if (!process.env.SESSION_SECRET) {
    log('SESSION_SECRET not found, using development secret');
    process.env.SESSION_SECRET = '0a0df83f14af11c0841035474b9e698664e5be1513c193db84a8b059ca9aef06';
  }

  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
      sameSite: 'lax'
    },
    name: 'sid'
  };

  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const [user] = await getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false, { message: 'Invalid username or password' });
        }
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    })
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, id))
        .limit(1);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Authentication routes
  app.post("/api/register", async (req, res) => {
    try {
      const result = insertUserSchema.safeParse(req.body);
      if (!result.success) {
        const error = fromZodError(result.error);
        return res.status(400).json({ error: error.message });
      }

      const [existingUser] = await getUserByUsername(result.data.username);
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }

      const hashedPassword = await hashPassword(result.data.password);
      const [user] = await db
        .insert(users)
        .values({
          username: result.data.username,
          password: hashedPassword,
        })
        .returning();

      req.login(user, (loginErr: Error | null) => {
        if (loginErr) {
          return res.status(500).json({ error: "Login failed after registration" });
        }
        // Don't return password to client
        const { password, ...safeUser } = user;
        return res.status(201).json(safeUser);
      });
    } catch (error) {
      log(`Registration error: ${error instanceof Error ? error.message : String(error)}`);
      res.status(500).json({ error: "Registration failed" });
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: Error | null, user: Express.User | false, info: AuthInfo) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({ error: info?.message || "Authentication failed" });
      }
      req.login(user, (loginErr: Error | null) => {
        if (loginErr) {
          return next(loginErr);
        }
        // Don't return password to the client
        const { password, ...safeUser } = user;
        return res.json(safeUser);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res) => {
    req.logout((err: Error | null) => {
      if (err) {
        return res.status(500).json({ error: "Logout failed" });
      }
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    // Return only safe user data (don't include password)
    const { password, ...safeUser } = req.user;
    res.json(safeUser);
  });
}

export function requireAuth(req: any, res: any, next: any) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Authentication required" });
  }
  next();
}