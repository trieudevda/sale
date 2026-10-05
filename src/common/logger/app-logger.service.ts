import { Injectable, Logger } from '@nestjs/common';
/**
 * this.logger.log('Product created', {
  context: ProductService.name,
  code: 'PRODUCT_CREATED',
  userId: user.id,
  data: {
    productId: product.id,
  },
});
 */
export interface LogMeta {
  context?: string;
  method?: string;
  path?: string;

  userId?: number | string;

  code?: string;

  data?: unknown;

  error?: unknown;
}

@Injectable()
export class AppLoggerService {
  private readonly logger = new Logger();

  log(message: string, meta?: LogMeta): void {
    this.logger.log(
      this.format(message, meta),
      meta?.context,
    );
  }

  warn(message: string, meta?: LogMeta): void {
    this.logger.warn(
      this.format(message, meta),
      meta?.context,
    );
  }

  error(message: string, meta?: LogMeta): void {
    const stack =
      meta?.error instanceof Error
        ? meta.error.stack
        : undefined;

    this.logger.error(
      this.format(message, meta),
      stack,
      meta?.context,
    );
  }

  debug(message: string, meta?: LogMeta): void {
    this.logger.debug(
      this.format(message, meta),
      meta?.context,
    );
  }

  private format(
    message: string,
    meta?: LogMeta,
  ): string {
    return JSON.stringify({
      message,

      code: meta?.code,

      method: meta?.method,
      path: meta?.path,

      userId: meta?.userId,

      data: meta?.data,

      error:
        meta?.error instanceof Error
          ? {
              name: meta.error.name,
              message: meta.error.message,
            }
          : meta?.error,

      timestamp: new Date().toISOString(),
    });
  }
}