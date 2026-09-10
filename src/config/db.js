import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Create MySQL connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'grocery_mart_db',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4'
});

// Test connection and log status
export const testDbConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log(`✅ [MySQL] Successfully connected to database: ${process.env.DB_NAME || 'grocery_mart_db'}`);
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ [MySQL] Database connection error:', error.message);
    console.error('💡 Tip: Make sure MySQL server is running (e.g. via XAMPP, MySQL Workbench, or local service) and credentials in backend/.env match.');
    return false;
  }
};

export default pool;
