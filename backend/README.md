# Voyar Backend API

Backend server for Voyar Eyewear E-commerce platform.

## Features

- RESTful API with Express.js
- MongoDB database with Mongoose
- JWT authentication for admin
- CORS enabled
- Product management (CRUD)
- Order management
- Admin dashboard support

## Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account (or local MongoDB)

## Installation

```bash
npm install
```

## Environment Variables

Create a `.env` file in the backend directory:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
ADMIN_PASSWORD=your_admin_password
NODE_ENV=development
```

## Running the Server

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

### Seed Database
```bash
npm run seed
```

## API Endpoints

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `GET /api/products/search?q=query` - Search products
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - Get all orders (Admin)
- `GET /api/orders/:id` - Get single order
- `PUT /api/orders/:id/status` - Update order status (Admin)
- `DELETE /api/orders/:id` - Delete order (Admin)
- `GET /api/orders/stats/summary` - Get order statistics (Admin)

### Admin
- `POST /api/admin/login` - Admin login
- `GET /api/admin/verify` - Verify token
- `POST /api/admin/change-password` - Change password (Admin)

### Health Check
- `GET /api/health` - Server health status

## Default Admin Credentials

- Username: `admin`
- Password: Set in `.env` file as `ADMIN_PASSWORD`

## Project Structure

```
backend/
├── config/
│   └── db.js              # MongoDB connection
├── controllers/
│   ├── adminController.js
│   ├── orderController.js
│   └── productController.js
├── middleware/
│   └── auth.js            # JWT authentication
├── models/
│   ├── Admin.js
│   ├── Order.js
│   └── Product.js
├── routes/
│   ├── adminRoutes.js
│   ├── orderRoutes.js
│   └── productRoutes.js
├── .env
├── .gitignore
├── package.json
├── seedProducts.js        # Database seeding script
└── server.js             # Main server file
```

## Error Handling

All endpoints return appropriate HTTP status codes and error messages in JSON format.

## Security

- JWT tokens for admin authentication
- Password hashing with bcryptjs
- CORS configured for frontend origin
- Environment variables for sensitive data

## License

ISC
