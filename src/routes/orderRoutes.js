import express from 'express';
import {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus
} from '../controllers/orderController.js';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public / User routes
router.post('/', createOrder);
router.get('/my-orders', getUserOrders);
router.get('/:id', getOrderById);

// Admin order status update
router.put('/:id/status', authenticateToken, requireAdmin, updateOrderStatus);

export default router;
