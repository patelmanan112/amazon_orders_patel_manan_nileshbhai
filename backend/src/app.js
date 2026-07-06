import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

// Routes
import healthRoutes from './routes/health.routes.js';
import orderRoutes from './routes/order.routes.js';
import searchRoutes from './routes/search.routes.js';
import filterRoutes from './routes/filter.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import statsRoutes from './routes/stats.routes.js';
import shippingRoutes from './routes/shipping.routes.js';
import authRoutes from './routes/auth.routes.js';
import adminRoutes from './routes/admin.routes.js';
import bulkRoutes from './routes/bulk.routes.js';
import errorRoutes from './routes/error.routes.js';
import validateRoutes from './routes/validate.routes.js';
import recommendationsRoutes from './routes/recommendations.routes.js';
import trendingRoutes from './routes/trending.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import activityRoutes from './routes/activity.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import systemRoutes from './routes/system.routes.js';
import metaRoutes from './routes/meta.routes.js';


// Middlewares
import { errorHandler, notFoundHandler } from './middlewares/error.middleware.js';

const app = express();

// Security Middleware
app.use(helmet());

// CORS Configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body Parser Middleware
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ limit: '16kb', extended: true }));
app.use(express.static('public'));

// Logging Middleware
app.use(morgan('combined'));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5000, // Increased limit for development
  message: 'Too many requests from this IP, please try again later.',
});

app.use('/api/', limiter);

// Health Check Route
app.use('/api/v1/health', healthRoutes);

// Auth Routes
app.use('/api/v1/auth', authRoutes);

// Admin Routes
app.use('/api/v1/admin', adminRoutes);

// Search Routes (Must be before Order Routes to avoid /:orderId matching)
app.use('/api/v1/orders/search', searchRoutes);

// Filter Routes (Must be before Order Routes to avoid /:orderId matching)
app.use('/api/v1/orders/filter', filterRoutes);

// Analytics Routes
app.use('/api/v1/analytics', analyticsRoutes);

// Statistics Routes
app.use('/api/v1/stats', statsRoutes);

// Shipping Routes
app.use('/api/v1/shipping', shippingRoutes);

// Bulk Operations Routes (before order routes to avoid /:orderId matching)
app.use('/api/v1/orders/bulk', bulkRoutes);

// Order Routes
app.use('/api/v1/orders', orderRoutes);

// Error Simulation Routes
app.use('/api/v1/errors', errorRoutes);

// Validation Routes
app.use('/api/v1/validate', validateRoutes);

// Advanced Routes
app.use('/api/v1/recommendations', recommendationsRoutes);
app.use('/api/v1/trending', trendingRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/activity', activityRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/system', systemRoutes);

// HEAD & OPTIONS Routes (must be before 404 handler)
app.use('/api/v1', metaRoutes);

// 404 Handler
app.use(notFoundHandler);

// Global Error Handler
app.use(errorHandler);

export default app;
