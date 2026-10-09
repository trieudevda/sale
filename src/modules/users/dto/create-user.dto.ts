import {
  ArrayNotEmpty,
  IsEmail,
  IsNumberString,
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

class CreateUserDto {
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
  @MaxLength(100)
  @Transform(({ value }) =>
    typeof value === 'string' && value.trim() === '' ? '' : value?.trim(),
  )
  username!: string;

  @IsString()
  @Length(10, 255)
  password!: string;

  @IsOptional()
  @ArrayNotEmpty()
  @IsNumberString({ no_symbols: true }, { each: true })
  roleIds?: string[];
}

export default CreateUserDto;
