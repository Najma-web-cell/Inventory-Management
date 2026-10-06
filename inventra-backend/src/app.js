require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET is not set. Copy .env.example to .env and set it.');
  process.exit(1);
}

const errorHandler = require('./middlewares/errorHandler');
const { verifyToken } = require('./middlewares/authMiddleware');

const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: (process.env.CLIENT_ORIGIN || 'http://localhost:5173').split(',') }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

app.get('/health', (req, res) => res.json({ status: 'active', message: 'Inventra API is running.' }));

// Public
app.use('/api/v1/auth', require('./routes/authRoutes'));

// Protected (JWT required)
app.use('/api/v1/dashboard', verifyToken, require('./routes/dashboardRoutes'));
app.use('/api/v1/products', verifyToken, require('./routes/productRoutes'));
app.use('/api/v1/stock', verifyToken, require('./routes/stockRoutes'));
app.use('/api/v1/categories', verifyToken, require('./routes/categoryRoutes'));
app.use('/api/v1/suppliers', verifyToken, require('./routes/supplierRoutes'));
app.use('/api/v1/export', verifyToken, require('./routes/exportRoutes'));

app.use((req, res) => res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` }));
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Inventra API running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`));
