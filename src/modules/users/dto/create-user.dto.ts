import { IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  username!: string;

  @IsNotEmpty()
  lastName!: string;
  @IsNotEmpty()
  firstName!: string;
  @IsNotEmpty()
  passwordHash!: string;
  @IsNotEmpty()
  phone!: string;
  @IsNotEmpty()
  email!: string;
}
