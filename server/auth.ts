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
import { log } from "./vite";

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

async function getUserByUsername(username: string): Promise<SelectUser | undefined> {
  const [user] = await db.select().from(users).where(eq(users.username, username));
  return user;
}

export function setupAuth(app: Express) {
  const store = new PostgresSessionStore({
    pool: sessionPool,
    createTableIfMissing: true,
    tableName: 'session',
    pruneSessionInterval: 60
  });

  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || 'dev-secret-key',
    resave: false,
    saveUninitialized: false,
    store,
    cookie: {
      secure: false, // Set to false for development
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
      sameSite: 'lax',
      path: '/'
    },
    name: 'sid',
    rolling: true // Refresh the cookie age on each request
  };

  log('Setting up authentication middleware...');

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Initialize the admin user if it doesn't exist
  const initializeAdminUser = async () => {
    try {
      const adminUsername = 'admin';
      const [existingAdmin] = await db
        .select()
        .from(users)
        .where(eq(users.username, adminUsername));

      if (!existingAdmin) {
        const hashedPassword = await hashPassword('password123');
        await db.insert(users).values({
          username: adminUsername,
          password: hashedPassword,
        });
        log('Admin user created successfully');
      }
    } catch (error) {
      console.error('Error initializing admin user:', error);
    }
  };

  initializeAdminUser();

  passport.use(
    new LocalStrategy(async (username: string, password: string, done) => {
      try {
        log(`Attempting login for username: ${username}`);
        const user = await getUserByUsername(username);

        if (!user) {
          log('User not found');
          return done(null, false, { message: "Invalid username or password" });
        }

        const isValid = await comparePasswords(password, user.password);
        if (!isValid) {
          log('Invalid password');
          return done(null, false, { message: "Invalid username or password" });
        }

        log('Login successful');
        return done(null, user);
      } catch (error) {
        console.error("Login error:", error);
        return done(error);
      }
    })
  );

  passport.serializeUser((user, done) => {
    log(`Serializing user: ${user.username}`);
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      log(`Deserializing user ID: ${id}`);
      const [user] = await db.select().from(users).where(eq(users.id, id));
      if (user) {
        log(`User deserialized successfully: ${user.username}`);
      } else {
        log('User not found during deserialization');
      }
      done(null, user || undefined);
    } catch (error) {
      console.error("Deserialization error:", error);
      done(error);
    }
  });

  // Authentication routes
  app.post("/api/login", (req, res, next) => {
    log(`Login attempt for username: ${req.body.username}`);

    passport.authenticate("local", (err: any, user: SelectUser | false, info: { message: string } | undefined) => {
      if (err) {
        log(`Authentication error: ${err.message}`);
        return next(err);
      }

      if (!user) {
        log(`Authentication failed: ${info?.message}`);
        return res.status(401).json({ error: info?.message || "Authentication failed" });
      }

      req.login(user, (err) => {
        if (err) {
          log(`Login error: ${err.message}`);
          return next(err);
        }
        log(`Login successful for: ${user.username}`);
        log(`Session ID: ${req.sessionID}`);
        log(`Session cookie: ${JSON.stringify(req.session.cookie)}`);
        log(`User data in session: ${JSON.stringify(user)}`);
        res.json({ id: user.id, username: user.username });
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    const username = req.user?.username;
    log(`Logout attempt for: ${username}`);

    req.logout((err) => {
      if (err) {
        log(`Logout error: ${err.message}`);
        return next(err);
      }
      log(`Logout successful for: ${username}`);
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/user", (req, res) => {
    log(`Session ID: ${req.sessionID}`);
    log(`Session cookie: ${JSON.stringify(req.session.cookie)}`);
    log(`Is authenticated: ${req.isAuthenticated()}`);
    log(`User in session: ${JSON.stringify(req.user)}`);

    if (!req.isAuthenticated()) {
      log('User not authenticated');
      return res.status(401).json({ error: "Not authenticated" });
    }
    const user = req.user as SelectUser;
    log(`Current user: ${user.username}`);
    res.json({ id: user.id, username: user.username });
  });
}