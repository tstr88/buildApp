/**
 * Frontend Performance Monitoring
 * Tracks page load times, API calls, and user interactions
 */

interface PerformanceEntry {
  name: string;
  type: 'navigation' | 'api' | 'interaction' | 'resource';
  duration: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

class PerformanceMonitor {
  private entries: PerformanceEntry[] = [];
  private maxEntries: number = 500;
  private enabled: boolean;

  constructor() {
    this.enabled = import.meta.env.MODE === 'development';
    this.initializeNavigationTracking();
  }

  /**
   * Track navigation timing (page load)
   */
  private initializeNavigationTracking(): void {
    if (typeof window === 'undefined' || !window.performance) {
      return;
    }

    window.addEventListener('load', () => {
      setTimeout(() => {
        const perfData = window.performance.timing;
        const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
        const domReadyTime = perfData.domContentLoadedEventEnd - perfData.navigationStart;
        const dnsTime = perfData.domainLookupEnd - perfData.domainLookupStart;
        const tcpTime = perfData.connectEnd - perfData.connectStart;
        const responseTime = perfData.responseEnd - perfData.requestStart;
        const renderTime = perfData.domComplete - perfData.domLoading;

        this.recordEntry({
          name: 'page_load',
          type: 'navigation',
          duration: pageLoadTime,
          timestamp: Date.now(),
          metadata: {
            domReady: domReadyTime,
            dns: dnsTime,
            tcp: tcpTime,
            response: responseTime,
            render: renderTime,
          },
        });

        if (this.enabled) {
          console.log('[Performance] Page load metrics:', {
            pageLoad: `${pageLoadTime}ms`,
            domReady: `${domReadyTime}ms`,
            dns: `${dnsTime}ms`,
            tcp: `${tcpTime}ms`,
            response: `${responseTime}ms`,
            render: `${renderTime}ms`,
          });
        }
      }, 0);
    });
  }

  /**
   * Track API call performance
   */
  trackApiCall(endpoint: string, duration: number, metadata?: Record<string, any>): void {
    this.recordEntry({
      name: endpoint,
      type: 'api',
      duration,
      timestamp: Date.now(),
      metadata,
    });

    if (this.enabled) {
      const level = this.getPerformanceLevel(duration);
      const emoji = level === 'fast' ? '🚀' : level === 'moderate' ? '⚡' : level === 'slow' ? '🐌' : '🔴';
      console.log(`[Performance] ${emoji} API ${endpoint}: ${duration}ms`, metadata || '');
    }
  }

  /**
   * Track user interaction performance (e.g., button clicks, form submissions)
   */
  trackInteraction(name: string, duration: number, metadata?: Record<string, any>): void {
    this.recordEntry({
      name,
      type: 'interaction',
      duration,
      timestamp: Date.now(),
      metadata,
    });

    if (this.enabled && duration > 100) {
      console.log(`[Performance] ⚠️ Slow interaction ${name}: ${duration}ms`, metadata || '');
    }
  }

  /**
   * Track resource load time (images, scripts, etc.)
   */
  trackResource(name: string, duration: number): void {
    this.recordEntry({
      name,
      type: 'resource',
      duration,
      timestamp: Date.now(),
    });
  }

  /**
   * Measure function execution time
   */
  async measure<T>(name: string, fn: () => T | Promise<T>, type: PerformanceEntry['type'] = 'interaction'): Promise<T> {
    const start = performance.now();
    try {
      const result = await Promise.resolve(fn());
      const duration = performance.now() - start;

      this.recordEntry({
        name,
        type,
        duration,
        timestamp: Date.now(),
      });

      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.recordEntry({
        name,
        type,
        duration,
        timestamp: Date.now(),
        metadata: { error: true },
      });
      throw error;
    }
  }

  /**
   * Get performance level
   */
  private getPerformanceLevel(duration: number): 'fast' | 'moderate' | 'slow' | 'very_slow' {
    if (duration < 100) return 'fast';
    if (duration < 300) return 'moderate';
    if (duration < 1000) return 'slow';
    return 'very_slow';
  }

  /**
   * Record performance entry
   */
  private recordEntry(entry: PerformanceEntry): void {
    this.entries.push(entry);
    if (this.entries.length > this.maxEntries) {
      this.entries.shift();
    }
  }

  /**
   * Get performance statistics
   */
  getStats(): {
    total: number;
    byType: Record<string, { count: number; average: number; p95: number }>;
    slowest: PerformanceEntry[];
  } {
    if (this.entries.length === 0) {
      return {
        total: 0,
        byType: {},
        slowest: [],
      };
    }

    // Group by type
    const byType: Record<string, PerformanceEntry[]> = {};
    this.entries.forEach((entry) => {
      if (!byType[entry.type]) {
        byType[entry.type] = [];
      }
      byType[entry.type].push(entry);
    });

    // Calculate stats for each type
    const typeStats: Record<string, { count: number; average: number; p95: number }> = {};
    Object.entries(byType).forEach(([type, entries]) => {
      const durations = entries.map((e) => e.duration).sort((a, b) => a - b);
      const count = entries.length;
      const average = durations.reduce((sum, d) => sum + d, 0) / count;
      const p95 = durations[Math.floor(count * 0.95)] || durations[count - 1];

      typeStats[type] = {
        count,
        average: Math.round(average),
        p95: Math.round(p95),
      };
    });

    // Get slowest entries
    const slowest = [...this.entries].sort((a, b) => b.duration - a.duration).slice(0, 10);

    return {
      total: this.entries.length,
      byType: typeStats,
      slowest,
    };
  }

  /**
   * Log performance report
   */
  logReport(): void {
    const stats = this.getStats();
    console.group('[Performance] Report');
    console.table(stats.byType);
    console.log('Slowest operations:', stats.slowest);
    console.groupEnd();
  }

  /**
   * Clear all entries
   */
  clear(): void {
    this.entries = [];
  }

  /**
   * Enable/disable monitoring
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Check if monitoring is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Export helper functions
export function trackApiCall(endpoint: string, duration: number, metadata?: Record<string, any>): void {
  performanceMonitor.trackApiCall(endpoint, duration, metadata);
}

export function trackInteraction(name: string, duration: number, metadata?: Record<string, any>): void {
  performanceMonitor.trackInteraction(name, duration, metadata);
}

export async function measure<T>(name: string, fn: () => T | Promise<T>): Promise<T> {
  return performanceMonitor.measure(name, fn);
}

export function getPerformanceStats() {
  return performanceMonitor.getStats();
}

export function logPerformanceReport(): void {
  performanceMonitor.logReport();
}

// Auto-log performance report every 5 minutes in development
if (import.meta.env.MODE === 'development') {
  setInterval(() => {
    performanceMonitor.logReport();
  }, 5 * 60 * 1000);
}

// Expose to window for debugging
if (typeof window !== 'undefined') {
  (window as any).performanceMonitor = performanceMonitor;
}
