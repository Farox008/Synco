import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import routes from './routes';
import { errorHandler } from './middlewares/errorHandler';

const app = express();

// Security Middlewares
app.use(helmet());

// CORS Configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Cookie & Body parsing
app.use(cookieParser());
app.use(express.json());

// API Routes
app.use('/api', routes);

// Global Error Handler
app.use(errorHandler);

export default app;
