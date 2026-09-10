import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const initialCategories = [
  { name: 'Fruits & Vegetables', slug: 'fruits-vegetables', image_url: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400&q=80', description: 'Fresh farm fruits and green vegetables' },
  { name: 'Dairy & Breakfast', slug: 'dairy-breakfast', image_url: 'https://images.unsplash.com/photo-1528732263440-4dd1a18a4cc2?w=400&q=80', description: 'Milk, butter, paneer, and eggs' },
  { name: 'Staples & Pulses', slug: 'staples-pulses', image_url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&q=80', description: 'Rice, atta, dal, and cooking oils' },
  { name: 'Snacks & Beverages', slug: 'snacks-beverages', image_url: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=400&q=80', description: 'Chips, biscuits, cold drinks, and sweets' },
  { name: 'Personal Care', slug: 'personal-care', image_url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&q=80', description: 'Soaps, shampoos, oral care, and skin essentials' },
  { name: 'Home Care', slug: 'home-care', image_url: 'https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?w=400&q=80', description: 'Detergents, floor cleaners, and kitchen care' },
  { name: 'Baby Care', slug: 'baby-care', image_url: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&q=80', description: 'Diapers, baby food, and gentle lotions' },
  { name: 'Pet Care', slug: 'pet-care', image_url: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&q=80', description: 'Dog food, cat food, and pet accessories' }
];

const initialProducts = [
  // Fruits & Vegetables
  { name: 'Fresh Tomato', qty: '1 kg', price: '₹24.00', price_numeric: 24.00, category_name: 'Fruits & Vegetables', image_url: 'https://pngimg.com/d/tomato_PNG12550.png', is_popular: 1, is_deal: 0 },
  { name: 'Premium Potato', qty: '1 kg', price: '₹18.00', price_numeric: 18.00, category_name: 'Fruits & Vegetables', image_url: 'https://pngimg.com/d/potato_PNG7081.png', is_popular: 1, is_deal: 0 },
  { name: 'Fresh Red Onion', qty: '1 kg', price: '₹20.00', price_numeric: 20.00, category_name: 'Fruits & Vegetables', image_url: 'https://pngimg.com/d/onion_PNG3822.png', is_popular: 1, is_deal: 0 },
  { name: 'Fresh Banana', qty: '1 Dozen', price: '₹60.00', price_numeric: 60.00, category_name: 'Fruits & Vegetables', image_url: 'https://pngimg.com/d/banana_PNG842.png', is_popular: 1, is_deal: 1 },

  // Dairy & Breakfast
  { name: 'Amul Fresh Milk', qty: '1 L', price: '₹61.00', price_numeric: 61.00, category_name: 'Dairy & Breakfast', image_url: 'https://pngimg.com/d/milk_PNG12739.png', is_popular: 1, is_deal: 0 },
  { name: 'Amul Butter', qty: '500g', price: '₹275.00', price_numeric: 275.00, category_name: 'Dairy & Breakfast', image_url: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=300&q=80', is_popular: 1, is_deal: 0 },
  { name: 'Farm Fresh Paneer', qty: '200g', price: '₹85.00', price_numeric: 85.00, category_name: 'Dairy & Breakfast', image_url: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=300&q=80', is_popular: 1, is_deal: 1 },

  // Staples & Pulses
  { name: 'India Gate Basmati Rice', qty: '1 kg', price: '₹112.00', price_numeric: 112.00, category_name: 'Staples & Pulses', image_url: 'https://pngimg.com/d/rice_PNG14.png', is_popular: 1, is_deal: 0 },
  { name: 'Fortune Sunflower Oil', qty: '1 L', price: '₹142.00', price_numeric: 142.00, category_name: 'Staples & Pulses', image_url: 'https://pngimg.com/d/olive_oil_PNG9.png', is_popular: 1, is_deal: 1 },
  { name: 'Aashirvaad Shudh Chakki Atta', qty: '5 kg', price: '₹235.00', price_numeric: 235.00, category_name: 'Staples & Pulses', image_url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300&q=80', is_popular: 1, is_deal: 0 },
  { name: 'Tata Sampann Toor Dal', qty: '1 kg', price: '₹165.00', price_numeric: 165.00, category_name: 'Staples & Pulses', image_url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=300&q=80', is_popular: 1, is_deal: 0 },

  // Snacks & Beverages
  { name: 'Britannia Good Day', qty: '75g', price: '₹10.00', price_numeric: 10.00, category_name: 'Snacks & Beverages', image_url: 'https://pngimg.com/d/biscuit_PNG92.png', is_popular: 1, is_deal: 0 },
  { name: 'Coca Cola Chilled', qty: '750 ml', price: '₹40.00', price_numeric: 40.00, category_name: 'Snacks & Beverages', image_url: 'https://pngimg.com/d/cocacola_PNG22.png', is_popular: 1, is_deal: 0 },
  { name: 'Lays Classic Salted', qty: '50g', price: '₹20.00', price_numeric: 20.00, category_name: 'Snacks & Beverages', image_url: 'https://pngimg.com/d/potato_chips_PNG45.png', is_popular: 1, is_deal: 0 },
  { name: 'Cadbury Dairy Milk Silk', qty: '150g', price: '₹175.00', price_numeric: 175.00, category_name: 'Snacks & Beverages', image_url: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=300&q=80', is_popular: 1, is_deal: 1 },

  // Personal Care
  { name: 'Dove Moisturizing Soap', qty: '100g', price: '₹55.00', price_numeric: 55.00, category_name: 'Personal Care', image_url: 'https://pngimg.com/d/soap_PNG42.png', is_popular: 1, is_deal: 0 },
  { name: 'Colgate Total MaxFresh', qty: '150g', price: '₹110.00', price_numeric: 110.00, category_name: 'Personal Care', image_url: 'https://images.unsplash.com/photo-1559599101-f09722fb4948?w=300&q=80', is_popular: 1, is_deal: 0 },
  { name: 'Head & Shoulders Shampoo', qty: '340 ml', price: '₹280.00', price_numeric: 280.00, category_name: 'Personal Care', image_url: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=300&q=80', is_popular: 1, is_deal: 1 },

  // Home Care
  { name: 'Surf Excel Matic Detergent', qty: '1 kg', price: '₹220.00', price_numeric: 220.00, category_name: 'Home Care', image_url: 'https://pngimg.com/d/washing_powder_PNG32.png', is_popular: 1, is_deal: 0 },
  { name: 'Vim Dishwash Liquid Gel', qty: '500 ml', price: '₹105.00', price_numeric: 105.00, category_name: 'Home Care', image_url: 'https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?w=300&q=80', is_popular: 1, is_deal: 0 },
  { name: 'Lizol Surface Floor Cleaner', qty: '1 L', price: '₹199.00', price_numeric: 199.00, category_name: 'Home Care', image_url: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=300&q=80', is_popular: 1, is_deal: 1 },

  // Baby Care
  { name: 'Pampers All-Round Diapers', qty: 'Pack of 32', price: '₹449.00', price_numeric: 449.00, category_name: 'Baby Care', image_url: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=300&q=80', is_popular: 1, is_deal: 0 },
  { name: 'Johnson’s Baby Nourishing Lotion', qty: '200 ml', price: '₹185.00', price_numeric: 185.00, category_name: 'Baby Care', image_url: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=300&q=80', is_popular: 1, is_deal: 0 },

  // Pet Care
  { name: 'Pedigree Adult Dog Food Chicken & Veg', qty: '1.2 kg', price: '₹340.00', price_numeric: 340.00, category_name: 'Pet Care', image_url: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=300&q=80', is_popular: 1, is_deal: 0 },
  { name: 'Whiskas Wet Cat Food Gravy', qty: 'Pack of 4', price: '₹190.00', price_numeric: 190.00, category_name: 'Pet Care', image_url: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=300&q=80', is_popular: 1, is_deal: 1 }
];

export const initializeDatabase = async () => {
  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    port: parseInt(process.env.DB_PORT || '3306', 10)
  };

  const dbName = process.env.DB_NAME || 'grocery_mart_db';

  console.log(`\n⏳ [MySQL Init] Initializing MySQL Database: '${dbName}'...`);

  let connection;
  try {
    // 1. Connect to MySQL server without database
    connection = await mysql.createConnection(dbConfig);

    // 2. Create database if not exists
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    console.log(`✅ [MySQL Init] Database '${dbName}' verified/created.`);

    // 3. Switch to database
    await connection.query(`USE \`${dbName}\`;`);

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
        \`image_url\` VARCHAR(500) NOT NULL,
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
    } catch (e) {
      // ignore
    }

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
      const initialOffers = [
        {
          title: 'Weekend Special',
          subtitle: 'UP TO',
          discount: '30% OFF',
          coupon_code: 'WEEKEND30',
          image_url: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400&q=80',
          bg_class: 'offer-green',
          link_tab: 'Offers'
        },
        {
          title: 'Combo Deals',
          subtitle: 'UP TO',
          discount: '40% OFF',
          coupon_code: 'COMBO40',
          image_url: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&q=80',
          bg_class: 'offer-red',
          link_tab: 'Combo Deals'
        },
        {
          title: 'Daily Essentials',
          subtitle: 'UP TO',
          discount: '25% OFF',
          coupon_code: 'DAILY25',
          image_url: 'https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?w=400&q=80',
          bg_class: 'offer-yellow',
          link_tab: 'Shop'
        },
        {
          title: 'New Arrivals',
          subtitle: 'UP TO',
          discount: '20% OFF',
          coupon_code: 'NEW20',
          image_url: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&q=80',
          bg_class: 'offer-blue',
          link_tab: 'New Arrivals'
        }
      ];

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
    console.error('❌ [MySQL Init Error]:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

// If executed directly from command line: `node src/database/initDb.js`
if (process.argv[1]?.endsWith('initDb.js')) {
  initializeDatabase().then(() => process.exit(0));
}
