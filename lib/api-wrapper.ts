import { NextRequest, NextResponse } from 'next/server';
import { logger } from './logger';

export function withLogging(handler: Function) {
  return async (req: NextRequest, context: any) => {
    const startTime = performance.now();
    const method = req.method;
    const pathname = req.nextUrl.pathname;

    try {
      const response = await handler(req, context);
      const duration = (performance.now() - startTime).toFixed(2);

      logger.info({
        type: 'API_METRIC',
        method,
        url: pathname,
        status: response.status,
        durationMs: `${duration}ms`,
      }, `API Request completed: ${method} ${pathname}`);

      return response;
    } catch (error) {
      const duration = (performance.now() - startTime).toFixed(2);

      logger.error({
        type: 'API_METRIC',
        method,
        url: pathname,
        durationMs: `${duration}ms`,
        error: error instanceof Error ? error.message : String(error),
      }, `API Request failed: ${method} ${pathname}`);

      throw error;
    }
  };
}