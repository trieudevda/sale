import { Transform, Type } from 'class-transformer';
import {
  IsEnum,
  IsIn,
  IsInt,
  IsNumberString,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { SEARCH_CONFIG } from '../../../../config/search.config';
import type { UserSortKey } from '../../../../config/search.config';
import { UserStatus } from '../enums/user-status.enum';

export class FindUsersQueryDto {
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value !== 'string') {
      return value;
    }

    const keyword = value.trim().replace(/\s+/g, ' ');

    return keyword === '' ? undefined : keyword;
  })
  @IsString()
  @MinLength(SEARCH_CONFIG.keyword.minLength)
  @MaxLength(SEARCH_CONFIG.keyword.maxLength)
  q?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = SEARCH_CONFIG.pagination.defaultPage;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(SEARCH_CONFIG.pagination.maxLimit)
  limit: number = SEARCH_CONFIG.pagination.defaultLimit;

  @IsOptional()
  @IsIn([...SEARCH_CONFIG.user.sortKeys])
  sort: UserSortKey = SEARCH_CONFIG.user.defaultSort;

  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @IsOptional()
  @IsNumberString({ no_symbols: true })
  roleId?: string;
}
