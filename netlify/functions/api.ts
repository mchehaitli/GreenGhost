import express from 'express';
import serverless from 'serverless-http';
import { registerRoutes } from '../../server/routes';
import { setupAuth } from '../../server/auth';
import cors from 'cors';

const app = express();

// Basic middleware
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Trust proxy for Netlify
app.set('trust proxy', 1);

// Setup authentication and routes
setupAuth(app);
registerRoutes(app);

// Export the serverless handler
export const handler = serverless(app) as any;