import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/auth';
import postRoutes from './routes/posts';
import followRoutes from './routes/follow';
import feedRoutes from './routes/feed';
import userRoutes from './routes/users';
import { errorHandler } from './middleware/errorHandler';
import { initDatabase } from './database/init';
import { startTokenCleanupJob } from './jobs/tokenCleanup';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
});

const rateLimitMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (req.path.startsWith('/api/feed') || req.path.startsWith('/api/posts')) {
    return next();
  }
  return limiter(req, res, next);
};

app.use(helmet());

// CORS Configuration with better error handling
const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    console.log('CORS Origin:', origin); // Debug log
    
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = process.env.NODE_ENV === 'production' 
      ? (process.env.ALLOWED_ORIGINS?.split(',') || [
          'https://news-feed-1u2wokysp-nanmaxs-projects.vercel.app',
          'https://news-feed-50swxy1fn-nanmaxs-projects.vercel.app'
        ])
      : ['http://localhost:3000', 'http://127.0.0.1:3000'];
    
    // Check if origin is allowed or matches Vercel pattern
    const isVercelDomain = /^https:\/\/.*\.vercel\.app$/.test(origin);
    const isAllowed = allowedOrigins.includes(origin) || isVercelDomain;
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.error('CORS Error: Origin not allowed:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200 // For legacy browser support
};

app.use(cors(corsOptions));
app.use(rateLimitMiddleware);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV 
  });
});

app.use('/api', authRoutes);
app.use('/api', postRoutes);
app.use('/api', followRoutes);
app.use('/api', feedRoutes);
app.use('/api', userRoutes);

app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use(errorHandler);

const startServer = async () => {
  try {
    await initDatabase();
    console.log('Database initialized successfully');
    
    startTokenCleanupJob();
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;