import pool from '../config/db.js';

// @route   POST /api/contact
// @desc    Submit a contact / help support message
export const submitContactMessage = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and message are required.'
      });
    }

    const [result] = await pool.query(
      'INSERT INTO contact_messages (name, email, subject, message) VALUES (?, ?, ?, ?)',
      [name, email, subject || 'General Query', message]
    );

    res.status(201).json({
      success: true,
      message: 'Thank you for reaching out! Our support team will get back to you shortly.',
      ticketId: result.insertId
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/contact (Admin)
// @desc    Get all contact messages
export const getContactMessages = async (req, res, next) => {
  try {
    const [messages] = await pool.query('SELECT * FROM contact_messages ORDER BY created_at DESC');

    res.json({
      success: true,
      count: messages.length,
      data: messages
    });
  } catch (error) {
    next(error);
  }
};
