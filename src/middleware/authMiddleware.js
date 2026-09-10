import jwt from 'jsonwebtoken';
import pool from '../config/db.js';

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No authentication token provided.'
    });
  }

  try {
    const secret = process.env.JWT_SECRET || 'grocery_mart_super_secret_jwt_key_2026_xyz';
    const decoded = jwt.verify(token, secret);

    // Fetch user details from DB
    const [rows] = await pool.query('SELECT id, name, email, phone, address, role FROM users WHERE id = ?', [decoded.id]);
    
    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token: User no longer exists.'
      });
    }

    req.user = rows[0];
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired authentication token.'
    });
  }
};

export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied: Admin privileges required.'
    });
  }
  next();
};
