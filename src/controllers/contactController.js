import pool, { isDbConnected } from '../config/db.js';
import fileStore from '../database/fileStore.js';

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

    if (!isDbConnected) {
      const msg = fileStore.submitContact(req.body);
      return res.status(201).json({
        success: true,
        message: 'Thank you for reaching out! Our support team will get back to you shortly.',
        ticketId: msg.id
      });
    }

    try {
      const [result] = await pool.query(
        'INSERT INTO contact_messages (name, email, subject, message) VALUES (?, ?, ?, ?)',
        [name, email, subject || 'General Query', message]
      );

      fileStore.submitContact(req.body);

      res.status(201).json({
        success: true,
        message: 'Thank you for reaching out! Our support team will get back to you shortly.',
        ticketId: result.insertId
      });
    } catch (dbErr) {
      const msg = fileStore.submitContact(req.body);
      res.status(201).json({
        success: true,
        message: 'Thank you for reaching out! Our support team will get back to you shortly.',
        ticketId: msg.id
      });
    }
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/contact (Admin)
// @desc    Get all contact messages
export const getContactMessages = async (req, res, next) => {
  try {
    if (!isDbConnected) {
      const msgs = fileStore.getContactMessages();
      return res.json({
        success: true,
        count: msgs.length,
        data: msgs
      });
    }

    try {
      const [messages] = await pool.query('SELECT * FROM contact_messages ORDER BY created_at DESC');
      res.json({
        success: true,
        count: messages.length,
        data: messages
      });
    } catch (dbErr) {
      const msgs = fileStore.getContactMessages();
      res.json({
        success: true,
        count: msgs.length,
        data: msgs
      });
    }
  } catch (error) {
    next(error);
  }
};
