import pool from '../config/db.js';

// @route   GET /api/products
// @desc    Get all products with filtering & search
export const getProducts = async (req, res, next) => {
  try {
    const { category, search, is_deal, is_popular, sort, limit } = req.query;

    let query = 'SELECT * FROM products WHERE 1=1';
    const params = [];

    if (category && category !== 'All') {
      query += ' AND category_name = ?';
      params.push(category);
    }

    if (search) {
      query += ' AND (name LIKE ? OR category_name LIKE ? OR description LIKE ?)';
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    if (is_deal === 'true' || is_deal === '1') {
      query += ' AND is_deal = 1';
    }

    if (is_popular === 'true' || is_popular === '1') {
      query += ' AND is_popular = 1';
    }

    // Sorting
    if (sort === 'price_asc') {
      query += ' ORDER BY price_numeric ASC';
    } else if (sort === 'price_desc') {
      query += ' ORDER BY price_numeric DESC';
    } else if (sort === 'name_asc') {
      query += ' ORDER BY name ASC';
    } else {
      query += ' ORDER BY id ASC';
    }

    if (limit) {
      query += ' LIMIT ?';
      params.push(parseInt(limit, 10));
    }

    const [products] = await pool.query(query, params);

    res.json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/products/:id
// @desc    Get single product by ID
export const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/categories
// @desc    Get all categories
export const getCategories = async (req, res, next) => {
  try {
    const [categories] = await pool.query('SELECT * FROM categories ORDER BY id ASC');

    res.json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/products
// @desc    Create new product
export const createProduct = async (req, res, next) => {
  try {
    const { name, category_name, category, qty, price, price_numeric, image_url, img, description, is_popular, is_deal, stock } = req.body;

    const catName = category_name || category || 'Fruits & Vegetables';
    const imgUrl = image_url || img || 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=300&q=80';
    const productPrice = price ? (String(price).startsWith('₹') ? price : `₹${price}`) : '₹50.00';
    const numericPrice = price_numeric || parseFloat(String(productPrice).replace(/[^0-9.]/g, '')) || 0;
    const unitQty = qty || '1 unit';

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Product name is required.'
      });
    }

    const [result] = await pool.query(
      `INSERT INTO products (name, category_name, qty, price, price_numeric, image_url, description, is_popular, is_deal, stock)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, catName, unitQty, productPrice, numericPrice, imgUrl, description || null, is_popular ? 1 : 0, is_deal ? 1 : 0, stock || 100]
    );

    const [newProduct] = await pool.query('SELECT * FROM products WHERE id = ?', [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Product added successfully!',
      data: newProduct[0]
    });
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/products/:id
// @desc    Update an existing product
export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, category_name, category, qty, price, price_numeric, image_url, img, description, is_popular, is_deal, stock } = req.body;

    const catName = category_name || category;
    const imgUrl = image_url || img;
    const numericPrice = price_numeric || (price ? parseFloat(String(price).replace(/[^0-9.]/g, '')) : undefined);

    await pool.query(
      `UPDATE products SET 
         name = COALESCE(?, name),
         category_name = COALESCE(?, category_name),
         qty = COALESCE(?, qty),
         price = COALESCE(?, price),
         price_numeric = COALESCE(?, price_numeric),
         image_url = COALESCE(?, image_url),
         description = COALESCE(?, description),
         is_popular = COALESCE(?, is_popular),
         is_deal = COALESCE(?, is_deal),
         stock = COALESCE(?, stock)
       WHERE id = ?`,
      [name, catName, qty, price, numericPrice, imgUrl, description, is_popular ? 1 : (is_popular === false ? 0 : undefined), is_deal ? 1 : (is_deal === false ? 0 : undefined), stock, id]
    );

    const [updated] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);

    if (updated.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({
      success: true,
      message: 'Product updated successfully!',
      data: updated[0]
    });
  } catch (error) {
    next(error);
  }
};

// @route   DELETE /api/products/:id (Admin)
// @desc    Delete a product
export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM products WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({
      success: true,
      message: 'Product deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};
