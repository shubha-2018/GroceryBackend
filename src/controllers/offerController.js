import pool from '../config/db.js';

// @route   GET /api/offers
// @desc    Get all active promotional offers & banners
export const getOffers = async (req, res, next) => {
  try {
    const [offers] = await pool.query('SELECT * FROM offers WHERE is_active = 1 ORDER BY id ASC');

    res.json({
      success: true,
      count: offers.length,
      data: offers
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/offers/:id
// @desc    Get offer by ID
export const getOfferById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM offers WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Offer not found' });
    }

    res.json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/offers
// @desc    Create new offer banner
export const createOffer = async (req, res, next) => {
  try {
    const { title, subtitle, discount, coupon_code, image_url, img, bg_class, link_tab } = req.body;

    const imgUrl = image_url || img || 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400&q=80';
    const offerTitle = title || 'Special Offer';
    const offerSubtitle = subtitle || 'UP TO';
    const offerDiscount = discount || '30% OFF';
    const bgClass = bg_class || 'offer-green';
    const linkTab = link_tab || 'Offers';

    const [result] = await pool.query(
      `INSERT INTO offers (title, subtitle, discount, coupon_code, image_url, bg_class, link_tab)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [offerTitle, offerSubtitle, offerDiscount, coupon_code || null, imgUrl, bgClass, linkTab]
    );

    const [newOffer] = await pool.query('SELECT * FROM offers WHERE id = ?', [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Offer banner created successfully!',
      data: newOffer[0]
    });
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/offers/:id
// @desc    Update offer banner
export const updateOffer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, subtitle, discount, coupon_code, image_url, img, bg_class, link_tab, is_active } = req.body;

    const imgUrl = image_url || img;

    await pool.query(
      `UPDATE offers SET 
         title = COALESCE(?, title),
         subtitle = COALESCE(?, subtitle),
         discount = COALESCE(?, discount),
         coupon_code = COALESCE(?, coupon_code),
         image_url = COALESCE(?, image_url),
         bg_class = COALESCE(?, bg_class),
         link_tab = COALESCE(?, link_tab),
         is_active = COALESCE(?, is_active)
       WHERE id = ?`,
      [title, subtitle, discount, coupon_code, imgUrl, bg_class, link_tab, is_active, id]
    );

    const [updated] = await pool.query('SELECT * FROM offers WHERE id = ?', [id]);

    if (updated.length === 0) {
      return res.status(404).json({ success: false, message: 'Offer not found' });
    }

    res.json({
      success: true,
      message: 'Offer updated successfully!',
      data: updated[0]
    });
  } catch (error) {
    next(error);
  }
};

// @route   DELETE /api/offers/:id
// @desc    Delete offer
export const deleteOffer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM offers WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Offer not found' });
    }

    res.json({
      success: true,
      message: 'Offer deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};
