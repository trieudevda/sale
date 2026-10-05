import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppLoggerService } from './common/logger/app-logger.service';
import { GlobalExceptionFilter } from './common/exceptions/global-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // app.useLogger(app.get(AppLoggerService));
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
