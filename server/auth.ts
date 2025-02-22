import type { Express } from "express";
import session from "express-session";
import connectPg from "connect-pg-simple";
import pg from 'pg';
import { log } from "./vite";

const PostgresSessionStore = connectPg(session);

// Create a new pg Pool instance for session store
const sessionPool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10
});

export function setupAuth(app: Express) {
  const store = new PostgresSessionStore({
    pool: sessionPool,
    createTableIfMissing: true,
    tableName: 'session',
    pruneSessionInterval: 60
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
      secure: false, // Set to true in production
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
      sameSite: 'lax',
      path: '/'
    },
    name: 'sid',
    rolling: true // Refresh cookie on each request
  };

  log('Setting up session middleware...');
  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
}