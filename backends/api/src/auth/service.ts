import * as repository from "./repository.ts";
import * as argon2 from "argon2";
import * as jwt from "jsonwebtoken";
import { ENV } from "../configs/env.ts";
import type { User } from "@prisma/client";
import * as z from "zod";

const emailValidator = z.email({ pattern: z.regexes.html5Email });

const hashPassword = async (password: string) => {
  return await argon2.hash(password); // TODO: Look into hashing options
};

export const createUser = async (
  userdata: Pick<User, "username" | "email"> & { password: string },
) => {
  const { password, ...fields } = userdata;
  const user = {
    pwdHash: await hashPassword(password),
    ...fields,
  };
  return await repository.createUser(user);
};

export const authenticate = async (userdata: {
  usernameOrEmail: string;
  password: string;
}) => {
  let identifier;
  const validationResult = emailValidator.safeParse(userdata.usernameOrEmail);
  if (validationResult.success) {
    identifier = { email: userdata.usernameOrEmail };
  } else {
    identifier = { username: userdata.usernameOrEmail };
  }
  const queryResult = await repository.getPwdHash(identifier);
  if (queryResult) {
    const { pwdHash, ...user } = queryResult;
    if ((await hashPassword(userdata.password)) === pwdHash) {
      jwt.sign(user, ENV.JWT_SECRET);
    }
  }
};
