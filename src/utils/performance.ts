// Performance Optimization Utilities
// Memoization, debouncing, and other performance helpers

import React, { useCallback, useMemo, useRef, useEffect, useState } from 'react';

/**
 * Custom hook for debounced values
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Custom hook for throttled callbacks
 */
export function useThrottle<T extends (...args: any[]) => any>(callback: T, delay: number): T {
  const callbackRef = useRef(callback);
  const lastCallTimeRef = useRef<number>(0);

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback(
    ((...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastCallTimeRef.current >= delay) {
        lastCallTimeRef.current = now;
        return callbackRef.current(...args);
      }
    }) as T,
    [delay]
  );
}

/**
 * Custom hook for memoized expensive computations
 */
export function useMemoizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T {
  return useCallback(callback, deps);
}

/**
 * Custom hook for deep comparison memoization
 */
export function useDeepMemo<T>(factory: () => T, deps: React.DependencyList): T {
  const ref = useRef<{ deps: React.DependencyList; result: T } | undefined>(undefined);

  if (!ref.current || !areEqual(ref.current.deps, deps)) {
    ref.current = { deps, result: factory() };
  }

  return ref.current.result;
}

/**
 * Deep equality comparison for arrays and objects
 */
function areEqual(a: any, b: any): boolean {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((val, i) => areEqual(val, b[i]));
  }
  if (typeof a === 'object' && typeof b === 'object') {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
    return keysA.every(key => areEqual(a[key], b[key]));
  }
  return false;
}

/**
 * Performance monitoring utilities
 */
export class PerformanceMonitor {
  private static measurements = new Map<string, number[]>();

  static startMeasurement(label: string): string {
    const id = `${label}_${Date.now()}_${Math.random()}`;
    performance.mark(`${id}_start`);
    return id;
  }

  static endMeasurement(id: string, label: string): number {
    performance.mark(`${id}_end`);
    performance.measure(id, `${id}_start`, `${id}_end`);

    const measure = performance.getEntriesByName(id)[0];
    const duration = measure.duration;

    // Store measurement
    if (!this.measurements.has(label)) {
      this.measurements.set(label, []);
    }
    this.measurements.get(label)!.push(duration);

    // Clean up
    performance.clearMarks(`${id}_start`);
    performance.clearMarks(`${id}_end`);
    performance.clearMeasures(id);

    return duration;
  }

  static getAverageTime(label: string): number {
    const times = this.measurements.get(label) || [];
    return times.length ? times.reduce((a, b) => a + b, 0) / times.length : 0;
  }

  static getStats(label: string) {
    const times = this.measurements.get(label) || [];
    if (times.length === 0) return null;

    const sorted = [...times].sort((a, b) => a - b);
    return {
      count: times.length,
      average: times.reduce((a, b) => a + b, 0) / times.length,
      median: sorted[Math.floor(sorted.length / 2)],
      min: sorted[0],
      max: sorted[sorted.length - 1],
      p95: sorted[Math.floor(sorted.length * 0.95)],
    };
  }
}

/**
 * Hook for performance monitoring
 */
export function usePerformanceMonitor(label: string, enabled = false) {
  const measurementRef = useRef<string | null>(null);

  const start = useCallback(() => {
    if (enabled) {
      measurementRef.current = PerformanceMonitor.startMeasurement(label);
    }
  }, [label, enabled]);

  const end = useCallback(() => {
    if (enabled && measurementRef.current) {
      const duration = PerformanceMonitor.endMeasurement(measurementRef.current, label);
      measurementRef.current = null;
      return duration;
    }
    return 0;
  }, [label, enabled]);

  return { start, end };
}

/**
 * Virtual scrolling utilities for large lists
 */
export interface VirtualScrollOptions {
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}

export function calculateVirtualItems(
  itemCount: number,
  scrollTop: number,
  options: VirtualScrollOptions
) {
  const { itemHeight, containerHeight, overscan = 5 } = options;

  const visibleItemCount = Math.ceil(containerHeight / itemHeight);
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(itemCount - 1, startIndex + visibleItemCount + overscan * 2);

  return {
    startIndex,
    endIndex,
    visibleItemCount,
    totalHeight: itemCount * itemHeight,
    offsetY: startIndex * itemHeight,
  };
}

/**
 * Memory usage monitoring
 */
export function getMemoryUsage() {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    return {
      used: Math.round(memory.usedJSHeapSize / 1048576), // MB
      total: Math.round(memory.totalJSHeapSize / 1048576), // MB
      limit: Math.round(memory.jsHeapSizeLimit / 1048576), // MB
    };
  }
  return null;
}

/**
 * Bundle size analysis helper
 */
export function analyzeBundleSize() {
  const scripts = document.querySelectorAll('script[src]');
  let totalSize = 0;

  const sizes = Array.from(scripts)
    .map(script => {
      const src = script.getAttribute('src');
      if (src && src.includes('/static/js/')) {
        // Estimate size based on compressed typical ratios
        // This is rough estimation - use webpack-bundle-analyzer for accurate data
        const isMainBundle = src.includes('main.');
        const isChunk = src.includes('chunk.');

        let estimatedSize = 0;
        if (isMainBundle)
          estimatedSize = 500; // KB
        else if (isChunk)
          estimatedSize = 100; // KB
        else estimatedSize = 50; // KB

        totalSize += estimatedSize;

        return { src, estimatedSize };
      }
      return null;
    })
    .filter(Boolean);

  return { totalSize, scripts: sizes };
}
