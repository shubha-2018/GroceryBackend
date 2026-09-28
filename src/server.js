import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes/index.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';
import { testDbConnection } from './config/db.js';
import { initializeDatabase } from './database/initDb.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration - allow Vite dev server, production store, and separate Vercel admin URL
const allowedOrigins = [
  'http://localhost:5173', 
  'http://localhost:3000', 
  'http://127.0.0.1:5173', 
  process.env.CLIENT_URL,
  process.env.ADMIN_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow server-to-server or tools without origin (like Postman or curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    return callback(null, true); // Permissive in dev/production with credentials
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

import path from 'path';

// Body parsing middlewares - support direct image uploads up to 50MB
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve static uploaded files
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${req.method}] ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Root welcome route
app.get('/', (req, res) => {
  res.json({
    message: '🥬 Grocery Mart Express & MySQL Backend API is running smoothly!',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      products: '/api/products',
      orders: '/api/orders',
      contact: '/api/contact'
    }
  });
});

// Mount all API routes under /api
app.use('/api', apiRoutes);

// Error handling middlewares
app.use(notFoundHandler);
app.use(errorHandler);

// Start server and initialize DB
const startServer = async () => {
  try {
    // 1. Ensure database and tables are created and seeded
    await initializeDatabase();

    // 2. Test pool connectivity
    const isConnected = await testDbConnection();
    if (!isConnected) {
      console.warn('⚠️ [Server] MySQL not connected yet. Server is still listening for requests.');
    }

    app.listen(PORT, () => {
      console.log(`\n🚀 [Server] Grocery Mart Backend running on: http://localhost:${PORT}`);
      console.log(`📡 [API Health Check]: http://localhost:${PORT}/api/health`);
      console.log(`🛒 [Products API]: http://localhost:${PORT}/api/products\n`);
    });
  } catch (error) {
    console.error('❌ [Server Launch Error]:', error.message);
  }
};

startServer();

export default app;
