import { Logger, Module, OnApplicationBootstrap } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { GlobalExceptionFilter } from './common/exceptions/global-exception.filter';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { databaseConfig } from 'config/database.config';
import { DataSource } from 'typeorm';
import { AppLoggerService } from './common/logger/app-logger.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],

      useFactory: (
        configService: ConfigService,
      ) => databaseConfig(configService),
    }),
  ],
  controllers: [AppController],
  providers: [AppService, AppLoggerService,
     {
    provide: APP_FILTER,
    useClass: GlobalExceptionFilter,
  },

    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },],
})
export class AppModule  implements OnApplicationBootstrap {
  private readonly logger =
    new Logger(AppModule.name);

  constructor(
    private readonly dataSource: DataSource,
  ) {}

  async onApplicationBootstrap() {
    if (this.dataSource.isInitialized) {console.log('MySQL connection established successfully');
      this.logger.log(
        'MySQL connection established successfully',
      );
    }
  }
 }
