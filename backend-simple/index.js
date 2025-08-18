const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const morgan = require('morgan');

const app = express();
const port = process.env.PORT || 3001;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
app.use(morgan('combined'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'KP5 Academy Backend is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Simple auth endpoint for testing
app.post('/api/auth/signin', (req, res) => {
  const { email, password } = req.body;
  
  console.log('Signin attempt:', { email, password: password ? '***' : 'missing' });
  
  // Simple validation
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }
  
  // For now, just return a mock response
  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        id: '1',
        email: email,
        displayName: 'Test User',
        role: 'PLAYER'
      },
      token: 'mock-jwt-token-' + Date.now()
    }
  });
});

// Start server
app.listen(port, () => {
  console.log(`🚀 KP5 Academy Backend server running on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Health check: http://localhost:${port}/health`);
  console.log(`Signin endpoint: http://localhost:${port}/api/auth/signin`);
});
