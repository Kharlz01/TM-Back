import { 
    genSalt, 
    hash, 
    compare 
} from "bcrypt";

import jwt from 'jsonwebtoken';

// Se hace un salteado con una cantidad de caracteres (16) y
// luego hace su encriptacion con el metodo "hash"

export async function hashPassword(plain) {
    const salt = await genSalt(16);
    const encrypt = await hash(plain, salt);
    return encrypt;
}

// "compare" desencripta la contraseña y la compara con la de texto plano

export async function verifyPassword(plain, hash) {
    const verified = await compare(plain, hash);
    return verified;
}

// Esta funcion codifica y genera un token de acceso

export function jwtEncode(payload) {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('No hay llave secreta');
  
    const token = jwt.sign(
      payload, 
      secret,
    );
  
    return token;
}

// Al igual que en el Hash se crea una funcion para comparar
  
export function jwtVerify(encoded) {
    try {
      const secret = process.env.JWT_SECRET;
  
      // Se verifica el token aqui
      const verified = jwt.verify(encoded, secret);
      return verified;
    } catch (err) {
      return null;
    }
  }

