/**
 * usePerformance Hook
 * React hooks for tracking component performance
 */

import { useEffect, useRef, useCallback } from 'react';
import { performanceMonitor } from '../utils/performanceMonitoring';

/**
 * Track component mount time
 *
 * @example
 * function MyComponent() {
 *   useComponentPerformance('MyComponent');
 *   return <div>...</div>;
 * }
 */
export function useComponentPerformance(componentName: string): void {
  const mountTime = useRef<number>(Date.now());

  useEffect(() => {
    const duration = Date.now() - mountTime.current;
    performanceMonitor.trackInteraction(`${componentName}:mount`, duration);

    return () => {
      const unmountTime = Date.now();
      const lifetimeDuration = unmountTime - mountTime.current;
      performanceMonitor.trackInteraction(`${componentName}:unmount`, lifetimeDuration, {
        lifetime: lifetimeDuration,
      });
    };
  }, [componentName]);
}

/**
 * Track async operation performance
 *
 * @example
 * function MyComponent() {
 *   const trackAsync = useAsyncPerformance();
 *
 *   const handleSubmit = async () => {
 *     await trackAsync('form-submit', async () => {
 *       await api.submitForm(data);
 *     });
 *   };
 * }
 */
export function useAsyncPerformance() {
  return useCallback(async <T>(name: string, fn: () => Promise<T>): Promise<T> => {
    return performanceMonitor.measure(name, fn, 'interaction');
  }, []);
}

/**
 * Track render count and time
 *
 * @example
 * function MyComponent() {
 *   useRenderPerformance('MyComponent');
 *   return <div>...</div>;
 * }
 */
export function useRenderPerformance(componentName: string): void {
  const renderCount = useRef<number>(0);
  const lastRenderTime = useRef<number>(Date.now());

  renderCount.current++;
  const now = Date.now();
  const timeSinceLastRender = now - lastRenderTime.current;
  lastRenderTime.current = now;

  // Log excessive re-renders
  if (import.meta.env.MODE === 'development') {
    if (renderCount.current > 10 && timeSinceLastRender < 100) {
      console.warn(
        `[Performance] ⚠️ ${componentName} rendered ${renderCount.current} times. Possible optimization needed.`
      );
    }
  }
}

/**
 * Debounce function calls for performance
 *
 * @example
 * function SearchBar() {
 *   const debouncedSearch = useDebounce((query: string) => {
 *     api.search(query);
 *   }, 300);
 *
 *   return <input onChange={(e) => debouncedSearch(e.target.value)} />;
 * }
 */
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );
}

/**
 * Throttle function calls for performance
 *
 * @example
 * function MapView() {
 *   const throttledPan = useThrottle((position: Position) => {
 *     updateMapPosition(position);
 *   }, 100);
 *
 *   return <Map onPan={throttledPan} />;
 * }
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  limit: number
): (...args: Parameters<T>) => void {
  const lastRun = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      const timeSinceLastRun = now - lastRun.current;

      if (timeSinceLastRun >= limit) {
        callback(...args);
        lastRun.current = now;
      } else {
        // Schedule next call
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(
          () => {
            callback(...args);
            lastRun.current = Date.now();
          },
          limit - timeSinceLastRun
        );
      }
    },
    [callback, limit]
  );
}

/**
 * Track lazy loading performance
 *
 * @example
 * function ImageGallery() {
 *   const trackLazyLoad = useLazyLoadPerformance();
 *
 *   return (
 *     <img
 *       src={url}
 *       loading="lazy"
 *       onLoad={() => trackLazyLoad('gallery-image', url)}
 *     />
 *   );
 * }
 */
export function useLazyLoadPerformance() {
  const loadStartTimes = useRef<Map<string, number>>(new Map());

  const startTracking = useCallback((key: string) => {
    loadStartTimes.current.set(key, Date.now());
  }, []);

  const endTracking = useCallback((key: string, resourceName: string) => {
    const startTime = loadStartTimes.current.get(key);
    if (startTime) {
      const duration = Date.now() - startTime;
      performanceMonitor.trackResource(resourceName, duration);
      loadStartTimes.current.delete(key);
    }
  }, []);

  return useCallback(
    (resourceName: string, key?: string) => {
      const trackingKey = key || resourceName;
      endTracking(trackingKey, resourceName);
    },
    [endTracking]
  );
}
