import express, { type Request, Response, NextFunction } from "express";
import cors from 'cors';
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { setupAuth } from "./auth";
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  try {
    log('Creating Express application...');
    const app = express();

    // Set trust proxy for proper handling of HTTPS in production
    app.set('trust proxy', 1);
    log('Trust proxy setting enabled');

    // Health check endpoint
    app.get('/health', (_req, res) => {
      res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    // Configure CORS before other middleware
    log('Configuring CORS...');
    const isProd = process.env.NODE_ENV === 'production';
    const corsOptions = {
      origin: true, // Reflects the request origin. In production, this will be the Replit domain
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      exposedHeaders: ['Set-Cookie'],
    };
    app.use(cors(corsOptions));
    log('CORS configured with credentials support');

    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));

    // Request logging middleware
    app.use((req, res, next) => {
      const start = Date.now();
      res.on("finish", () => {
        const duration = Date.now() - start;
        log(`${req.method} ${req.path} ${res.statusCode} in ${duration}ms`);
      });
      next();
    });

    // Error handling middleware
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      console.error('Error:', err);
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      res.status(status).json({ error: message });
    });

    try {
      log('Setting up authentication...');
      await setupAuth(app);
      log('Authentication setup complete');

      log('Registering routes...');
      const server = registerRoutes(app);
      log('Routes registered successfully');

      if (process.env.NODE_ENV === 'production') {
        log('Setting up static file serving...');
        serveStatic(app);
      } else {
        log('Setting up Vite development server...');
        await setupVite(app, server);
        log('Vite development server setup complete');
      }

      // ALWAYS serve on port 5000 as required by the workflow
      const port = 5000;
      const host = '0.0.0.0';

      server.listen(port, host, () => {
        log(`Server running on http://${host}:${port}`);
        log(`Environment: ${process.env.NODE_ENV || 'development'}`);
        log(`Server bound to address: ${host}`);
        log(`CORS: enabled with credentials`);
        log(`Trust proxy: enabled`);
      });

    } catch (error) {
      log('Error during server initialization:', error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }

  } catch (error) {
    console.error('Fatal server error:', error);
    process.exit(1);
  }
}

// Start the server
startServer().catch(error => {
  console.error('Server startup failed:', error);
  process.exit(1);
});