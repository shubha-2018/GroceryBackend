export const initialCategories = [
  { name: 'Fruits & Vegetables', slug: 'fruits-vegetables', image_url: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400&q=80', description: 'Fresh farm fruits and green vegetables' },
  { name: 'Dairy & Breakfast', slug: 'dairy-breakfast', image_url: 'https://images.unsplash.com/photo-1528732263440-4dd1a18a4cc2?w=400&q=80', description: 'Milk, butter, paneer, and eggs' },
  { name: 'Staples & Pulses', slug: 'staples-pulses', image_url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&q=80', description: 'Rice, atta, dal, and cooking oils' },
  { name: 'Snacks & Beverages', slug: 'snacks-beverages', image_url: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=400&q=80', description: 'Chips, biscuits, cold drinks, and sweets' },
  { name: 'Personal Care', slug: 'personal-care', image_url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&q=80', description: 'Soaps, shampoos, oral care, and skin essentials' },
  { name: 'Home Care', slug: 'home-care', image_url: 'https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?w=400&q=80', description: 'Detergents, floor cleaners, and kitchen care' },
  { name: 'Baby Care', slug: 'baby-care', image_url: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&q=80', description: 'Diapers, baby food, and gentle lotions' },
  { name: 'Pet Care', slug: 'pet-care', image_url: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&q=80', description: 'Dog food, cat food, and pet accessories' }
];

export const initialProducts = [
  // Fruits & Vegetables
  { id: 1, name: 'Fresh Tomato', qty: '1 kg', price: '₹24.00', price_numeric: 24.00, category_name: 'Fruits & Vegetables', image_url: 'https://pngimg.com/d/tomato_PNG12550.png', is_popular: 1, is_deal: 0, stock: 100 },
  { id: 2, name: 'Premium Potato', qty: '1 kg', price: '₹18.00', price_numeric: 18.00, category_name: 'Fruits & Vegetables', image_url: 'https://pngimg.com/d/potato_PNG7081.png', is_popular: 1, is_deal: 0, stock: 100 },
  { id: 3, name: 'Fresh Red Onion', qty: '1 kg', price: '₹20.00', price_numeric: 20.00, category_name: 'Fruits & Vegetables', image_url: 'https://pngimg.com/d/onion_PNG3822.png', is_popular: 1, is_deal: 0, stock: 100 },
  { id: 4, name: 'Fresh Banana', qty: '1 Dozen', price: '₹60.00', price_numeric: 60.00, category_name: 'Fruits & Vegetables', image_url: 'https://pngimg.com/d/banana_PNG842.png', is_popular: 1, is_deal: 1, stock: 100 },

  // Dairy & Breakfast
  { id: 5, name: 'Amul Fresh Milk', qty: '1 L', price: '₹61.00', price_numeric: 61.00, category_name: 'Dairy & Breakfast', image_url: 'https://pngimg.com/d/milk_PNG12739.png', is_popular: 1, is_deal: 0, stock: 100 },
  { id: 6, name: 'Amul Butter', qty: '500g', price: '₹275.00', price_numeric: 275.00, category_name: 'Dairy & Breakfast', image_url: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=300&q=80', is_popular: 1, is_deal: 0, stock: 100 },
  { id: 7, name: 'Farm Fresh Paneer', qty: '200g', price: '₹85.00', price_numeric: 85.00, category_name: 'Dairy & Breakfast', image_url: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=300&q=80', is_popular: 1, is_deal: 1, stock: 100 },

  // Staples & Pulses
  { id: 8, name: 'India Gate Basmati Rice', qty: '1 kg', price: '₹112.00', price_numeric: 112.00, category_name: 'Staples & Pulses', image_url: 'https://pngimg.com/d/rice_PNG14.png', is_popular: 1, is_deal: 0, stock: 100 },
  { id: 9, name: 'Fortune Sunflower Oil', qty: '1 L', price: '₹142.00', price_numeric: 142.00, category_name: 'Staples & Pulses', image_url: 'https://pngimg.com/d/olive_oil_PNG9.png', is_popular: 1, is_deal: 1, stock: 100 },
  { id: 10, name: 'Aashirvaad Shudh Chakki Atta', qty: '5 kg', price: '₹235.00', price_numeric: 235.00, category_name: 'Staples & Pulses', image_url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300&q=80', is_popular: 1, is_deal: 0, stock: 100 },
  { id: 11, name: 'Tata Sampann Toor Dal', qty: '1 kg', price: '₹165.00', price_numeric: 165.00, category_name: 'Staples & Pulses', image_url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=300&q=80', is_popular: 1, is_deal: 0, stock: 100 },

  // Snacks & Beverages
  { id: 12, name: 'Britannia Good Day', qty: '75g', price: '₹10.00', price_numeric: 10.00, category_name: 'Snacks & Beverages', image_url: 'https://pngimg.com/d/biscuit_PNG92.png', is_popular: 1, is_deal: 0, stock: 100 },
  { id: 13, name: 'Coca Cola Chilled', qty: '750 ml', price: '₹40.00', price_numeric: 40.00, category_name: 'Snacks & Beverages', image_url: 'https://pngimg.com/d/cocacola_PNG22.png', is_popular: 1, is_deal: 0, stock: 100 },
  { id: 14, name: 'Lays Classic Salted', qty: '50g', price: '₹20.00', price_numeric: 20.00, category_name: 'Snacks & Beverages', image_url: 'https://pngimg.com/d/potato_chips_PNG45.png', is_popular: 1, is_deal: 0, stock: 100 },
  { id: 15, name: 'Cadbury Dairy Milk Silk', qty: '150g', price: '₹175.00', price_numeric: 175.00, category_name: 'Snacks & Beverages', image_url: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=300&q=80', is_popular: 1, is_deal: 1, stock: 100 },

  // Personal Care
  { id: 16, name: 'Dove Moisturizing Soap', qty: '100g', price: '₹55.00', price_numeric: 55.00, category_name: 'Personal Care', image_url: 'https://pngimg.com/d/soap_PNG42.png', is_popular: 1, is_deal: 0, stock: 100 },
  { id: 17, name: 'Colgate Total MaxFresh', qty: '150g', price: '₹110.00', price_numeric: 110.00, category_name: 'Personal Care', image_url: 'https://images.unsplash.com/photo-1559599101-f09722fb4948?w=300&q=80', is_popular: 1, is_deal: 0, stock: 100 },
  { id: 18, name: 'Head & Shoulders Shampoo', qty: '340 ml', price: '₹280.00', price_numeric: 280.00, category_name: 'Personal Care', image_url: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=300&q=80', is_popular: 1, is_deal: 1, stock: 100 },

  // Home Care
  { id: 19, name: 'Surf Excel Matic Detergent', qty: '1 kg', price: '₹220.00', price_numeric: 220.00, category_name: 'Home Care', image_url: 'https://pngimg.com/d/washing_powder_PNG32.png', is_popular: 1, is_deal: 0, stock: 100 },
  { id: 20, name: 'Vim Dishwash Liquid Gel', qty: '500 ml', price: '₹105.00', price_numeric: 105.00, category_name: 'Home Care', image_url: 'https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?w=300&q=80', is_popular: 1, is_deal: 0, stock: 100 },
  { id: 21, name: 'Lizol Surface Floor Cleaner', qty: '1 L', price: '₹199.00', price_numeric: 199.00, category_name: 'Home Care', image_url: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=300&q=80', is_popular: 1, is_deal: 1, stock: 100 },

  // Baby Care
  { id: 22, name: 'Pampers All-Round Diapers', qty: 'Pack of 32', price: '₹449.00', price_numeric: 449.00, category_name: 'Baby Care', image_url: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=300&q=80', is_popular: 1, is_deal: 0, stock: 100 },
  { id: 23, name: 'Johnson’s Baby Nourishing Lotion', qty: '200 ml', price: '₹185.00', price_numeric: 185.00, category_name: 'Baby Care', image_url: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=300&q=80', is_popular: 1, is_deal: 0, stock: 100 },

  // Pet Care
  { id: 24, name: 'Pedigree Adult Dog Food Chicken & Veg', qty: '1.2 kg', price: '₹340.00', price_numeric: 340.00, category_name: 'Pet Care', image_url: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=300&q=80', is_popular: 1, is_deal: 0, stock: 100 },
  { id: 25, name: 'Whiskas Wet Cat Food Gravy', qty: 'Pack of 4', price: '₹190.00', price_numeric: 190.00, category_name: 'Pet Care', image_url: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=300&q=80', is_popular: 1, is_deal: 1, stock: 100 }
];

export const initialOffers = [
  {
    id: 1,
    title: 'Weekend Special',
    subtitle: 'UP TO',
    discount: '30% OFF',
    coupon_code: 'WEEKEND30',
    image_url: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400&q=80',
    bg_class: 'offer-green',
    link_tab: 'Offers',
    is_active: 1
  },
  {
    id: 2,
    title: 'Combo Deals',
    subtitle: 'UP TO',
    discount: '40% OFF',
    coupon_code: 'COMBO40',
    image_url: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&q=80',
    bg_class: 'offer-red',
    link_tab: 'Combo Deals',
    is_active: 1
  },
  {
    id: 3,
    title: 'Daily Essentials',
    subtitle: 'UP TO',
    discount: '25% OFF',
    coupon_code: 'DAILY25',
    image_url: 'https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?w=400&q=80',
    bg_class: 'offer-yellow',
    link_tab: 'Shop',
    is_active: 1
  },
  {
    id: 4,
    title: 'New Arrivals',
    subtitle: 'UP TO',
    discount: '20% OFF',
    coupon_code: 'NEW20',
    image_url: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&q=80',
    bg_class: 'offer-blue',
    link_tab: 'New Arrivals',
    is_active: 1
  }
];
