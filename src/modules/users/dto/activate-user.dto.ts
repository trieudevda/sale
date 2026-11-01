import {
  ArrayMaxSize,
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  IsNumberString,
} from 'class-validator';

export class ActivateUserDto {
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @ArrayMaxSize(5)
  @IsNumberString({ no_symbols: true }, { each: true })
  roleIds!: string[];
}
