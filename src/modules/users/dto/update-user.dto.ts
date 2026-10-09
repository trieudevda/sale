import { PartialType } from '@nestjs/mapped-types';
import CreateUserDto from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {}
// import {
//   ArrayNotEmpty,
//   IsArray,
//   IsEnum,
//   IsInt,
//   IsNotEmpty,
//   IsNumberString,
//   IsOptional,
//   IsString,
//   Matches,
//   MaxLength,
//   MinLength,
// } from 'class-validator';
// import { Transform } from 'class-transformer';
// import { UserStatus } from '../enums/user-status.enum';
// import { Role } from '../../authorization/entities/roles.entity';
//
// class CreateUserDto {
//   @IsOptional()
//   @Matches(/^[1-9]\d*$/, {
//     message: 'ID phải là số nguyên dương',
//   })
//   @IsNumberString(
//     { no_symbols: true },
//     { message: 'ID phải là số nguyên hợp lệ' },
//   )
//   id?: string;
//
//   @IsString()
//   @MaxLength(100)
//   firstName?: string;
//
//   @IsString()
//   @MaxLength(100)
//   lastName?: string;
//
//   @IsOptional()
//   @IsString()
//   @Transform(({ value }) =>
//     typeof value === 'string' && value.trim() === '' ? '' : value?.trim(),
//   )
//   email?: string;
//
//   @IsOptional()
//   @Transform(({ value }) =>
//     typeof value === 'string' && value.trim() === '' ? '' : value?.trim(),
//   )
//   @IsString()
//   @MinLength(10)
//   @MaxLength(20)
//   phone?: string;
//
//   @IsOptional()
//   @IsString()
//   @MaxLength(255)
//   address?: string;
//
//   @IsOptional()
//   @MaxLength(100)
//   @Transform(({ value }) =>
//     typeof value === 'string' && value.trim() === '' ? '' : value?.trim(),
//   )
//   @IsString()
//   username?: string;
//
//   @IsOptional()
//   passwordHash?: string;
//
//   @IsOptional()
//   @Transform(({ value }) =>
//     typeof value === 'number' && value > 0 ? value : 0,
//   )
//   @IsInt()
//   authVersion?: number;
//
//   @IsOptional()
//   @ArrayNotEmpty()
//   @IsNumberString({ no_symbols: true }, { each: true })
//   roleIds?: string[];
//
//   @IsOptional()
//   @IsEnum(UserStatus, { message: 'status không hợp lệ' })
//   status?: UserStatus;
// }
//
// export default CreateUserDto;
