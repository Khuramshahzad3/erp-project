import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';
import { globalLimiter } from './middleware/rateLimit.middleware';
import { errorHandler } from './middleware/error.middleware';


import authRoutes from './modules/auth/auth.routes';
import customerRoutes from './modules/customers/customers.routes';
import productRoutes from './modules/products/products.routes';
import orderRoutes from './modules/orders/orders.routes';
import auditLogsRoutes from './modules/auditLogs/auditLogs.routes';
import dashboardRoutes from './modules/dashboard/dashboard.routes';

const app = express();


app.use(helmet());


app.use(
  cors({
    origin: (_origin, callback) => {
      callback(null, true);
    },
    credentials: true,
  })
);


app.use(globalLimiter);


app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get('/', (req, res) => {
  const dbStatus = mongoose.connection.readyState as 0 | 1 | 2 | 3;
  const statusMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };
  
  res.status(200).json({
    success: true,
    message: 'Welcome to ERP Sales & Customer Management System REST API',
    apiStatus: 'online',
    databaseConnection: statusMap[dbStatus] || 'unknown',
    environment: process.env.VERCEL ? 'vercel-serverless' : 'local-development',
    timestamp: new Date().toISOString(),
    clientIp: req.ip,
  });
});


app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/audit-logs', auditLogsRoutes);
app.use('/api/dashboard', dashboardRoutes);


app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Endpoint ${req.originalUrl} not found`,
    },
  });
});


app.use(errorHandler);

export default app;
