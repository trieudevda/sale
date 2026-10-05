import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';

export interface ApiSuccessResponse<T> {
  success: true;
  statusCode: number;
  code: number;
  message: string;
  data: T;
  timestamp: string;
}

export interface ResponseData<T> {
  code?: number;
  message?: string;
  data: T;
}

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, ApiSuccessResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler<ResponseData<T> | T>,
  ): Observable<ApiSuccessResponse<T>> {
    const response = context.switchToHttp().getResponse();

    return next.handle().pipe(
      map((result) => {
        const isCustomResponse =
          result &&
          typeof result === 'object' &&
          'data' in result;

        if (isCustomResponse) {
          const custom = result as ResponseData<T>;

          return {
            success: true,
            statusCode: response.statusCode,
            code: custom.code ?? 0,  // lỗi cụ thể enum từng module
            message: custom.message ?? 'Success',
            data: custom.data,
            timestamp: new Date().toISOString(),
          };
        }

        return {
          success: true,
          statusCode: response.statusCode,
          code: 0,
          message: 'Success',
          data: result as T,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}