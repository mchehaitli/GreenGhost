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

      if (process.env.NODE_ENV === 'production') {
        log('Setting up static file serving...');
        app.use(express.static(path.resolve(__dirname, '../dist/public')));
        app.get('*', (_req, res) => {
          res.sendFile(path.resolve(__dirname, '../dist/public/index.html'));
        });
      } else {
        log('Setting up Vite development server...');
        await setupVite(app, server);
        log('Vite development server setup complete');
      }

      // Fixed port handling
      const port = process.env.PORT ? parseInt(process.env.PORT) : 5000;

      let isListening = false;
      let retries = 0;
      const maxRetries = 3;

      while (!isListening && retries < maxRetries) {
        try {
          await new Promise<void>((resolve, reject) => {
            const cleanup = () => {
              server.removeListener('error', onError);
              server.removeListener('listening', onListening);
            };

            const onError = (error: NodeJS.ErrnoException) => {
              cleanup();
              if (error.code === 'EADDRINUSE') {
                log(`Port ${port + retries} is in use`);
                reject(new Error(`Port ${port + retries} is already in use`));
              } else {
                reject(error);
              }
            };

            const onListening = () => {
              cleanup();
              resolve();
            };

            server.once('error', onError);
            server.once('listening', onListening);

            server.listen(port + retries, '0.0.0.0');
          });

          isListening = true;
          log(`Server running at http://0.0.0.0:${port + retries}`);
          log('Environment:', process.env.NODE_ENV || 'development');
          log('CORS:', 'enabled for all origins');

        } catch (error) {
          if (retries === maxRetries - 1) {
            throw new Error(`Could not find an available port after ${maxRetries} attempts`);
          }
          retries++;
        }
      }

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