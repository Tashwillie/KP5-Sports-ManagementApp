import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import morgan from 'morgan';
import 'express-async-errors';
import { createServer } from 'http';
import { Server } from 'socket.io';

// Import routes
import authRoutes from './routes/auth';
import usersRoutes from './routes/users';
import dashboardRoutes from './routes/dashboard';
import clubsRoutes from './routes/clubs';
import teamsRoutes from './routes/teams';
import eventsRoutes from './routes/events'; // Re-enabled events routes
import matchesRoutes from './routes/matches';
import tournamentsRoutes from './routes/tournaments';
import paymentsRoutes from './routes/payments';
import notificationsRoutes from './routes/notifications';
import messagesRoutes from './routes/messages';
import registrationsRoutes from './routes/registrations';
import mediaRoutes from './routes/media';
import statisticsRoutes from './routes/statistics';
import permissionsRoutes from './routes/permissions';
import eventEntryRoutes from './routes/eventEntry';
import matchHistoryRoutes from './routes/matchHistory';
import matchRoomsRoutes from './routes/matchRooms';
import { errorHandler } from './middleware/errorHandler';

const app = express();
const server = createServer(app);
const port = process.env['PORT'] || 3001;

// Initialize Socket.IO for real-time features
const io = new Server(server, {
  cors: {
    origin: process.env['FRONTEND_URL'] || 'http://localhost:3003',
    credentials: true,
  },
  path: '/ws',
});

// Make io available to routes
app.set('io', io);

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env['FRONTEND_URL'] || 'http://localhost:3003',
  credentials: true,
}));

// Rate limiting - disabled in development for easier testing
if (process.env.NODE_ENV === 'production') {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per 15min in production
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use(limiter);
} else {
  console.log('🔓 Rate limiting disabled in development mode');
}

// Rate limit only for auth endpoints in production
if (process.env.NODE_ENV === 'production') {
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 auth attempts in 15min in production
    message: {
      success: false,
      message: 'Too many authentication attempts. Please try again later.',
      error: 'RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api/auth', authLimiter);
} else {
  console.log('🔓 Auth rate limiting disabled in development mode');
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
app.use(morgan('combined'));

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'KP5 Academy Backend is running',
    timestamp: new Date().toISOString(),
    environment: process.env['NODE_ENV'] || 'development',
    database: 'PostgreSQL',
    realtime: 'WebSocket (Socket.IO)',
  });
});

// Development-only endpoint to reset rate limiting
if (process.env.NODE_ENV !== 'production') {
  app.post('/api/dev/reset-rate-limit', (_req, res) => {
    try {
      // Clear rate limit store if possible
      res.status(200).json({
        success: true,
        message: 'Rate limit reset (development only)',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error resetting rate limit:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to reset rate limit',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
}

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/clubs', clubsRoutes);
app.use('/api/teams', teamsRoutes);
app.use('/api/events', eventsRoutes); // Re-enabled events routes
app.use('/api/matches', matchesRoutes);
app.use('/api/tournaments', tournamentsRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/registrations', registrationsRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/statistics', statisticsRoutes);
app.use('/api/permissions', permissionsRoutes);
app.use('/api/event-entry', eventEntryRoutes);
app.use('/api/match-history', matchHistoryRoutes);
app.use('/api/match-rooms', matchRoomsRoutes);

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('🔌 New WebSocket connection:', socket.id);

  // Join match room
  socket.on('join-match', (matchId: string) => {
    socket.join(`match-${matchId}`);
    console.log(`👥 User joined match room: ${matchId}`);
  });

  // Leave match room
  socket.on('leave-match', (matchId: string) => {
    socket.leave(`match-${matchId}`);
    console.log(`👋 User left match room: ${matchId}`);
  });

  // Handle match events
  socket.on('match-event', (data: any) => {
    const { matchId, event } = data;
    socket.to(`match-${matchId}`).emit('match-event-update', event);
    console.log(`⚽ Match event in ${matchId}:`, event.type);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('🔌 WebSocket disconnected:', socket.id);
  });
});

// Error handling middleware
app.use(errorHandler);

// Start server
server.listen(Number(port), '0.0.0.0', () => {
  console.log(`🚀 KP5 Academy Backend server running on port ${port}`);
  console.log(`Environment: ${process.env['NODE_ENV'] || 'development'}`);
  console.log(`Database: PostgreSQL`);
  console.log(`Real-time: WebSocket (Socket.IO)`);
  console.log(`Health check: http://localhost:${port}/health`);
  console.log(`API base: http://localhost:${port}/api`);
  console.log(`WebSocket: ws://localhost:${port}/ws`);
  console.log(`Listening on all interfaces (0.0.0.0)`);
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
}); 