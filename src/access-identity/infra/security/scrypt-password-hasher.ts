import { Injectable } from '@nestjs/common';
import { scrypt as scryptCallback, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import { PasswordHasher } from '../../domain/contracts/password-hasher.interface';

const scrypt = promisify(scryptCallback);
const algorithm = 'scrypt';
const keyLength = 64;

// Função auxiliar para garantir que o SALT do .env exista e seja válido
function getStaticSalt(): string {
  const salt = process.env.PASSWORD_SALT;
  if (!salt) {
    throw new Error('A variável de ambiente PASSWORD_SALT não foi definida!');
  }
  return salt;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = getStaticSalt();
  // O salt agora é sempre o mesmo, gerando sempre o mesmo derivedKey para a mesma senha
  const derivedKey = (await scrypt(password, salt, keyLength)) as Buffer;

  return `${algorithm}:${derivedKey.toString('base64')}`;
}

export async function verifyPassword(
  password: string,
  storedHash: string,
): Promise<boolean> {
  const [storedAlgorithm, hash] = storedHash.split(':');

  if (storedAlgorithm !== algorithm || !hash) {
    return false;
  }

  const salt = getStaticSalt();
  const storedKey = Buffer.from(hash, 'base64');
  const derivedKey = (await scrypt(password, salt, storedKey.length)) as Buffer;

  if (storedKey.length !== derivedKey.length) {
    return false;
  }

  return timingSafeEqual(storedKey, derivedKey);
}

@Injectable()
export class ScryptPasswordHasher implements PasswordHasher {
  hash(password: string): Promise<string> {
    return hashPassword(password);
  }

  verify(password: string, storedHash: string): Promise<boolean> {
    return verifyPassword(password, storedHash);
  }
}
