import express, { type Request, Response, NextFunction } from "express";
import cors from 'cors';
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { setupAuth } from "./auth";

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
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:5000',
      'http://127.0.0.1:5000',
      'https://greenghost.io',
      'https://www.greenghost.io',
      'https://greenghost.netlify.app'
    ];

    const corsOptions = {
      origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        log(`CORS request from origin: ${origin}`);
        
        // Check against allowed origins list
        if (allowedOrigins.includes(origin)) {
          log(`Origin ${origin} allowed`);
          return callback(null, true);
        }
        
        // Allow all Replit development domains
        if (origin.includes('.replit.dev') || origin.includes('.janeway.replit.dev')) {
          log(`Replit development origin ${origin} allowed`);
          return callback(null, true);
        }
        
        log(`Origin ${origin} rejected`);
        return callback(new Error(`Not allowed by CORS policy: ${origin}`), false);
      },
      credentials: true, // Important for cookies
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Cookie'],
      exposedHeaders: ['Set-Cookie', 'X-Auth-Success'],
      maxAge: 86400 // Cache preflight requests for 24 hours
    };
    app.use(cors(corsOptions));
    log('CORS configured with specific origins and credentials support');

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

      // Use environment PORT or default to 5000 for development
      const port = process.env.PORT ? parseInt(process.env.PORT) : 5000;
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