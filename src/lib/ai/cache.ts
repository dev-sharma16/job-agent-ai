import { prisma } from "@/lib/prisma";
import { Redis } from "@upstash/redis";

const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

const CACHE_TTL = 24 * 60 * 60; // 24 hours

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

export class AICache {
  private static instance: AICache;
  private useRedis: boolean;

  private constructor() {
    this.useRedis = !!redis;
  }

  static getInstance(): AICache {
    if (!AICache.instance) {
      AICache.instance = new AICache();
    }
    return AICache.instance;
  }

  private getCacheKey(prefix: string, key: string): string {
    return `ai:${prefix}:${key}`;
  }

  async get<T>(prefix: string, key: string): Promise<T | null> {
    const cacheKey = this.getCacheKey(prefix, key);

    if (this.useRedis && redis) {
      try {
        const cached = await redis.get(cacheKey);
        if (cached) {
          const entry = cached as CacheEntry<T>;
          if (entry.expiresAt > Date.now()) {
            return entry.data;
          }
          await redis.del(cacheKey);
        }
      } catch (error) {
        console.warn("Redis cache get failed, falling back to DB:", error);
      }
    }

    // Fallback to database
    try {
      const dbEntry = await prisma.emailLog.findFirst({
        where: {
          id: cacheKey,
        },
      });
      // Using a generic approach - we'd need a proper cache table
      // For now, return null to indicate cache miss
    } catch {
      // DB fallback failed
    }

    return null;
  }

  async set<T>(prefix: string, key: string, data: T, ttl: number = CACHE_TTL): Promise<void> {
    const cacheKey = this.getCacheKey(prefix, key);
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttl * 1000,
    };

    if (this.useRedis && redis) {
      try {
        await redis.set(cacheKey, JSON.stringify(entry), { ex: ttl });
        return;
      } catch (error) {
        console.warn("Redis cache set failed:", error);
      }
    }

    // Fallback: could store in DB if needed
    // For now, Redis is primary cache
  }

  async invalidate(prefix: string, key: string): Promise<void> {
    const cacheKey = this.getCacheKey(prefix, key);

    if (this.useRedis && redis) {
      try {
        await redis.del(cacheKey);
      } catch (error) {
        console.warn("Redis cache invalidate failed:", error);
      }
    }
  }

  async invalidatePrefix(prefix: string): Promise<void> {
    if (this.useRedis && redis) {
      try {
        const keys = await redis.keys(this.getCacheKey(prefix, "*"));
        if (keys.length > 0) {
          await redis.del(...keys);
        }
      } catch (error) {
        console.warn("Redis cache invalidate prefix failed:", error);
      }
    }
  }

  // Specific cache methods for different AI operations
  async getResumeCache(userId: string, targetRole: string): Promise<any> {
    const key = `${userId}:${targetRole.toLowerCase().replace(/\s+/g, "-")}`;
    return this.get("resume", key);
  }

  async setResumeCache(userId: string, targetRole: string, data: any): Promise<void> {
    const key = `${userId}:${targetRole.toLowerCase().replace(/\s+/g, "-")}`;
    await this.set("resume", key, data);
  }

  async getJDCache(jdHash: string): Promise<any> {
    return this.get("jd", jdHash);
  }

  async setJDCache(jdHash: string, data: any): Promise<void> {
    await this.set("jd", jdHash, data);
  }

  async getInterviewCache(interviewId: string): Promise<any> {
    return this.get("interview", interviewId);
  }

  async setInterviewCache(interviewId: string, data: any): Promise<void> {
    await this.set("interview", interviewId, data);
  }

  async getKeywordCache(resumeHash: string, jdHash: string): Promise<any> {
    const key = `${resumeHash}:${jdHash}`;
    return this.get("keyword", key);
  }

  async setKeywordCache(resumeHash: string, jdHash: string, data: any): Promise<void> {
    const key = `${resumeHash}:${jdHash}`;
    await this.set("keyword", key, data);
  }

  async getLinkedInCache(profileHash: string): Promise<any> {
    return this.get("linkedin", profileHash);
  }

  async setLinkedInCache(profileHash: string, data: any): Promise<void> {
    await this.set("linkedin", profileHash, data);
  }
}

export const aiCache = AICache.getInstance();