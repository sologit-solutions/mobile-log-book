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

export const issueJWT = (userId: number): Object => {
  const expiresIn = "1d";

  const payload = {
    sub: userId,
    iat: Date.now(),
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
