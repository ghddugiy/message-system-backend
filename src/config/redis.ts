import Redis from 'ioredis';

/**
 * Redis connection configuration
 * Creates and exports a Redis client instance for BullMQ
 */
export const createRedisConnection = (): Redis => {
  const redisHost = process.env.REDIS_HOST || 'localhost';
  const redisPort = parseInt(process.env.REDIS_PORT || '6379', 10);

  const redis = new Redis({
    host: redisHost,
    port: redisPort,
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  });

  redis.on('connect', () => {
    console.log(`✅ Redis connected successfully on ${redisHost}:${redisPort}`);
  });

  redis.on('error', (err) => {
    console.error('❌ Redis connection error:', err);
  });

  return redis;
};

// Export singleton instance
export const redisConnection = createRedisConnection();
