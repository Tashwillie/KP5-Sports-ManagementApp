import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import morgan from 'morgan';
import 'express-async-errors';
import { createServer } from 'http';

import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import { logger } from './utils/logger';
import { WebSocketService } from './services/websocketService';

// Import routes
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import clubRoutes from './routes/clubs';
import teamRoutes from './routes/teams';
import eventRoutes from './routes/events';
import matchRoutes from './routes/matches';
import matchRoomRoutes from './routes/matchRooms';
import scalingRoutes from './routes/scaling';
import statisticsRoutes from './routes/statistics';
import tournamentRoutes from './routes/tournaments';
import messageRoutes from './routes/messages';
import notificationRoutes from './routes/notifications';
import paymentRoutes from './routes/payments';
import registrationRoutes from './routes/registrations';
import dashboardRoutes from './routes/dashboard';
import mediaRoutes from './routes/media';
import eventEntryRoutes from './routes/eventEntry';
import playerPerformanceRoutes from './routes/playerPerformance';
import teamStatisticsRoutes from './routes/teamStatistics';
import permissionRoutes from './routes/permissions';

const app = express();
const server = createServer(app);
const port = process.env['PORT'] || 3001;

// Initialize WebSocket service
export const webSocketService = new WebSocketService(server);

// Initialize scaling services
import distributedMatchStateManager from './services/distributedMatchStateManager';
import loadBalancerService from './services/loadBalancerService';
import performanceMonitoringService from './services/performanceMonitoringService';
import statisticsService from './services/statisticsService';
// import eventEntryService from './services/eventEntryService';

// Initialize scaling services
const initializeScalingServices = async () => {
  try {
    await distributedMatchStateManager.initialize();
    await loadBalancerService.initialize();
    await performanceMonitoringService.initialize();
    // Note: statisticsService is a singleton, no initialization needed
    logger.info('All scaling services initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize scaling services:', error);
  }
};

// Initialize scaling services
initializeScalingServices();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env['FRONTEND_URL'] || 'http://localhost:3003',
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
app.use(morgan('combined', {
  stream: {
    write: (message: string) => logger.info(message.trim()),
  },
}));

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'KP5 Academy Backend is running',
    timestamp: new Date().toISOString(),
    environment: process.env['NODE_ENV'] || 'development',
    websocketConnections: webSocketService.getUserCount(),
  });
});

// WebSocket status endpoint
app.get('/websocket/status', (_req, res) => {
  res.status(200).json({
    success: true,
    connectedUsers: webSocketService.getUserCount(),
    rooms: Array.from(webSocketService.getConnectedUsers().values()).map(user => ({
      userId: user.userId,
      role: user.userRole,
      email: user.userEmail
    }))
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/clubs', clubRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/match-rooms', matchRoomRoutes);
app.use('/api/scaling', scalingRoutes);
app.use('/api/statistics', statisticsRoutes);
app.use('/api/tournaments', tournamentRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/event-entry', eventEntryRoutes);
app.use('/api/player-performance', playerPerformanceRoutes);
app.use('/api/team-statistics', teamStatisticsRoutes);
app.use('/api/permissions', permissionRoutes);

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await Promise.all([
    webSocketService.cleanup(),
    distributedMatchStateManager.cleanup(),
    loadBalancerService.cleanup(),
    performanceMonitoringService.cleanup(),
    statisticsService.cleanup()
  ]);
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  await Promise.all([
    webSocketService.cleanup(),
    distributedMatchStateManager.cleanup(),
    loadBalancerService.cleanup(),
    performanceMonitoringService.cleanup(),
    statisticsService.cleanup()
  ]);
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

// Start server
server.listen(port, () => {
  logger.info(`🚀 KP5 Academy Backend server running on port ${port}`);
  logger.info(`Environment: ${process.env['NODE_ENV'] || 'development'}`);
  logger.info(`Health check: http://localhost:${port}/health`);
  logger.info(`WebSocket status: http://localhost:${port}/websocket/status`);
}); 