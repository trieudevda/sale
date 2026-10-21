import { Injectable, PipeTransform, BadRequestException } from '@nestjs/common';
import { isUuidV7 } from '../../database/uuid-v7';

// import { isUuidV7 } from '../database/uuid-v7';

@Injectable()
export class UuidV7Pipe implements PipeTransform {
  transform(value: unknown): string {
    if (!isUuidV7(value)) {
      throw new BadRequestException('Invalid UUIDv7');
    }

    return value;
  }
}
