import pool, { isDbConnected } from '../config/db.js';
import fileStore from '../database/fileStore.js';

// Helper to generate readable Order ID like GM-98231
const generateOrderNumber = () => {
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  return `GM-${randomNum}`;
};

// @route   POST /api/orders
// @desc    Create a new grocery order
export const createOrder = async (req, res, next) => {
  try {
    const {
      customer_name,
      customer_email,
      customer_phone,
      delivery_address,
      items,
      total_amount,
      total_numeric,
      payment_method
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart items cannot be empty to place an order.'
      });
    }

    if (!customer_name || !customer_email) {
      return res.status(400).json({
        success: false,
        message: 'Customer name and email are required.'
      });
    }

    if (!isDbConnected) {
      const newOrder = fileStore.createOrder(req.body);
      return res.status(201).json({
        success: true,
        message: 'Order placed successfully! Delivery partner assigned.',
        orderNumber: newOrder.order_number,
        order: newOrder
      });
    }

    let connection;
    try {
      connection = await pool.getConnection();
      const orderNumber = generateOrderNumber();
      const userId = req.user ? req.user.id : null;
      const finalTotal = total_amount || `₹${Number(total_numeric || 0).toFixed(2)}`;
      const numericTotal = total_numeric || parseFloat(String(total_amount).replace(/[^0-9.]/g, '')) || 0;

      await connection.beginTransaction();

      // 1. Insert into orders table
      const [orderResult] = await connection.query(
        `INSERT INTO orders (
           order_number, user_id, customer_name, customer_email, customer_phone,
           delivery_address, total_amount, total_numeric, payment_method,
           payment_status, order_status, status_color, eta
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          orderNumber,
          userId,
          customer_name,
          customer_email,
          customer_phone || null,
          delivery_address || 'Express Delivery Address',
          finalTotal,
          numericTotal,
          payment_method || 'Cash on Delivery',
          'Pending',
          'Order Placed',
          '#ff9800',
          'Arriving in 10-15 mins'
        ]
      );

      const orderId = orderResult.insertId;

      // 2. Insert items into order_items table
      for (const item of items) {
        await connection.query(
          `INSERT INTO order_items (order_id, product_name, qty, quantity, price, item_total)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            orderId,
            item.name,
            item.qty || '1 unit',
            item.quantity || 1,
            item.price || '₹0.00',
            item.item_total || item.price || '₹0.00'
          ]
        );
      }

      await connection.commit();

      const [createdOrder] = await connection.query('SELECT * FROM orders WHERE id = ?', [orderId]);
      const [orderItems] = await connection.query('SELECT * FROM order_items WHERE order_id = ?', [orderId]);

      const fullOrder = {
        ...createdOrder[0],
        items: orderItems
      };

      fileStore.createOrder(fullOrder);

      res.status(201).json({
        success: true,
        message: 'Order placed successfully! Delivery partner assigned.',
        orderNumber,
        order: fullOrder
      });
    } catch (dbErr) {
      if (connection) await connection.rollback();
      console.warn('MySQL order error, falling back to fileStore:', dbErr.message);
      const newOrder = fileStore.createOrder(req.body);
      res.status(201).json({
        success: true,
        message: 'Order placed successfully! Delivery partner assigned.',
        orderNumber: newOrder.order_number,
        order: newOrder
      });
    } finally {
      if (connection) connection.release();
    }
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/orders
// @desc    Get user's orders or all orders (if admin)
export const getOrders = async (req, res, next) => {
  try {
    if (!isDbConnected) {
      const orders = fileStore.getOrders();
      return res.json({
        success: true,
        count: orders.length,
        data: orders
      });
    }

    try {
      const [orders] = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
      res.json({
        success: true,
        count: orders.length,
        data: orders
      });
    } catch (dbErr) {
      const orders = fileStore.getOrders();
      res.json({
        success: true,
        count: orders.length,
        data: orders
      });
    }
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/orders/my-orders
// @desc    Get orders for current user or customer
export const getUserOrders = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : null;
    const userEmail = req.user ? req.user.email : req.query.email;

    if (!isDbConnected) {
      let orders = fileStore.getOrders();
      if (userEmail) {
        orders = orders.filter(o => o.customer_email === userEmail);
      }
      return res.json({
        success: true,
        count: orders.length,
        data: orders
      });
    }

    try {
      let query = 'SELECT * FROM orders';
      const params = [];

      if (userId) {
        query += ' WHERE user_id = ?';
        params.push(userId);
      } else if (userEmail) {
        query += ' WHERE customer_email = ?';
        params.push(userEmail);
      }
      query += ' ORDER BY created_at DESC';

      const [orders] = await pool.query(query, params);
      res.json({
        success: true,
        count: orders.length,
        data: orders
      });
    } catch (dbErr) {
      let orders = fileStore.getOrders();
      if (userEmail) {
        orders = orders.filter(o => o.customer_email === userEmail);
      }
      res.json({
        success: true,
        count: orders.length,
        data: orders
      });
    }
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/orders/:id
// @desc    Get single order details by ID or order_number
export const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isDbConnected) {
      const order = fileStore.getOrderById(id);
      if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
      return res.json({ success: true, data: order });
    }

    try {
      const isNum = !isNaN(id);
      const query = isNum 
        ? 'SELECT * FROM orders WHERE id = ? OR order_number = ?' 
        : 'SELECT * FROM orders WHERE order_number = ?';
      const params = isNum ? [id, id] : [id];

      const [orders] = await pool.query(query, params);

      if (orders.length === 0) {
        const fallback = fileStore.getOrderById(id);
        if (fallback) return res.json({ success: true, data: fallback });
        return res.status(404).json({ success: false, message: 'Order not found' });
      }

      const order = orders[0];
      const [items] = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [order.id]);

      res.json({
        success: true,
        data: { ...order, items }
      });
    } catch (dbErr) {
      const fallback = fileStore.getOrderById(id);
      if (fallback) return res.json({ success: true, data: fallback });
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/orders/:id/status (Admin)
// @desc    Update order status
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { order_status, status_color, eta, payment_status } = req.body;

    if (!isDbConnected) {
      const updated = fileStore.updateOrderStatus(id, order_status, status_color);
      if (!updated) return res.status(404).json({ success: false, message: 'Order not found' });
      return res.json({
        success: true,
        message: `Order status updated to '${order_status}' successfully!`,
        data: updated
      });
    }

    try {
      const isNum = !isNaN(id);
      const whereClause = isNum ? 'WHERE id = ? OR order_number = ?' : 'WHERE order_number = ?';
      const params = [
        order_status,
        status_color || '#2e7d32',
        eta || 'Updated delivery schedule',
        payment_status || 'Pending',
        id
      ];
      if (isNum) params.push(id);

      await pool.query(
        `UPDATE orders SET 
           order_status = COALESCE(?, order_status),
           status_color = COALESCE(?, status_color),
           eta = COALESCE(?, eta),
           payment_status = COALESCE(?, payment_status)
         ${whereClause}`,
        params
      );

      const [updated] = await pool.query(
        `SELECT * FROM orders ${whereClause}`,
        isNum ? [id, id] : [id]
      );

      fileStore.updateOrderStatus(id, order_status, status_color);

      res.json({
        success: true,
        message: `Order status updated to '${order_status}' successfully!`,
        data: updated[0]
      });
    } catch (dbErr) {
      const updated = fileStore.updateOrderStatus(id, order_status, status_color);
      res.json({
        success: true,
        message: `Order status updated to '${order_status}' successfully!`,
        data: updated
      });
    }
  } catch (error) {
    next(error);
  }
};
