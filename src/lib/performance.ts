import React from "react";

// Performance optimization utilities

// Debounce function
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Throttle function
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Memoize function
export function memoize<T extends (...args: any[]) => any>(func: T): T {
  const cache = new Map<string, ReturnType<T>>();
  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key)!;
    }
    const result = func(...args);
    cache.set(key, result);
    return result;
  }) as T;
}

// Lazy load component
export function lazyLoad<T extends React.ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>
): React.LazyExoticComponent<T> {
  return React.lazy(importFunc);
}

// Intersection Observer for lazy loading
export function useIntersectionObserver(
  callback: IntersectionObserverCallback,
  options: IntersectionObserverInit = {}
) {
  const observerRef = React.useRef<IntersectionObserver | null>(null);
  const elementRef = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    observerRef.current = new IntersectionObserver(callback, {
      rootMargin: "100px",
      threshold: 0.1,
      ...options,
    });

    if (elementRef.current) {
      observerRef.current.observe(elementRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [callback, options]);

  return elementRef;
}

// Prefetch route
export function prefetchRoute(href: string) {
  if (typeof window !== "undefined") {
    const link = document.createElement("link");
    link.rel = "prefetch";
    link.href = href;
    document.head.appendChild(link);
  }
}

// Performance monitoring
export function measurePerformance(name: string, fn: () => Promise<any> | any) {
  const start = performance.now();
  const result = fn();
  if (result instanceof Promise) {
    return result.finally(() => {
      const duration = performance.now() - start;
      console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`);
    });
  } else {
    const duration = performance.now() - start;
    console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`);
    return result;
  }
}

// Bundle size analyzer (development only)
export function logBundleSize() {
  if (process.env.NODE_ENV === "development" && typeof window !== "undefined") {
    const resources = performance.getEntriesByType("resource") as PerformanceResourceTiming[];
    const scripts = resources.filter((r) => r.name.endsWith(".js"));
    const totalSize = scripts.reduce((sum, r) => sum + (r.transferSize || 0), 0);
    console.log(`[Bundle] Total JS size: ${(totalSize / 1024).toFixed(2)} KB`);
    scripts.forEach((r) => {
      console.log(`  ${r.name}: ${((r.transferSize || 0) / 1024).toFixed(2)} KB`);
    });
  }
}