import Redis from 'ioredis';
import { env } from './env';

class InMemoryCache {
  private store: Map<string, { value: string; expiresAt?: number }> = new Map();
  private sortedSets: Map<string, Map<string, number>> = new Map();

  async get(key: string): Promise<string | null> {
    const item = this.store.get(key);
    if (!item) return null;
    if (item.expiresAt && Date.now() > item.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return item.value;
  }

  async set(key: string, value: string, mode?: string, duration?: number): Promise<'OK'> {
    let expiresAt: number | undefined;
    if (mode === 'EX' && duration) {
      expiresAt = Date.now() + duration * 1000;
    } else if (mode === 'PX' && duration) {
      expiresAt = Date.now() + duration;
    }
    this.store.set(key, { value, expiresAt });
    return 'OK';
  }

  async del(key: string): Promise<number> {
    const deleted = this.store.delete(key) ? 1 : 0;
    this.sortedSets.delete(key);
    return deleted;
  }

  async incr(key: string): Promise<number> {
    const current = await this.get(key);
    const num = current ? parseInt(current, 10) + 1 : 1;
    await this.set(key, num.toString());
    return num;
  }

  async zadd(key: string, score: number, member: string): Promise<number> {
    let set = this.sortedSets.get(key);
    if (!set) {
      set = new Map();
      this.sortedSets.set(key, set);
    }
    set.set(member, score);
    return 1;
  }

  async zrevrange(key: string, start: number, stop: number, withScores?: string): Promise<string[]> {
    const set = this.sortedSets.get(key);
    if (!set) return [];
    const sorted = Array.from(set.entries()).sort((a, b) => b[1] - a[1]);
    const sliced = sorted.slice(start, stop === -1 ? undefined : stop + 1);
    if (withScores === 'WITHSCORES') {
      const result: string[] = [];
      for (const [member, score] of sliced) {
        result.push(member, score.toString());
      }
      return result;
    }
    return sliced.map(([member]) => member);
  }
}

class CacheService {
  private client: Redis | null = null;
  private inMemoryFallback: InMemoryCache = new InMemoryCache();
  private isConnected = false;

  constructor() {
    if (env.NODE_ENV === 'test') {
      this.isConnected = false;
      return;
    }
    try {
      this.client = new Redis(env.REDIS_URL, {
        maxRetriesPerRequest: 1,
        retryStrategy: () => null, // don't spam reconnection if Redis isn't running
        enableOfflineQueue: false,
        lazyConnect: true,
      });

      this.client.connect().then(() => {
        this.isConnected = true;
        console.log('✅ Connected to Redis cache service');
      }).catch((err) => {
        this.isConnected = false;
        console.log('ℹ️ Redis not reachable — using high-performance In-Memory Cache fallback');
      });

      this.client.on('error', (err) => {
        if (this.isConnected) {
          console.warn('Redis error encountered, routing to in-memory cache:', err.message);
        }
        this.isConnected = false;
      });
    } catch {
      this.isConnected = false;
    }
  }

  async get(key: string): Promise<string | null> {
    if (this.isConnected && this.client) {
      try {
        return await this.client.get(key);
      } catch {
        // Fall back on error
      }
    }
    return this.inMemoryFallback.get(key);
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (this.isConnected && this.client) {
      try {
        if (ttlSeconds) {
          await this.client.set(key, value, 'EX', ttlSeconds);
        } else {
          await this.client.set(key, value);
        }
        return;
      } catch {
        // Fall back
      }
    }
    await this.inMemoryFallback.set(key, value, ttlSeconds ? 'EX' : undefined, ttlSeconds);
  }

  async del(key: string): Promise<void> {
    if (this.isConnected && this.client) {
      try {
        await this.client.del(key);
      } catch {}
    }
    await this.inMemoryFallback.del(key);
  }

  async zadd(key: string, score: number, member: string): Promise<void> {
    if (this.isConnected && this.client) {
      try {
        await this.client.zadd(key, score, member);
        return;
      } catch {}
    }
    await this.inMemoryFallback.zadd(key, score, member);
  }

  async zrevrange(key: string, start: number, stop: number, withScores = false): Promise<string[]> {
    if (this.isConnected && this.client) {
      try {
        return withScores
          ? await this.client.zrevrange(key, start, stop, 'WITHSCORES')
          : await this.client.zrevrange(key, start, stop);
      } catch {}
    }
    return this.inMemoryFallback.zrevrange(key, start, stop, withScores ? 'WITHSCORES' : undefined);
  }
}

export const cache = new CacheService();
