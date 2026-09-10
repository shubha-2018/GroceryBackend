import pool from '../config/db.js';

// Helper to generate readable Order ID like GM-98231
const generateOrderNumber = () => {
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  return `GM-${randomNum}`;
};

// @route   POST /api/orders
// @desc    Create a new grocery order
export const createOrder = async (req, res, next) => {
  const connection = await pool.getConnection();
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
        payment_method === 'Online' ? 'Paid' : 'Pending',
        'Order Placed',
        '#ff9800',
        'Arriving in 10-15 mins'
      ]
    );

    const orderId = orderResult.insertId;

    // 2. Insert order items
    for (const item of items) {
      await connection.query(
        `INSERT INTO order_items (order_id, product_name, qty, quantity, price, item_total)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          item.name || item.product_name,
          item.qty || '1 unit',
          item.quantity || 1,
          item.price || '₹0.00',
          item.item_total || item.price || '₹0.00'
        ]
      );
    }

    await connection.commit();

    // Return the created order details
    const [createdOrder] = await connection.query('SELECT * FROM orders WHERE id = ?', [orderId]);
    const [createdItems] = await connection.query('SELECT * FROM order_items WHERE order_id = ?', [orderId]);

    res.status(201).json({
      success: true,
      message: '🎉 Order placed successfully!',
      order: {
        ...createdOrder[0],
        items: createdItems
      }
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

// @route   GET /api/orders/my-orders
// @desc    Get orders for current user (or query by email)
export const getUserOrders = async (req, res, next) => {
  try {
    const userEmail = req.user ? req.user.email : req.query.email;
    const userId = req.user ? req.user.id : null;

    let query = 'SELECT * FROM orders WHERE 1=1';
    const params = [];

    if (userId) {
      query += ' AND (user_id = ? OR customer_email = ?)';
      params.push(userId, userEmail);
    } else if (userEmail) {
      query += ' AND customer_email = ?';
      params.push(userEmail);
    } else {
      // If not logged in and no email, return recent sample orders or empty
      query += ' ORDER BY created_at DESC LIMIT 10';
    }

    if (userId || userEmail) {
      query += ' ORDER BY created_at DESC';
    }

    const [orders] = await pool.query(query, params);

    // Fetch items for each order
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const [items] = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
        return {
          ...order,
          items
        };
      })
    );

    res.json({
      success: true,
      count: ordersWithItems.length,
      orders: ordersWithItems
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/orders/:id
// @desc    Get order by ID or order_number
export const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [orders] = await pool.query(
      'SELECT * FROM orders WHERE id = ? OR order_number = ?',
      [id, id]
    );

    if (orders.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const order = orders[0];
    const [items] = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [order.id]);

    res.json({
      success: true,
      order: {
        ...order,
        items
      }
    });
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

    await pool.query(
      `UPDATE orders SET 
         order_status = COALESCE(?, order_status),
         status_color = COALESCE(?, status_color),
         eta = COALESCE(?, eta),
         payment_status = COALESCE(?, payment_status)
       WHERE id = ?`,
      [order_status, status_color, eta, payment_status, id]
    );

    const [updated] = await pool.query('SELECT * FROM orders WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Order status updated successfully',
      order: updated[0]
    });
  } catch (error) {
    next(error);
  }
};
