import express from 'express';
import authRoutes from './authRoutes.js';
import productRoutes from './productRoutes.js';
import orderRoutes from './orderRoutes.js';
import contactRoutes from './contactRoutes.js';
import offerRoutes from './offerRoutes.js';
import uploadRoutes from './uploadRoutes.js';

const router = express.Router();

// Health Check
router.get('/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'Grocery Mart API',
    uptime: process.uptime()
  });
});

// Mount modular sub-routes
router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/offers', offerRoutes);
router.use('/contact', contactRoutes);
router.use('/upload', uploadRoutes);

export default router;
