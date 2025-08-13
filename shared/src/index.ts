// Shared types and utilities for KP5 Academy
// This file exports common types and utilities used across web and mobile apps

// Export all types
export * from './types';

// Export services
export * from './services/api';
export { RealTimeService, RealTimeConfig, RealTimeCallback, MatchState } from './services/realTimeService';
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
export { RealTimeStatisticsService, StatisticsUpdate, StatisticsSubscription } from './services/realTimeStatisticsService';
export { useRealTimeStatistics, UseRealTimeStatisticsOptions, UseRealTimeStatisticsReturn } from './hooks/useRealTimeStatistics'; 