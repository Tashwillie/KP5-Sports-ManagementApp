import { createClient, RedisClientType } from 'redis';
import { logger } from '../utils/logger';

export interface RedisConfig {
  url: string;
  password?: string;
  db?: number;
  retryDelayOnFailover?: number;
  maxRetriesPerRequest?: number;
}

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  prefix?: string;
}

export interface PubSubMessage {
  type: string;
  data: any;
  timestamp: number;
  source: string;
  target?: string;
}

export class RedisService {
  private client: RedisClientType;
  private subscriber: RedisClientType;
  private publisher: RedisClientType;
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 10;
  private reconnectDelay: number = 1000;

  constructor(config: RedisConfig) {
    this.client = createClient({
      url: config.url,
      password: config.password,
      database: config.db || 0,
      retry_delay_on_failover: config.retryDelayOnFailover || 100,
      max_retries_per_request: config.maxRetriesPerRequest || 3,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > this.maxReconnectAttempts) {
            logger.error('Max Redis reconnection attempts reached');
            return new Error('Max reconnection attempts reached');
          }
          return Math.min(retries * this.reconnectDelay, 5000);
        }
      }
    });

    this.subscriber = this.client.duplicate();
    this.publisher = this.client.duplicate();

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    // Client events
    this.client.on('connect', () => {
      logger.info('Redis client connected');
      this.isConnected = true;
      this.reconnectAttempts = 0;
    });

    this.client.on('ready', () => {
      logger.info('Redis client ready');
    });

    this.client.on('error', (error) => {
      logger.error('Redis client error:', error);
      this.isConnected = false;
    });

    this.client.on('end', () => {
      logger.warn('Redis client connection ended');
      this.isConnected = false;
    });

    this.client.on('reconnecting', () => {
      logger.info('Redis client reconnecting...');
      this.reconnectAttempts++;
    });

    // Subscriber events
    this.subscriber.on('connect', () => {
      logger.info('Redis subscriber connected');
    });

    this.subscriber.on('error', (error) => {
      logger.error('Redis subscriber error:', error);
    });

    // Publisher events
    this.publisher.on('connect', () => {
      logger.info('Redis publisher connected');
    });

    this.publisher.on('error', (error) => {
      logger.error('Redis publisher error:', error);
    });
  }

  async connect(): Promise<void> {
    try {
      await Promise.all([
        this.client.connect(),
        this.subscriber.connect(),
        this.publisher.connect()
      ]);
      logger.info('Redis service connected successfully');
    } catch (error) {
      logger.error('Failed to connect to Redis:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await Promise.all([
        this.client.quit(),
        this.subscriber.quit(),
        this.publisher.quit()
      ]);
      this.isConnected = false;
      logger.info('Redis service disconnected');
    } catch (error) {
      logger.error('Error disconnecting from Redis:', error);
    }
  }

  // Cache operations
  async set(key: string, value: any, options: CacheOptions = {}): Promise<void> {
    try {
      const fullKey = options.prefix ? `${options.prefix}:${key}` : key;
      const serializedValue = JSON.stringify(value);
      
      if (options.ttl) {
        await this.client.setEx(fullKey, options.ttl, serializedValue);
      } else {
        await this.client.set(fullKey, serializedValue);
      }
    } catch (error) {
      logger.error('Redis set error:', error);
      throw error;
    }
  }

  async get<T>(key: string, options: CacheOptions = {}): Promise<T | null> {
    try {
      const fullKey = options.prefix ? `${options.prefix}:${key}` : key;
      const value = await this.client.get(fullKey);
      
      if (!value) return null;
      
      return JSON.parse(value) as T;
    } catch (error) {
      logger.error('Redis get error:', error);
      return null;
    }
  }

  async delete(key: string, options: CacheOptions = {}): Promise<boolean> {
    try {
      const fullKey = options.prefix ? `${options.prefix}:${key}` : key;
      const result = await this.client.del(fullKey);
      return result > 0;
    } catch (error) {
      logger.error('Redis delete error:', error);
      return false;
    }
  }

  async exists(key: string, options: CacheOptions = {}): Promise<boolean> {
    try {
      const fullKey = options.prefix ? `${options.prefix}:${key}` : key;
      const result = await this.client.exists(fullKey);
      return result === 1;
    } catch (error) {
      logger.error('Redis exists error:', error);
      return false;
    }
  }

  async expire(key: string, ttl: number, options: CacheOptions = {}): Promise<boolean> {
    try {
      const fullKey = options.prefix ? `${options.prefix}:${key}` : key;
      const result = await this.client.expire(fullKey, ttl);
      return result === 1;
    } catch (error) {
      logger.error('Redis expire error:', error);
      return false;
    }
  }

  // Hash operations for complex objects
  async hset(key: string, field: string, value: any, options: CacheOptions = {}): Promise<void> {
    try {
      const fullKey = options.prefix ? `${options.prefix}:${key}` : key;
      const serializedValue = JSON.stringify(value);
      await this.client.hSet(fullKey, field, serializedValue);
      
      if (options.ttl) {
        await this.expire(fullKey, options.ttl, options);
      }
    } catch (error) {
      logger.error('Redis hset error:', error);
      throw error;
    }
  }

  async hget<T>(key: string, field: string, options: CacheOptions = {}): Promise<T | null> {
    try {
      const fullKey = options.prefix ? `${options.prefix}:${key}` : key;
      const value = await this.client.hGet(fullKey, field);
      
      if (!value) return null;
      
      return JSON.parse(value) as T;
    } catch (error) {
      logger.error('Redis hget error:', error);
      return null;
    }
  }

  async hgetall(key: string, options: CacheOptions = {}): Promise<Record<string, any> | null> {
    try {
      const fullKey = options.prefix ? `${options.prefix}:${key}` : key;
      const result = await this.client.hGetAll(fullKey);
      
      if (!result || Object.keys(result).length === 0) return null;
      
      const parsed: Record<string, any> = {};
      for (const [field, value] of Object.entries(result)) {
        try {
          parsed[field] = JSON.parse(value);
        } catch {
          parsed[field] = value;
        }
      }
      
      return parsed;
    } catch (error) {
      logger.error('Redis hgetall error:', error);
      return null;
    }
  }

  async hdel(key: string, field: string, options: CacheOptions = {}): Promise<boolean> {
    try {
      const fullKey = options.prefix ? `${options.prefix}:${key}` : key;
      const result = await this.client.hDel(fullKey, field);
      return result > 0;
    } catch (error) {
      logger.error('Redis hdel error:', error);
      return false;
    }
  }

  // List operations
  async lpush(key: string, value: any, options: CacheOptions = {}): Promise<number> {
    try {
      const fullKey = options.prefix ? `${options.prefix}:${key}` : key;
      const serializedValue = JSON.stringify(value);
      return await this.client.lPush(fullKey, serializedValue);
    } catch (error) {
      logger.error('Redis lpush error:', error);
      throw error;
    }
  }

  async rpush(key: string, value: any, options: CacheOptions = {}): Promise<number> {
    try {
      const fullKey = options.prefix ? `${options.prefix}:${key}` : key;
      const serializedValue = JSON.stringify(value);
      return await this.client.rPush(fullKey, serializedValue);
    } catch (error) {
      logger.error('Redis rpush error:', error);
      throw error;
    }
  }

  async lpop<T>(key: string, options: CacheOptions = {}): Promise<T | null> {
    try {
      const fullKey = options.prefix ? `${options.prefix}:${key}` : key;
      const value = await this.client.lPop(fullKey);
      
      if (!value) return null;
      
      return JSON.parse(value) as T;
    } catch (error) {
      logger.error('Redis lpop error:', error);
      return null;
    }
  }

  async rpop<T>(key: string, options: CacheOptions = {}): Promise<T | null> {
    try {
      const fullKey = options.prefix ? `${options.prefix}:${key}` : key;
      const value = await this.client.rPop(fullKey);
      
      if (!value) return null;
      
      return JSON.parse(value) as T;
    } catch (error) {
      logger.error('Redis rpop error:', error);
      return null;
    }
  }

  async lrange<T>(key: string, start: number, stop: number, options: CacheOptions = {}): Promise<T[]> {
    try {
      const fullKey = options.prefix ? `${options.prefix}:${key}` : key;
      const values = await this.client.lRange(fullKey, start, stop);
      
      return values.map(value => {
        try {
          return JSON.parse(value) as T;
        } catch {
          return value as T;
        }
      });
    } catch (error) {
      logger.error('Redis lrange error:', error);
      return [];
    }
  }

  // Set operations
  async sadd(key: string, member: any, options: CacheOptions = {}): Promise<number> {
    try {
      const fullKey = options.prefix ? `${options.prefix}:${key}` : key;
      const serializedMember = JSON.stringify(member);
      return await this.client.sAdd(fullKey, serializedMember);
    } catch (error) {
      logger.error('Redis sadd error:', error);
      throw error;
    }
  }

  async srem(key: string, member: any, options: CacheOptions = {}): Promise<number> {
    try {
      const fullKey = options.prefix ? `${options.prefix}:${key}` : key;
      const serializedMember = JSON.stringify(member);
      return await this.client.sRem(fullKey, serializedMember);
    } catch (error) {
      logger.error('Redis srem error:', error);
      throw error;
    }
  }

  async smembers<T>(key: string, options: CacheOptions = {}): Promise<T[]> {
    try {
      const fullKey = options.prefix ? `${options.prefix}:${key}` : key;
      const members = await this.client.sMembers(fullKey);
      
      return members.map(member => {
        try {
          return JSON.parse(member) as T;
        } catch {
          return member as T;
        }
      });
    } catch (error) {
      logger.error('Redis smembers error:', error);
      return [];
    }
  }

  async sismember(key: string, member: any, options: CacheOptions = {}): Promise<boolean> {
    try {
      const fullKey = options.prefix ? `${options.prefix}:${key}` : key;
      const serializedMember = JSON.stringify(member);
      return await this.client.sIsMember(fullKey, serializedMember);
    } catch (error) {
      logger.error('Redis sismember error:', error);
      return false;
    }
  }

  // Pub/Sub operations
  async publish(channel: string, message: PubSubMessage): Promise<number> {
    try {
      const serializedMessage = JSON.stringify(message);
      return await this.publisher.publish(channel, serializedMessage);
    } catch (error) {
      logger.error('Redis publish error:', error);
      throw error;
    }
  }

  async subscribe(channel: string, callback: (message: PubSubMessage) => void): Promise<void> {
    try {
      await this.subscriber.subscribe(channel, (message) => {
        try {
          const parsedMessage = JSON.parse(message) as PubSubMessage;
          callback(parsedMessage);
        } catch (error) {
          logger.error('Failed to parse Redis message:', error);
        }
      });
    } catch (error) {
      logger.error('Redis subscribe error:', error);
      throw error;
    }
  }

  async unsubscribe(channel: string): Promise<void> {
    try {
      await this.subscriber.unsubscribe(channel);
    } catch (error) {
      logger.error('Redis unsubscribe error:', error);
    }
  }

  // Pattern subscription for multiple channels
  async psubscribe(pattern: string, callback: (channel: string, message: PubSubMessage) => void): Promise<void> {
    try {
      await this.subscriber.pSubscribe(pattern, (message, channel) => {
        try {
          const parsedMessage = JSON.parse(message) as PubSubMessage;
          callback(channel, parsedMessage);
        } catch (error) {
          logger.error('Failed to parse Redis pattern message:', error);
        }
      });
    } catch (error) {
      logger.error('Redis psubscribe error:', error);
      throw error;
    }
  }

  async punsubscribe(pattern: string): Promise<void> {
    try {
      await this.subscriber.pUnsubscribe(pattern);
    } catch (error) {
      logger.error('Redis punsubscribe error:', error);
    }
  }

  // Utility methods
  async flushdb(): Promise<void> {
    try {
      await this.client.flushDb();
      logger.info('Redis database flushed');
    } catch (error) {
      logger.error('Redis flushdb error:', error);
      throw error;
    }
  }

  async ping(): Promise<string> {
    try {
      return await this.client.ping();
    } catch (error) {
      logger.error('Redis ping error:', error);
      throw error;
    }
  }

  async info(): Promise<string> {
    try {
      return await this.client.info();
    } catch (error) {
      logger.error('Redis info error:', error);
      throw error;
    }
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const pong = await this.ping();
      return pong === 'PONG';
    } catch (error) {
      logger.error('Redis health check failed:', error);
      return false;
    }
  }

  // Get connection status
  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  // Get server info
  async getServerInfo(): Promise<Record<string, any>> {
    try {
      const info = await this.info();
      const lines = info.split('\r\n');
      const serverInfo: Record<string, any> = {};
      
      for (const line of lines) {
        if (line.includes(':')) {
          const [key, value] = line.split(':');
          serverInfo[key] = value;
        }
      }
      
      return serverInfo;
    } catch (error) {
      logger.error('Failed to get Redis server info:', error);
      return {};
    }
  }
}

// Create and export a singleton instance
const redisService = new RedisService({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0'),
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3
});

export default redisService;
