import express, { type Request, Response, NextFunction } from "express";
import cors from 'cors';
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { setupAuth } from "./auth";

async function startServer() {
  try {
    log('Creating Express application...');
    const app = express();

    // Health check endpoint
    app.get('/health', (_req, res) => {
      res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    // Configure CORS before other middleware
    log('Configuring CORS...');
    app.use(cors({
      origin: process.env.NODE_ENV === 'production' 
        ? process.env.CORS_ORIGIN || false
        : true,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    }));

    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));

    // Request logging middleware
    app.use((req, res, next) => {
      const start = Date.now();
      res.on("finish", () => {
        const duration = Date.now() - start;
        if (req.path.startsWith("/api") || req.path === '/health') {
          log(`${req.method} ${req.path} ${res.statusCode} in ${duration}ms`);
        }
      });
      next();
    });

    if (!process.env.SESSION_SECRET) {
      log('SESSION_SECRET not found, using default development secret');
      process.env.SESSION_SECRET = '0a0df83f14af11c0841035474b9e698664e5be1513c193db84a8b059ca9aef06';
    }

    try {
      log('Setting up authentication...');
      setupAuth(app);
      log('Authentication setup complete');

      log('Registering routes...');
      const server = registerRoutes(app);
      log('Routes registered successfully');

      // Error handling middleware
      app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
        console.error('Error:', err);
        const status = err.status || err.statusCode || 500;
        const message = err.message || "Internal Server Error";
        res.status(status).json({ error: message });
      });

      log('Setting up Vite development server...');
      await setupVite(app, server);
      log('Vite development server setup complete');

      // Server configuration
      const PORT = Number(process.env.PORT) || 5000; // Changed default port to 5000
      const HOST = "0.0.0.0";

      server.listen(PORT, HOST, () => {
        log(`Server running at http://${HOST}:${PORT}`);
        log('Environment:', process.env.NODE_ENV || 'development');
        log('CORS:', process.env.NODE_ENV === 'production' ? process.env.CORS_ORIGIN || 'disabled' : 'all origins (development)');
      });

      // Handle server errors
      server.on('error', (error: NodeJS.ErrnoException) => {
        log('Server error:', error.message);
        if (error.syscall !== 'listen') {
          throw error;
        }

        switch (error.code) {
          case 'EACCES':
            console.error(`Port ${PORT} requires elevated privileges`);
            process.exit(1);
            break;
          case 'EADDRINUSE':
            console.error(`Port ${PORT} is already in use`);
            process.exit(1);
            break;
          default:
            throw error;
        }
      });

    } catch (error) {
      log('Error during server initialization:', error);
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