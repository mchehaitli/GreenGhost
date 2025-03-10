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
  // Set trust proxy for proper handling of HTTPS in production
  app.set('trust proxy', 1);

  const store = new PostgresSessionStore({
    pool: sessionPool,
    createTableIfMissing: true,
    tableName: 'session'
  });

  // Ensure session secret is set
  if (!process.env.SESSION_SECRET) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('SESSION_SECRET must be set in production environment');
    }
    log('SESSION_SECRET not found, using development secret');
    process.env.SESSION_SECRET = '0a0df83f14af11c0841035474b9e698664e5be1513c193db84a8b059ca9aef06';
  }

  const isProd = process.env.NODE_ENV === 'production';
  // In production, we need to handle both the main domain and any subdomains
  const cookieDomain = isProd ? '.replit.app' : undefined;

  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    store,
    proxy: true,
    cookie: {
      secure: isProd, // Use secure cookies in production
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
      sameSite: isProd ? 'none' : 'lax', // Allow cross-origin cookies in production
      path: '/',
      domain: cookieDomain
    },
    name: 'sid'
  };

  // Log session configuration for debugging
  log('Session configuration:', {
    isProd,
    cookieDomain,
    secure: sessionSettings.cookie?.secure,
    sameSite: sessionSettings.cookie?.sameSite
  });

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
        log('User authenticated successfully:', username);
        return done(null, user);
      } catch (error) {
        log('Authentication error:', error);
        return done(error);
      }
    })
  );

  passport.serializeUser((user, done) => {
    log('Serializing user:', user.id);
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, id))
        .limit(1);
      log('Deserialized user:', user.id);
      done(null, user);
    } catch (error) {
      log('Deserialization error:', error);
      done(error);
    }
  });

  // Add error logging to authentication routes
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
          log('Login error after registration:', loginErr);
          return res.status(500).json({ error: "Login failed after registration" });
        }
        // Don't return password to client
        const { password, ...safeUser } = user;
        return res.status(201).json(safeUser);
      });
    } catch (error) {
      log('Registration error:', error);
      res.status(500).json({ error: "Registration failed" });
    }
  });

  app.post("/api/login", (req, res, next) => {
    log('Login attempt for user:', req.body.username);
    passport.authenticate("local", (err: Error | null, user: Express.User | false, info: AuthInfo) => {
      if (err) {
        log('Login error:', err);
        return next(err);
      }
      if (!user) {
        log('Login failed:', info?.message);
        return res.status(401).json({ error: info?.message || "Authentication failed" });
      }
      req.login(user, (loginErr: Error | null) => {
        if (loginErr) {
          log('Login error:', loginErr);
          return next(loginErr);
        }
        log('Login successful for user:', user.username);
        // Don't return password to client
        const { password, ...safeUser } = user;
        return res.json(safeUser);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res) => {
    const username = req.user?.username;
    req.logout((err: Error | null) => {
      if (err) {
        log('Logout error:', err);
        return res.status(500).json({ error: "Logout failed" });
      }
      log('Logout successful for user:', username);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      log('Unauthenticated access attempt to /api/user');
      return res.status(401).json({ error: "Not authenticated" });
    }

    log('User data retrieved for:', req.user.username);
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