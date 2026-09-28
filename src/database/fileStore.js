import fs from 'fs';
import path from 'path';
import { initialProducts, initialCategories, initialOffers } from './initialData.js';

const DATA_DIR = path.join(process.cwd(), 'data');

const ensureDataDir = () => {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
};

const getFilePath = (filename) => {
  ensureDataDir();
  return path.join(DATA_DIR, filename);
};

const readJson = (filename, defaultValue = []) => {
  try {
    const filePath = getFilePath(filename);
    if (!fs.existsSync(filePath)) {
      writeJson(filename, defaultValue);
      return defaultValue;
    }
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.warn(`[FileStore] Error reading ${filename}, returning default:`, err.message);
    return defaultValue;
  }
};

const writeJson = (filename, data) => {
  try {
    const filePath = getFilePath(filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error(`[FileStore] Error writing ${filename}:`, err.message);
    return false;
  }
};

// Initialize default data files if they don't exist
export const initFileStore = () => {
  ensureDataDir();
  if (!fs.existsSync(getFilePath('products.json'))) {
    writeJson('products.json', initialProducts);
  }
  if (!fs.existsSync(getFilePath('categories.json'))) {
    writeJson('categories.json', initialCategories);
  }
  if (!fs.existsSync(getFilePath('offers.json'))) {
    writeJson('offers.json', initialOffers);
  }
  if (!fs.existsSync(getFilePath('orders.json'))) {
    writeJson('orders.json', []);
  }
  if (!fs.existsSync(getFilePath('contact.json'))) {
    writeJson('contact.json', []);
  }
  console.log('📁 [FileStore] Persistent JSON data files verified/initialized in /data directory.');
};

// ---------------- PRODUCTS ----------------
export const fileStore = {
  // Products
  getProducts: (filter = {}) => {
    let list = readJson('products.json', initialProducts);
    const { category, search, is_deal, is_popular, sort, limit } = filter;

    if (category && category !== 'All') {
      list = list.filter(p => (p.category_name || p.category) === category);
    }

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(p => 
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.category_name && p.category_name.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q))
      );
    }

    if (is_deal === 'true' || is_deal === '1') {
      list = list.filter(p => p.is_deal == 1 || p.is_deal === true);
    }

    if (is_popular === 'true' || is_popular === '1') {
      list = list.filter(p => p.is_popular == 1 || p.is_popular === true);
    }

    if (sort === 'price_asc') {
      list.sort((a, b) => (Number(a.price_numeric) || 0) - (Number(b.price_numeric) || 0));
    } else if (sort === 'price_desc') {
      list.sort((a, b) => (Number(b.price_numeric) || 0) - (Number(a.price_numeric) || 0));
    } else if (sort === 'name_asc') {
      list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    }

    if (limit) {
      list = list.slice(0, parseInt(limit, 10));
    }

    return list;
  },

  getProductById: (id) => {
    const list = readJson('products.json', initialProducts);
    return list.find(p => String(p.id) === String(id)) || null;
  },

  createProduct: (data) => {
    const list = readJson('products.json', initialProducts);
    const maxId = list.reduce((max, p) => Math.max(max, Number(p.id) || 0), 0);
    const newId = maxId + 1;

    const productPrice = data.price ? (String(data.price).startsWith('₹') ? data.price : `₹${data.price}`) : '₹50.00';
    const numericPrice = data.price_numeric || parseFloat(String(productPrice).replace(/[^0-9.]/g, '')) || 0;

    const newProduct = {
      id: newId,
      name: data.name,
      category_name: data.category_name || data.category || 'Fruits & Vegetables',
      category: data.category_name || data.category || 'Fruits & Vegetables',
      qty: data.qty || '1 unit',
      price: productPrice,
      price_numeric: numericPrice,
      original_price: data.original_price || null,
      discount: data.discount || null,
      rating: data.rating || 4.5,
      image_url: data.image_url || data.img || 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=300&q=80',
      img: data.image_url || data.img || 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=300&q=80',
      description: data.description || null,
      is_popular: data.is_popular ? 1 : 0,
      is_deal: data.is_deal ? 1 : 0,
      stock: data.stock !== undefined ? Number(data.stock) : 100,
      created_at: new Date().toISOString()
    };

    list.unshift(newProduct);
    writeJson('products.json', list);
    return newProduct;
  },

  updateProduct: (id, data) => {
    const list = readJson('products.json', initialProducts);
    const index = list.findIndex(p => String(p.id) === String(id));
    if (index === -1) return null;

    const existing = list[index];
    const catName = data.category_name || data.category || existing.category_name || existing.category;
    const imgUrl = data.image_url || data.img || existing.image_url || existing.img;
    const price = data.price !== undefined ? data.price : existing.price;
    const numericPrice = data.price_numeric !== undefined 
      ? data.price_numeric 
      : (price ? parseFloat(String(price).replace(/[^0-9.]/g, '')) : existing.price_numeric);

    const updated = {
      ...existing,
      name: data.name !== undefined ? data.name : existing.name,
      category_name: catName,
      category: catName,
      qty: data.qty !== undefined ? data.qty : existing.qty,
      price: price,
      price_numeric: numericPrice,
      original_price: data.original_price !== undefined ? data.original_price : existing.original_price,
      discount: data.discount !== undefined ? data.discount : existing.discount,
      rating: data.rating !== undefined ? data.rating : existing.rating,
      image_url: imgUrl,
      img: imgUrl,
      description: data.description !== undefined ? data.description : existing.description,
      is_popular: data.is_popular !== undefined ? (data.is_popular ? 1 : 0) : existing.is_popular,
      is_deal: data.is_deal !== undefined ? (data.is_deal ? 1 : 0) : existing.is_deal,
      stock: data.stock !== undefined ? Number(data.stock) : existing.stock,
      updated_at: new Date().toISOString()
    };

    list[index] = updated;
    writeJson('products.json', list);
    return updated;
  },

  deleteProduct: (id) => {
    const list = readJson('products.json', initialProducts);
    const filtered = list.filter(p => String(p.id) !== String(id));
    if (filtered.length === list.length) return false;
    writeJson('products.json', filtered);
    return true;
  },

  // Categories
  getCategories: () => {
    return readJson('categories.json', initialCategories);
  },

  // Offers
  getOffers: () => {
    const offers = readJson('offers.json', initialOffers);
    return offers.filter(o => o.is_active == 1 || o.is_active === true);
  },

  getOfferById: (id) => {
    const offers = readJson('offers.json', initialOffers);
    return offers.find(o => String(o.id) === String(id)) || null;
  },

  createOffer: (data) => {
    const list = readJson('offers.json', initialOffers);
    const maxId = list.reduce((max, o) => Math.max(max, Number(o.id) || 0), 0);
    const newOffer = {
      id: maxId + 1,
      title: data.title || 'Special Offer',
      subtitle: data.subtitle || 'UP TO',
      discount: data.discount || '30% OFF',
      coupon_code: data.coupon_code || null,
      image_url: data.image_url || data.img || 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400&q=80',
      bg_class: data.bg_class || 'offer-green',
      link_tab: data.link_tab || 'Offers',
      is_active: data.is_active !== undefined ? (data.is_active ? 1 : 0) : 1,
      created_at: new Date().toISOString()
    };
    list.unshift(newOffer);
    writeJson('offers.json', list);
    return newOffer;
  },

  updateOffer: (id, data) => {
    const list = readJson('offers.json', initialOffers);
    const index = list.findIndex(o => String(o.id) === String(id));
    if (index === -1) return null;

    const existing = list[index];
    const updated = {
      ...existing,
      title: data.title !== undefined ? data.title : existing.title,
      subtitle: data.subtitle !== undefined ? data.subtitle : existing.subtitle,
      discount: data.discount !== undefined ? data.discount : existing.discount,
      coupon_code: data.coupon_code !== undefined ? data.coupon_code : existing.coupon_code,
      image_url: data.image_url || data.img || existing.image_url,
      bg_class: data.bg_class !== undefined ? data.bg_class : existing.bg_class,
      link_tab: data.link_tab !== undefined ? data.link_tab : existing.link_tab,
      is_active: data.is_active !== undefined ? (data.is_active ? 1 : 0) : existing.is_active,
      updated_at: new Date().toISOString()
    };

    list[index] = updated;
    writeJson('offers.json', list);
    return updated;
  },

  deleteOffer: (id) => {
    const list = readJson('offers.json', initialOffers);
    const filtered = list.filter(o => String(o.id) !== String(id));
    if (filtered.length === list.length) return false;
    writeJson('offers.json', filtered);
    return true;
  },

  // Orders
  getOrders: () => {
    return readJson('orders.json', []);
  },

  getOrderById: (id) => {
    const orders = readJson('orders.json', []);
    return orders.find(o => String(o.id) === String(id) || o.order_number === id) || null;
  },

  createOrder: (data) => {
    const list = readJson('orders.json', []);
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const orderNumber = `GM-${randomNum}`;
    const maxId = list.reduce((max, o) => Math.max(max, Number(o.id) || 0), 0);

    const finalTotal = data.total_amount || `₹${Number(data.total_numeric || 0).toFixed(2)}`;
    const numericTotal = data.total_numeric || parseFloat(String(data.total_amount).replace(/[^0-9.]/g, '')) || 0;

    const newOrder = {
      id: maxId + 1,
      order_number: orderNumber,
      customer_name: data.customer_name,
      customer_email: data.customer_email,
      customer_phone: data.customer_phone || null,
      delivery_address: data.delivery_address || 'Express Delivery Address',
      total_amount: finalTotal,
      total_numeric: numericTotal,
      payment_method: data.payment_method || 'Cash on Delivery',
      payment_status: 'Pending',
      order_status: 'Order Placed',
      status_color: '#ff9800',
      eta: 'Arriving in 10-15 mins',
      items: data.items || [],
      created_at: new Date().toISOString()
    };

    list.unshift(newOrder);
    writeJson('orders.json', list);
    return newOrder;
  },

  updateOrderStatus: (id, status, statusColor) => {
    const list = readJson('orders.json', []);
    const index = list.findIndex(o => String(o.id) === String(id) || o.order_number === id);
    if (index === -1) return null;

    list[index].order_status = status;
    if (statusColor) list[index].status_color = statusColor;
    list[index].updated_at = new Date().toISOString();

    writeJson('orders.json', list);
    return list[index];
  },

  // Contact messages
  submitContact: (data) => {
    const list = readJson('contact.json', []);
    const maxId = list.reduce((max, c) => Math.max(max, Number(c.id) || 0), 0);
    const newMsg = {
      id: maxId + 1,
      name: data.name,
      email: data.email,
      subject: data.subject || 'General Inquiry',
      message: data.message,
      status: 'Unread',
      created_at: new Date().toISOString()
    };
    list.unshift(newMsg);
    writeJson('contact.json', list);
    return newMsg;
  },

  getContactMessages: () => {
    return readJson('contact.json', []);
  }
};

export default fileStore;
