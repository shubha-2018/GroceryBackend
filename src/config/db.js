import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { initFileStore } from '../database/fileStore.js';

dotenv.config();

// Track whether MySQL is currently connected
export let isDbConnected = false;

const isRemoteHost = (host) => {
  if (!host) return false;
  return host !== 'localhost' && host !== '127.0.0.1' && host !== '::1';
};

const getPoolConfig = () => {
  const connUri = process.env.DATABASE_URL || process.env.MYSQL_URL;
  if (connUri) {
    const needSsl = process.env.DB_SSL !== 'false';
    return {
      uri: connUri,
      ssl: needSsl ? { rejectUnauthorized: false } : undefined,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      charset: 'utf8mb4'
    };
  }

  const host = process.env.DB_HOST || 'localhost';
  const needSsl = process.env.DB_SSL === 'true' || (isRemoteHost(host) && process.env.DB_SSL !== 'false');

  return {
    host,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'grocery_mart_db',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    charset: 'utf8mb4',
    ssl: needSsl ? { rejectUnauthorized: false } : undefined
  };
};

// Create MySQL connection pool
const pool = mysql.createPool(getPoolConfig());

// Test connection and log status
export const testDbConnection = async () => {
  // Always initialize file-based persistent store as failover guarantee
  initFileStore();

  try {
    const connection = await pool.getConnection();
    isDbConnected = true;
    console.log(`✅ [MySQL] Successfully connected to database: '${process.env.DB_NAME || 'grocery_mart_db'}'`);
    connection.release();
    return true;
  } catch (error) {
    isDbConnected = false;
    console.warn(`⚠️ [MySQL] Could not connect to MySQL server (${error.message})`);
    console.log('💡 [Storage] Running in Persistent JSON Store mode: all product & order operations will persist in /data.');
    return false;
  }
};

export default pool;
