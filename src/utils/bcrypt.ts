import { hash, compare } from 'bcrypt';

export async function hashPassword(password: string): Promise<string> {
  const salt = 14;
  return await hash(password, salt);
}

export async function checkPassword(
  password: string,
  hashed: string,
): Promise<boolean> {
  return await compare(password, hashed);
}
