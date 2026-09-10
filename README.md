# 🛒 Grocery Mart - Express.js & MySQL Backend

A fast, modular, and secure RESTful backend API built with **Express.js** and **MySQL** for the Grocery Mart e-commerce application.

---

## 🚀 Features

- **Database**: MySQL with connection pooling (`mysql2/promise`) and automated schema creation & data seeding.
- **Authentication**: JWT (JSON Web Tokens) with `bcryptjs` password hashing.
- **Product Management**: Full CRUD, category filtering, search, deals, and popularity indicators.
- **Order Processing**: Transactional checkout, customer order histories, and real-time status tracking.
- **Support / Inquiries**: Contact messages endpoint for customer help tickets.
- **Security & Error Handling**: CORS protection, input validation, and centralized error handling middleware.

---

## 📁 Directory Structure

```
backend/
├── package.json               # Backend dependencies & npm scripts
├── .env                       # Environment variables (DB credentials, JWT secret)
├── .env.example               # Example configuration template
├── README.md                  # Documentation and API guide
└── src/
    ├── server.js              # Express app entry point
    ├── config/
    │   └── db.js              # MySQL connection pool
    ├── database/
    │   ├── schema.sql         # SQL database schema
    │   └── initDb.js          # Auto-initialization and product seeding
    ├── middleware/
    │   ├── authMiddleware.js  # JWT validation & admin guards
    │   └── errorHandler.js    # 404 & error handlers
    ├── controllers/
    │   ├── authController.js  # Register, login, profile
    │   ├── productController.js # Product & category operations
    │   ├── orderController.js # Order placement & history
    │   └── contactController.js # Contact & support tickets
    └── routes/
        ├── index.js           # Main /api router
        ├── authRoutes.js      # /api/auth
        ├── productRoutes.js   # /api/products
        ├── orderRoutes.js     # /api/orders
        └── contactRoutes.js   # /api/contact
```

---

## 🛠️ Getting Started

### 1. Prerequisites
- **Node.js** (v16 or higher)
- **MySQL Server** (running locally via XAMPP, MySQL Workbench, Docker, or native Windows service)

### 2. Install Dependencies
Open a terminal in the `backend/` folder:

```bash
cd backend
npm install
```

### 3. Configure `.env`
Update `backend/.env` with your MySQL credentials:

```env
PORT=5000
NODE_ENV=development

# MySQL Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=grocery_mart_db
DB_PORT=3306

# JWT Authentication
JWT_SECRET=grocery_mart_super_secret_jwt_key_2026_xyz
JWT_EXPIRES_IN=7d

# Frontend Client URL
CLIENT_URL=http://localhost:5173
```

### 4. Initialize Database & Seed Products (Optional / Automatic)
The backend automatically creates the database, tables, and seeds initial products on start, or you can run it manually:

```bash
npm run db:init
```

### 5. Start the Server

#### Development (Auto-reload with Nodemon):
```bash
npm run dev
```

#### Production:
```bash
npm start
```

The server will be available at: **`http://localhost:5000`**

---

## 📚 API Endpoints Summary

### Auth (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/auth/register` | Register new user account | No |
| `POST` | `/api/auth/login` | Login and receive JWT token | No |
| `GET`  | `/api/auth/me` | Get current user profile | Yes (Bearer token) |
| `PUT`  | `/api/auth/profile` | Update profile information | Yes (Bearer token) |

### Products (`/api/products`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET`  | `/api/products` | Get products (supports `?category=`, `?search=`, `?is_deal=1`, `?sort=`) | No |
| `GET`  | `/api/products/categories` | Get all product categories | No |
| `GET`  | `/api/products/:id` | Get single product by ID | No |
| `POST` | `/api/products` | Add new product | Admin |
| `PUT`  | `/api/products/:id` | Update product | Admin |
| `DELETE` | `/api/products/:id` | Delete product | Admin |

### Orders (`/api/orders`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/orders` | Place a new grocery order | Optional (Guest or User) |
| `GET`  | `/api/orders/my-orders` | Get user order history | Optional (via token or `?email=`) |
| `GET`  | `/api/orders/:id` | Get single order details | No |
| `PUT`  | `/api/orders/:id/status` | Update order status | Admin |

### Support / Contact (`/api/contact`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/contact` | Submit help/support message | No |
| `GET`  | `/api/contact` | Get all contact messages | Admin |
