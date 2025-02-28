import express, { type Request, Response, NextFunction } from "express";
import cors from 'cors';
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { setupAuth } from "./auth";
import { errorHandler } from "./middleware/error-handler";
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
      origin: true,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    }));

    // Parse JSON and URL-encoded bodies
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));

    // API route handler - ensure JSON responses for /api routes
    app.use('/api', (req, res, next) => {
      res.setHeader('Content-Type', 'application/json');
      next();
    });

    // Request logging middleware
    app.use((req, res, next) => {
      const start = Date.now();
      res.on("finish", () => {
        const duration = Date.now() - start;
        log(`${req.method} ${req.path} ${res.statusCode} in ${duration}ms`);
      });
      next();
    });

    try {
      log('Setting up authentication...');
      setupAuth(app);
      log('Authentication setup complete');

      log('Registering routes...');
      const server = registerRoutes(app);
      log('Routes registered successfully');

      // Add error handling middleware
      app.use(errorHandler);

      // Setup Vite or static files after API routes,
      // but only for non-API routes
      if (process.env.NODE_ENV === 'production') {
        log('Setting up static file serving...');
        app.use((req, res, next) => {
          if (req.path.startsWith('/api/')) {
            return next();
          }
          express.static(path.resolve(__dirname, '../dist/public'))(req, res, next);
        });

        app.get('*', (req, res, next) => {
          if (req.path.startsWith('/api/')) {
            return next();
          }
          res.sendFile(path.resolve(__dirname, '../dist/public/index.html'));
        });
      } else {
        log('Setting up Vite development server...');
        await setupVite(app, server);
        log('Vite development server setup complete');
      }

      // Try different ports if 5000 is in use
      const tryPort = async (port: number, maxAttempts = 3): Promise<number> => {
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
          try {
            await new Promise((resolve, reject) => {
              server.listen(port).once('listening', resolve).once('error', reject);
            });
            return port;
          } catch (error) {
            if (attempt === maxAttempts - 1) throw error;
            port++;
            log(`Port ${port - 1} in use, trying port ${port}...`);
          }
        }
        throw new Error('Could not find available port');
      };

      const startPort = process.env.PORT ? parseInt(process.env.PORT) : 5000;
      const port = await tryPort(startPort);

      log(`Server running at http://0.0.0.0:${port}`);
      log('Environment:', process.env.NODE_ENV || 'development');
      log('CORS:', 'enabled for all origins');

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