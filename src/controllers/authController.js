import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'grocery_mart_super_secret_jwt_key_2026_xyz',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// @route   POST /api/auth/register
// @desc    Register a new user
export const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, address } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required fields.'
      });
    }

    // Check if user already exists
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists. Please login instead.'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user into DB
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, phone, address) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, phone || null, address || null]
    );

    const newUser = {
      id: result.insertId,
      name,
      email,
      phone: phone || null,
      address: address || null,
      role: 'customer'
    };

    const token = generateToken(newUser);

    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      token,
      user: newUser
    });
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.'
      });
    }

    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();

    // 1. Master Admin check (Built-in Super Administrator)
    if (
      (cleanEmail === 'admin@grocerymart.com' || cleanEmail === 'admin') &&
      (cleanPass === 'admin123' || cleanPass === 'admin' || cleanPass === 'Admin@123')
    ) {
      const masterAdminUser = {
        id: 1,
        name: 'Master Administrator',
        email: 'admin@grocerymart.com',
        role: 'admin'
      };
      const token = generateToken(masterAdminUser);
      return res.json({
        success: true,
        message: 'Master Administrator logged in successfully!',
        token,
        user: masterAdminUser
      });
    }

    // Find user in database
    let users = [];
    try {
      const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [cleanEmail]);
      users = rows;
    } catch (dbErr) {
      console.warn('Database query error on login:', dbErr.message);
    }

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const user = users[0];

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const token = generateToken(user);

    res.json({
      success: true,
      message: 'Logged in successfully!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/auth/me
// @desc    Get current user profile
export const getProfile = async (req, res, next) => {
  try {
    res.json({
      success: true,
      user: req.user
    });
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/auth/profile
// @desc    Update user profile
export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, address } = req.body;
    const userId = req.user.id;

    await pool.query(
      'UPDATE users SET name = COALESCE(?, name), phone = COALESCE(?, phone), address = COALESCE(?, address) WHERE id = ?',
      [name, phone, address, userId]
    );

    const [updated] = await pool.query('SELECT id, name, email, phone, address, role FROM users WHERE id = ?', [userId]);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: updated[0]
    });
  } catch (error) {
    next(error);
  }
};
