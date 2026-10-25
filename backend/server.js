import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import routes from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { config } from './config/index.js';

const app = express();

// Security HTTP headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// CORS configuration - allow explicit frontend origins, wildcard, or any client on port 5173
app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (e.g. curl, tests, postman)
    if (!origin) return callback(null, true);
    
    // Allow wildcard or explicit matches
    if (
      config.frontendOrigins.includes('*') ||
      config.frontendOrigins.includes(origin) ||
      origin.includes(':5173') ||
      origin.includes('localhost')
    ) {
      return callback(null, true);
    }
    return callback(new Error(`Origin '${origin}' not allowed by CORS`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Rate limiting for API protection
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // max 300 requests per 15 minutes per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'TooManyRequests',
    message: 'Too many requests from this IP, please try again later.',
  },
});
app.use('/api', limiter);

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Mount all API routes
app.use('/api', routes);

// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'NotFound',
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// Centralized error handler
app.use(errorHandler);

// Start server whenever not running under automated tests (compatible with node and pm2)
if (process.env.NODE_ENV !== 'test') {
  const HOST = '0.0.0.0';
  const server = app.listen(config.port, HOST, () => {

    console.log(`\n=================================================`);
    console.log(`  CloudRescue API Server running on port ${config.port}`);
    console.log(`  Environment: ${config.nodeEnv}`);
    console.log(`  Allowed Origins: ${config.frontendOrigins.join(', ')}`);
    console.log(`  S3 Bucket: ${config.aws.bucketName || '[NOT CONFIGURED]'}`);
    console.log(`  SNS Topic: ${config.aws.snsTopicArn ? '[CONFIGURED]' : '[DISABLED]'}`);
    console.log(`  Health Check: http://localhost:${config.port}/api/health`);
    console.log(`=================================================\n`);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => console.log('HTTP server closed'));
  });
}

export default app;
