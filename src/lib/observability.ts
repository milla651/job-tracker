/**
 * Wrap an async operation with simple timing logs (dev only).
 * Use for DB-heavy paths when profiling locally.
 */
export async function timed<T>(label: string, fn: () => Promise<T>): Promise<T> {
  if (process.env.NODE_ENV !== "development") {
    return fn();
  }
  const start = performance.now();
  try {
    return await fn();
  } finally {
    const ms = Math.round(performance.now() - start);
    if (ms > 50) {
      console.debug(`[timing] ${label}: ${ms}ms`);
    }
  }
}
