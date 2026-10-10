import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { EntityNotFoundError, QueryFailedError } from 'typeorm';

import { AppLoggerService } from '../logger/app-logger.service';
import {
  DATABASE_CONSTRAINT_MAP,
} from './database-constraint-map';
// DTO sai               → ValidationPipe
// Không tìm thấy        → NotFoundException
// Xung đột trạng thái   → ConflictException
// Request logic sai     → BadRequestException
// Chưa đăng nhập        → UnauthorizedException
// Không đủ quyền        → ForbiddenException
// Constraint DB         → QueryFailedError
// Bug không dự kiến     → 500
interface MySqlDriverError {
  code?: string;
  errno?: number;
  sqlState?: string;
  sqlMessage?: string;
  message?: string;
}

interface HttpExceptionResponse {
  statusCode?: number;
  code?: string;
  message?: string | string[];
  error?: string;
}

interface ResolvedError {
  statusCode: number;
  code: string;
  message: string;
  errors: string[] | null;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: AppLoggerService) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();

    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const result = this.resolveException(exception);

    this.logger.error(result.message, {
      statusCode: result.statusCode,
      code: result.code,
      method: request.method,
      path: request.originalUrl ?? request.url,
      error: exception,
    });

    response.status(result.statusCode).json({
      success: false,

      statusCode: result.statusCode,

      code: result.code,

      message: result.message,

      errors: result.errors,

      data: null,

      method: request.method,

      path: request.originalUrl ?? request.url,

      timestamp: new Date().toISOString(),
    });
  }

  private resolveException(exception: unknown): ResolvedError {
    /*
     * 1. Database errors
     */
    if (exception instanceof QueryFailedError) {
      return this.resolveDatabaseException(exception);
    }
    /*
     * 2. TypeORM findOneOrFail()
     */
    if (exception instanceof EntityNotFoundError) {
      return {
        statusCode: HttpStatus.NOT_FOUND,
        code: 'RESOURCE_NOT_FOUND',
        message: 'Không tìm thấy dữ liệu',
        errors: null,
      };
    }
    /*
     * 3. NestJS exceptions
     */
    if (exception instanceof HttpException) {
      return this.resolveHttpException(exception);
    }
    /*
     * 4. Unknown / programming errors
     */
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Internal server error',
      errors: null,
    };
  }

  private resolveHttpException(exception: HttpException): ResolvedError {
    const statusCode = exception.getStatus();

    const response = exception.getResponse();

    /*
     * Ví dụ:
     *
     * throw new NotFoundException(
     *   'Product not found'
     * );
     */
    if (typeof response === 'string') {
      return {
        statusCode,

        code: this.getDefaultHttpCode(statusCode),

        message: response,

        errors: null,
      };
    }

    const data = response as HttpExceptionResponse;

    /*
     * ValidationPipe thường trả:
     *
     * {
     *   statusCode: 400,
     *   message: [
     *      "...",
     *      "..."
     *   ],
     *   error: "Bad Request"
     * }
     */
    if (Array.isArray(data.message)) {
      return {
        statusCode,

        code: data.code ?? 'VALIDATION_ERROR',

        message: 'Dữ liệu không hợp lệ',

        errors: data.message,
      };
    }

    return {
      statusCode,

      code: data.code ?? this.getDefaultHttpCode(statusCode),

      message: data.message ?? exception.message ?? 'Request failed',

      errors: null,
    };
  }

  private resolveDatabaseException(exception: QueryFailedError): ResolvedError {
    const error = exception.driverError as MySqlDriverError;

    switch (error.code) {
      /*
       * UNIQUE
       */
      case 'ER_DUP_ENTRY':
        return this.resolveDuplicateError(error);

      /*
       * INSERT / UPDATE FK không tồn tại
       */
      case 'ER_NO_REFERENCED_ROW_2':
        return {
          statusCode: HttpStatus.BAD_REQUEST,

          code: 'INVALID_REFERENCE',

          message: 'Dữ liệu liên quan không tồn tại',

          errors: null,
        };

      /*
       * DELETE một record đang được FK tham chiếu
       */
      case 'ER_ROW_IS_REFERENCED_2':
        return {
          statusCode: HttpStatus.CONFLICT,

          code: 'RESOURCE_IN_USE',

          message: 'Không thể xóa dữ liệu vì đang được sử dụng',

          errors: null,
        };

      /*
       * NOT NULL
       */
      case 'ER_BAD_NULL_ERROR':
        return {
          statusCode: HttpStatus.BAD_REQUEST,

          code: 'REQUIRED_FIELD_MISSING',

          message: 'Thiếu dữ liệu bắt buộc',

          errors: null,
        };

      /*
       * VARCHAR quá dài
       */
      case 'ER_DATA_TOO_LONG':
        return {
          statusCode: HttpStatus.BAD_REQUEST,

          code: 'VALUE_TOO_LONG',

          message: 'Dữ liệu vượt quá độ dài cho phép',

          errors: null,
        };

      /*
       * INT / DECIMAL vượt range
       */
      case 'ER_WARN_DATA_OUT_OF_RANGE':
        return {
          statusCode: HttpStatus.BAD_REQUEST,

          code: 'VALUE_OUT_OF_RANGE',

          message: 'Giá trị nằm ngoài phạm vi cho phép',

          errors: null,
        };

      /*
       * ENUM / DATE / kiểu dữ liệu không hợp lệ
       */
      case 'WARN_DATA_TRUNCATED':
      case 'ER_TRUNCATED_WRONG_VALUE':
        return {
          statusCode: HttpStatus.BAD_REQUEST,

          code: 'INVALID_VALUE',

          message: 'Giá trị dữ liệu không hợp lệ',

          errors: null,
        };

      /*
       * DEADLOCK
       */
      case 'ER_LOCK_DEADLOCK':
        return {
          statusCode: HttpStatus.SERVICE_UNAVAILABLE,

          code: 'DATABASE_DEADLOCK',

          message: 'Có xung đột dữ liệu, vui lòng thử lại',

          errors: null,
        };

      /*
       * Lock quá lâu
       */
      case 'ER_LOCK_WAIT_TIMEOUT':
        return {
          statusCode: HttpStatus.SERVICE_UNAVAILABLE,

          code: 'DATABASE_LOCK_TIMEOUT',

          message: 'Hệ thống đang bận, vui lòng thử lại',

          errors: null,
        };

      default:
        return {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,

          code: 'DATABASE_ERROR',

          message: 'Có lỗi xảy ra khi xử lý dữ liệu',

          errors: null,
        };
    }
  }

  private resolveDuplicateError(error: MySqlDriverError): ResolvedError {
    const constraintName = this.extractConstraintName(error.sqlMessage);

    if (constraintName) {
      const constraint = DATABASE_CONSTRAINT_MAP[constraintName];

      if (constraint) {
        return {
          statusCode: HttpStatus.CONFLICT,

          code: constraint.code,

          message: constraint.message,

          errors: null,
        };
      }
    }

    return {
      statusCode: HttpStatus.CONFLICT,

      code: 'DUPLICATE_RESOURCE',

      message: 'Dữ liệu đã tồn tại',

      errors: null,
    };
  }

  private extractConstraintName(sqlMessage?: string): string | null {
    if (!sqlMessage) {
      return null;
    }

    /*
     * MySQL thường:
     *
     * Duplicate entry 'ABC'
     * for key 'products.uq_products_sku'
     *
     * hoặc
     *
     * Duplicate entry 'ABC'
     * for key 'uq_products_sku'
     */

    const match = sqlMessage.match(/for key ['`](?:[^.'`]+\.)?([^'`]+)['`]/i);

    return match?.[1] ?? null;
  }

  private getDefaultHttpCode(statusCode: number): string {
    switch (statusCode) {
      case HttpStatus.BAD_REQUEST:
        return 'BAD_REQUEST';

      case HttpStatus.UNAUTHORIZED:
        return 'UNAUTHORIZED';

      case HttpStatus.FORBIDDEN:
        return 'FORBIDDEN';

      case HttpStatus.NOT_FOUND:
        return 'NOT_FOUND';

      case HttpStatus.CONFLICT:
        return 'CONFLICT';

      case HttpStatus.UNPROCESSABLE_ENTITY:
        return 'UNPROCESSABLE_ENTITY';

      case HttpStatus.TOO_MANY_REQUESTS:
        return 'TOO_MANY_REQUESTS';

      case HttpStatus.SERVICE_UNAVAILABLE:
        return 'SERVICE_UNAVAILABLE';

      default:
        return 'HTTP_ERROR';
    }
  }
}
