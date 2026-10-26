import { IsString, Length } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  currentPassword!: string;

  @IsString()
  @Length(10, 255)
  newPassword!: string;
}
