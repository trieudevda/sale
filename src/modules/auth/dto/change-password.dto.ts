import { IsString, Length } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  @Length(10, 255)
  currentPassword!: string;

  @IsString()
  @Length(10, 255)
  newPassword!: string;
}
