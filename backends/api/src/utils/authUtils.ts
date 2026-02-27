import * as argon2 from "argon2";
import jwt from "jsonwebtoken";
import { ENV } from "../configs/env.ts";

export const hashPassword = async (password: string): Promise<string> => {
  return await argon2.hash(password);
};

export const verifyPassword = async (
  password: string,
  hash: string,
): Promise<boolean> => {
  return await argon2.verify(hash, password);
};

export const issueJWT = (userId: string, expiresIn: number): { token: string; expires: number } => {
  const payload = {
    sub: userId,
    iat: Math.floor(Date.now() / 1000),
  };

  const token = jwt.sign(payload, ENV.JWT_SECRET, {
    expiresIn: expiresIn,
    algorithm: "HS256",
  });

  return {
    token: token,
    expires: expiresIn,
  };
};

export const issueRecoveryJWT = (userId: string, expiresIn: number): { token: string; expires: number } => {
  const payload = {
    sub: userId,
    iat: Math.floor(Date.now() / 1000),
    aud: "passwd-recovery",
  };

  const token = jwt.sign(payload, ENV.JWT_SECRET, {
    algorithm: "HS256",
    expiresIn: expiresIn,
  });

  return {
    token: token,
    expires: expiresIn,
  };
};

export const verifyRecoveryJWT = (token: string): string | null => {
  try {
    const payload = jwt.verify(token, ENV.JWT_SECRET, {
      algorithms: ["HS256"],
      audience: "passwd-recovery",
    });
    return payload.sub as string; // return userId from token payload
  } catch (err) {
    console.error("Token verification failed:", err);
    return null;
  }
};
