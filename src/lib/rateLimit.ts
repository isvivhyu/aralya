// Simple in-memory rate limiter
// For production, consider using Redis-based solution like @upstash/ratelimit

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

interface RateLimitOptions {
  limit: number; // Number of requests allowed
  window: number; // Time window in milliseconds
  identifier: string; // Unique identifier (IP, user ID, etc.)
}

export function rateLimit(options: RateLimitOptions): {
  success: boolean;
  remaining: number;
  reset: number;
} {
  const { limit, window, identifier } = options;
  const now = Date.now();
  const key = identifier;

  // Clean up expired entries periodically
  if (Math.random() < 0.01) {
    // 1% chance to clean up
    Object.keys(store).forEach((k) => {
      if (store[k].resetTime < now) {
        delete store[k];
      }
    });
  }

  // Get or create entry
  const entry = store[key];

  if (!entry || entry.resetTime < now) {
    // Create new entry or reset expired one
    store[key] = {
      count: 1,
      resetTime: now + window,
    };
    return {
      success: true,
      remaining: limit - 1,
      reset: now + window,
    };
  }

  // Check if limit exceeded
  if (entry.count >= limit) {
    return {
      success: false,
      remaining: 0,
      reset: entry.resetTime,
    };
  }

  // Increment count
  entry.count += 1;
  return {
    success: true,
    remaining: limit - entry.count,
    reset: entry.resetTime,
  };
}

// Get client IP from request (works with both Request and NextRequest)
export function getClientIP(request: Request | { headers: Headers }): string {
  // Try various headers for IP address
  const forwarded = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");
  const cfConnectingIP = request.headers.get("cf-connecting-ip");

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  if (realIP) {
    return realIP;
  }
  if (cfConnectingIP) {
    return cfConnectingIP;
  }

  // Fallback to a default identifier
  return "unknown";
}

// Rate limit configurations
export const RATE_LIMITS = {
  // Sitemap: 10 requests per hour
  sitemap: { limit: 10, window: 60 * 60 * 1000 },
  // API routes: 100 requests per minute
  api: { limit: 100, window: 60 * 1000 },
  // Search: 30 requests per minute
  search: { limit: 30, window: 60 * 1000 },
  // General: 200 requests per minute
  general: { limit: 200, window: 60 * 1000 },
} as const;

