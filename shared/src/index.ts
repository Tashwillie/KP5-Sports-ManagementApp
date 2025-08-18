// Shared types and utilities for KP5 Academy
// This file exports common types and utilities used across web and mobile apps

// Export all types
export * from './types';
export * from './types/auth';

// Export services
export * from './services/api';
export { RealTimeService } from './services/realTimeService';
export type { RealTimeConfig, RealTimeCallback, MatchState } from './services/realTimeService';
export * from './services/LiveMatchService';

// Export hooks
export * from './hooks/useApi';
export * from './hooks/useRealTime';
export * from './hooks/useLiveMatch';

// Export providers
export * from './providers/RealTimeProvider';

// Export utilities
export * from './utils/constants';
export * from './utils/helpers';

// Statistics
export { RealTimeStatisticsService } from './services/realTimeStatisticsService';
export type { StatisticsUpdate, StatisticsSubscription } from './services/realTimeStatisticsService';
export { useRealTimeStatistics } from './hooks/useRealTimeStatistics';
export type { UseRealTimeStatisticsOptions, UseRealTimeStatisticsReturn } from './hooks/useRealTimeStatistics'; 