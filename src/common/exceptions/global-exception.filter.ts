import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from "@nestjs/common";
import { AppLoggerService } from "../logger/app-logger.service";

@Catch()
export class GlobalExceptionFilter
  implements ExceptionFilter
{
  constructor(
    private readonly logger: AppLoggerService,
  ) {}
  
  catch(
    exception: unknown,
    host: ArgumentsHost,
  ) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'INTERNAL_SERVER_ERROR';
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();

      const exceptionResponse =
        exception.getResponse();

      if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        const data = exceptionResponse as {
          code?: string;
          message?: string;
        };

        code = data.code ?? code;
        message = data.message ?? message;
      }
    }

    this.logger.error(message, {
      code,
      method: request.method,
      path: request.url,
      error: exception,
    });

    response.status(status).json({
      success: false,
      code,
      message,
      data: null,
      timestamp: new Date().toISOString(),
    });
  }
}