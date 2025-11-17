/**
 * Performance Monitoring Middleware
 * Tracks API response times and identifies slow endpoints
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

interface PerformanceMetrics {
  endpoint: string;
  method: string;
  duration: number;
  statusCode: number;
  timestamp: Date;
}

// Store recent metrics in memory (could be moved to Redis/database for production)
const recentMetrics: PerformanceMetrics[] = [];
const MAX_METRICS = 1000;

// Performance thresholds (in milliseconds)
const THRESHOLDS = {
  FAST: 50,
  MODERATE: 200,
  SLOW: 500,
  VERY_SLOW: 1000,
};

/**
 * Performance monitoring middleware
 * Tracks response time for each request
 */
export function performanceMonitoring(req: Request, res: Response, next: NextFunction): void {
  const startTime = Date.now();

  // Capture the original end method
  const originalEnd = res.end.bind(res);

  // Override res.end to capture completion time
  res.end = function (chunk?: any, encoding?: any, callback?: any): Response {
    const duration = Date.now() - startTime;
    const endpoint = req.route?.path || req.path;
    const method = req.method;
    const statusCode = res.statusCode;

    // Store metric
    const metric: PerformanceMetrics = {
      endpoint,
      method,
      duration,
      statusCode,
      timestamp: new Date(),
    };

    // Add to recent metrics (ring buffer)
    recentMetrics.push(metric);
    if (recentMetrics.length > MAX_METRICS) {
      recentMetrics.shift();
    }

    // Log based on performance
    const level = getPerformanceLevel(duration);
    const message = `[Performance] ${method} ${endpoint} - ${duration}ms - ${statusCode}`;

    switch (level) {
      case 'fast':
        logger.debug(message);
        break;
      case 'moderate':
        logger.info(message);
        break;
      case 'slow':
        logger.warn(message);
        break;
      case 'very_slow':
        logger.error(message);
        break;
    }

    // Add custom header with response time
    res.setHeader('X-Response-Time', `${duration}ms`);

    // Call original end
    return originalEnd(chunk, encoding, callback);
  };

  next();
}

/**
 * Get performance level based on duration
 */
function getPerformanceLevel(duration: number): 'fast' | 'moderate' | 'slow' | 'very_slow' {
  if (duration < THRESHOLDS.FAST) return 'fast';
  if (duration < THRESHOLDS.MODERATE) return 'moderate';
  if (duration < THRESHOLDS.SLOW) return 'slow';
  return 'very_slow';
}

/**
 * Get performance statistics
 */
export function getPerformanceStats(): {
  total: number;
  average: number;
  median: number;
  p95: number;
  p99: number;
  slowest: PerformanceMetrics[];
  byEndpoint: Record<
    string,
    {
      count: number;
      average: number;
      median: number;
      p95: number;
    }
  >;
} {
  if (recentMetrics.length === 0) {
    return {
      total: 0,
      average: 0,
      median: 0,
      p95: 0,
      p99: 0,
      slowest: [],
      byEndpoint: {},
    };
  }

  // Overall stats
  const durations = recentMetrics.map((m) => m.duration).sort((a, b) => a - b);
  const total = recentMetrics.length;
  const average = durations.reduce((sum, d) => sum + d, 0) / total;
  const median = durations[Math.floor(total / 2)];
  const p95 = durations[Math.floor(total * 0.95)];
  const p99 = durations[Math.floor(total * 0.99)];

  // Slowest requests
  const slowest = [...recentMetrics].sort((a, b) => b.duration - a.duration).slice(0, 10);

  // Stats by endpoint
  const byEndpoint: Record<string, PerformanceMetrics[]> = {};
  recentMetrics.forEach((metric) => {
    const key = `${metric.method} ${metric.endpoint}`;
    if (!byEndpoint[key]) {
      byEndpoint[key] = [];
    }
    byEndpoint[key].push(metric);
  });

  const endpointStats: Record<
    string,
    {
      count: number;
      average: number;
      median: number;
      p95: number;
    }
  > = {};

  Object.entries(byEndpoint).forEach(([endpoint, metrics]) => {
    const durations = metrics.map((m) => m.duration).sort((a, b) => a - b);
    const count = metrics.length;
    const average = durations.reduce((sum, d) => sum + d, 0) / count;
    const median = durations[Math.floor(count / 2)];
    const p95 = durations[Math.floor(count * 0.95)];

    endpointStats[endpoint] = {
      count,
      average: Math.round(average),
      median,
      p95,
    };
  });

  return {
    total,
    average: Math.round(average),
    median,
    p95,
    p99,
    slowest,
    byEndpoint: endpointStats,
  };
}

/**
 * Get recent slow requests
 */
export function getSlowRequests(threshold: number = THRESHOLDS.SLOW): PerformanceMetrics[] {
  return recentMetrics.filter((m) => m.duration >= threshold).slice(-20);
}

/**
 * Reset metrics
 */
export function resetMetrics(): void {
  recentMetrics.length = 0;
}

/**
 * Export thresholds for testing
 */
export { THRESHOLDS };
