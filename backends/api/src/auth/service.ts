import * as repository from "./repository.ts";
import type { User } from "@prisma/client";
import * as auth from "../utils/authUtils.ts";
import emailValidator from "./validators/emailValidator.ts";
import { ENV } from "../configs/env.ts";

export const createUser = async (
  userdata: Pick<User, "username" | "email"> & { password: string },
) => {
  const { password, ...fields } = userdata;
  const user = {
    hash: await auth.hashPassword(password),
    ...fields,
  };
  const result = await repository.createUser(user);
  if (result.success) {
    return {
      ...result,
      data: auth.issueJWT(result.data?.userId, ENV.REFRESH_TOKEN_EXPIRES),
    };
  }
  return result;
};

export const authenticate = async (userdata: {
  usernameOrEmail: string;
  password: string;
}) => {
  let user;
  let queryResult;
  const validationResult = emailValidator.safeParse(userdata.usernameOrEmail);
  if (validationResult.success) {
    user = { email: userdata.usernameOrEmail };
    queryResult = await repository.getUserByEmail(user);
  } else {
    user = { username: userdata.usernameOrEmail };
    queryResult = await repository.getUserByUsername(user);
  }
  if (queryResult.success) {
    const { hash, ...user } = queryResult.data;
    const verifyResult = await auth.verifyPassword(userdata.password, hash);
    if (verifyResult) {
      return auth.issueJWT(user.id, ENV.REFRESH_TOKEN_EXPIRES);
    }
  }
};
