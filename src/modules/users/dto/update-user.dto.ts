import { PartialType } from '@nestjs/mapped-types';
import CreateUserDto from './create-user.dto';
import {
  ArrayNotEmpty,
  IsEmail, IsEnum,
  IsNumberString,
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { UserStatus } from '../enums/user-status.enum';

export class UpdateUserDto extends PartialType(CreateUserDto) {

  @IsOptional()
  @IsString()
  id?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  lastName?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value !== 'string') return value;

    const email = value.trim().toLowerCase();

    return email === '' ? undefined : email;
  })
  @IsEmail({}, { message: 'Invalid email' })
  @MaxLength(100)
  email?: string;

  @IsString()
  @Transform(({ value }) => {
    if (typeof value !== 'string') return value;
    const phone = value.trim();
    return phone === '' ? undefined : phone;
  })
  // @MinLength(10)
  // @MaxLength(20)
  @Matches(/^\+?[0-9]{9,20}$/, {
    message: 'Số điện thoại không hợp lệ',
  })
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  address?: string;

  @IsString()
  @Length(10, 255)
  password?: string;

  @IsOptional()
  @ArrayNotEmpty()
  @IsNumberString({ no_symbols: true }, { each: true })
  roleIds?: string[];

  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;
}

export default CreateUserDto;
