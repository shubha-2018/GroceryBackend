import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { initialCategories, initialProducts, initialOffers } from './initialData.js';

dotenv.config();

const isRemoteHost = (host) => {
  if (!host) return false;
  return host !== 'localhost' && host !== '127.0.0.1' && host !== '::1';
};

export const initializeDatabase = async () => {
  const host = process.env.DB_HOST || 'localhost';
  const needSsl = process.env.DB_SSL === 'true' || (isRemoteHost(host) && process.env.DB_SSL !== 'false');
  const dbName = process.env.DB_NAME || 'grocery_mart_db';

  console.log(`\n⏳ [MySQL Init] Initializing MySQL Database: '${dbName}'...`);

  let connection;
  try {
    const connUri = process.env.DATABASE_URL || process.env.MYSQL_URL;
    if (connUri) {
      connection = await mysql.createConnection({
        uri: connUri,
        ssl: needSsl ? { rejectUnauthorized: false } : undefined
      });
    } else {
      // Connect with database if remote or without if local
      const connConfig = {
        host,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        port: parseInt(process.env.DB_PORT || '3306', 10),
        ssl: needSsl ? { rejectUnauthorized: false } : undefined
      };

      try {
        connection = await mysql.createConnection(connConfig);
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
        await connection.query(`USE \`${dbName}\`;`);
        console.log(`✅ [MySQL Init] Database '${dbName}' verified/created.`);
      } catch (dbCreateErr) {
        // Many cloud MySQL providers (Aiven, TiDB, Clever Cloud) already assign a database and forbid CREATE DATABASE
        if (connection) await connection.end();
        connection = await mysql.createConnection({
          ...connConfig,
          database: dbName
        });
        console.log(`✅ [MySQL Init] Connected directly to pre-existing cloud database: '${dbName}'`);
      }
    }

    // 4. Create Tables
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`users\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`name\` VARCHAR(100) NOT NULL,
        \`email\` VARCHAR(150) NOT NULL UNIQUE,
        \`password\` VARCHAR(255) NOT NULL,
        \`phone\` VARCHAR(20) DEFAULT NULL,
        \`address\` TEXT DEFAULT NULL,
        \`role\` ENUM('customer', 'admin') DEFAULT 'customer',
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`categories\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`name\` VARCHAR(100) NOT NULL UNIQUE,
        \`slug\` VARCHAR(100) NOT NULL UNIQUE,
        \`image_url\` VARCHAR(500) DEFAULT NULL,
        \`description\` VARCHAR(255) DEFAULT NULL,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`products\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`name\` VARCHAR(200) NOT NULL,
        \`category_name\` VARCHAR(100) NOT NULL,
        \`qty\` VARCHAR(50) NOT NULL,
        \`price\` VARCHAR(50) NOT NULL,
        \`price_numeric\` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        \`original_price\` VARCHAR(50) DEFAULT NULL,
        \`discount\` VARCHAR(20) DEFAULT NULL,
        \`rating\` DECIMAL(2,1) DEFAULT 4.5,
        \`image_url\` MEDIUMTEXT NOT NULL,
        \`description\` TEXT DEFAULT NULL,
        \`is_popular\` BOOLEAN DEFAULT FALSE,
        \`is_deal\` BOOLEAN DEFAULT FALSE,
        \`stock\` INT DEFAULT 100,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`orders\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`order_number\` VARCHAR(50) NOT NULL UNIQUE,
        \`user_id\` INT DEFAULT NULL,
        \`customer_name\` VARCHAR(100) NOT NULL,
        \`customer_email\` VARCHAR(150) NOT NULL,
        \`customer_phone\` VARCHAR(20) DEFAULT NULL,
        \`delivery_address\` TEXT DEFAULT NULL,
        \`total_amount\` VARCHAR(50) NOT NULL,
        \`total_numeric\` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        \`payment_method\` VARCHAR(50) DEFAULT 'Cash on Delivery',
        \`payment_status\` ENUM('Pending', 'Paid', 'Failed') DEFAULT 'Pending',
        \`order_status\` ENUM('Order Placed', 'Processing', 'Out for Delivery', 'Delivered', 'Cancelled') DEFAULT 'Order Placed',
        \`status_color\` VARCHAR(20) DEFAULT '#ff9800',
        \`eta\` VARCHAR(100) DEFAULT 'Arriving in 10-15 mins',
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`order_items\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`order_id\` INT NOT NULL,
        \`product_name\` VARCHAR(200) NOT NULL,
        \`qty\` VARCHAR(50) NOT NULL,
        \`quantity\` INT NOT NULL DEFAULT 1,
        \`price\` VARCHAR(50) NOT NULL,
        \`item_total\` VARCHAR(50) DEFAULT NULL,
        FOREIGN KEY (\`order_id\`) REFERENCES \`orders\`(\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`offers\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`title\` VARCHAR(100) NOT NULL,
        \`subtitle\` VARCHAR(100) DEFAULT 'UP TO',
        \`discount\` VARCHAR(50) NOT NULL,
        \`coupon_code\` VARCHAR(50) DEFAULT NULL,
        \`image_url\` MEDIUMTEXT NOT NULL,
        \`bg_class\` VARCHAR(50) DEFAULT 'offer-green',
        \`link_tab\` VARCHAR(50) DEFAULT 'Offers',
        \`is_active\` BOOLEAN DEFAULT TRUE,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`contact_messages\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`name\` VARCHAR(100) NOT NULL,
        \`email\` VARCHAR(150) NOT NULL,
        \`subject\` VARCHAR(200) NOT NULL,
        \`message\` TEXT NOT NULL,
        \`status\` ENUM('Unread', 'Read', 'Resolved') DEFAULT 'Unread',
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Modify products image_url to MEDIUMTEXT if needed
    try {
      await connection.query('ALTER TABLE `products` MODIFY `image_url` MEDIUMTEXT NOT NULL;');
    } catch (e) {}

    console.log(`✅ [MySQL Init] All tables verified/created successfully.`);

    // 5. Seed Categories if empty
    const [existingCategories] = await connection.query('SELECT COUNT(*) as count FROM categories');
    if (existingCategories[0].count === 0) {
      console.log(`🌱 [MySQL Init] Seeding initial categories...`);
      for (const cat of initialCategories) {
        await connection.query(
          'INSERT INTO categories (name, slug, image_url, description) VALUES (?, ?, ?, ?)',
          [cat.name, cat.slug, cat.image_url, cat.description]
        );
      }
      console.log(`✅ [MySQL Init] ${initialCategories.length} categories seeded.`);
    }

    // 6. Seed Products if empty
    const [existingProducts] = await connection.query('SELECT COUNT(*) as count FROM products');
    if (existingProducts[0].count === 0) {
      console.log(`🌱 [MySQL Init] Seeding initial products...`);
      for (const prod of initialProducts) {
        await connection.query(
          `INSERT INTO products (name, category_name, qty, price, price_numeric, image_url, is_popular, is_deal) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [prod.name, prod.category_name, prod.qty, prod.price, prod.price_numeric, prod.image_url, prod.is_popular, prod.is_deal]
        );
      }
      console.log(`✅ [MySQL Init] ${initialProducts.length} products seeded.`);
    }

    // 7. Seed Offers if empty
    const [existingOffers] = await connection.query('SELECT COUNT(*) as count FROM offers');
    if (existingOffers[0].count === 0) {
      console.log(`🌱 [MySQL Init] Seeding initial offers...`);
      for (const off of initialOffers) {
        await connection.query(
          `INSERT INTO offers (title, subtitle, discount, coupon_code, image_url, bg_class, link_tab)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [off.title, off.subtitle, off.discount, off.coupon_code, off.image_url, off.bg_class, off.link_tab]
        );
      }
      console.log(`✅ [MySQL Init] ${initialOffers.length} offers seeded.`);
    }

    // 8. Seed Default Admin User if not exists
    const [existingAdmin] = await connection.query("SELECT id FROM users WHERE email = 'admin@grocerymart.com'");
    if (existingAdmin.length === 0) {
      console.log(`🌱 [MySQL Init] Seeding default administrator account...`);
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      await connection.query(
        "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
        ['System Administrator', 'admin@grocerymart.com', hashedPassword, 'admin']
      );
      console.log(`✅ [MySQL Init] Admin account created: admin@grocerymart.com (pass: admin123)`);
    }

    console.log(`🎉 [MySQL Init] Database setup and seeding complete!\n`);
  } catch (error) {
    console.warn(`ℹ️ [MySQL Init] MySQL not initialized: ${error.message}`);
    console.log(`💡 [MySQL Init] Server will operate seamlessly using persistent JSON file store.`);
  } finally {
    if (connection) {
      try {
        await connection.end();
      } catch (e) {}
    }
  }
};

// If executed directly from command line: `node src/database/initDb.js`
if (process.argv[1]?.endsWith('initDb.js')) {
  initializeDatabase().then(() => process.exit(0));
}
