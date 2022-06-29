export interface CreateUserDto {
  id: string;
  email: string;
  password: string;
  firstName?: string;
  lastname?: string;
  permissionLevel?: number;
}
