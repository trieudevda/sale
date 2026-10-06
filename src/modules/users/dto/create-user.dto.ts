import { IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  username!: string;

  @IsNotEmpty()
  passwordHash!: string;
  @IsNotEmpty()
  phone!: string;
  @IsNotEmpty()
  email!: string;
}
