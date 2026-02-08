import * as repository from "./repository.ts";
import type { User } from "../types/user.ts";
import * as auth from "../utils/authUtils.ts";
import emailValidator from "./validators/emailValidator.ts";
import { ENV } from "../configs/env.ts";
import type { Result } from "../types/result.ts";

export const createUser = async (
  input: Pick<User, "username" | "email"> & { password: string },
): Promise<Result<object>> => {
  const { password, ...fields } = input;

  const user = {
    hash: await auth.hashPassword(password),
    ...fields,
  };

  const result = await repository.createUser(user);

  if (result.success) {
    const user = result.data;
    return {
      ...result,
      status: 201,
      data: {
        user: user,
        refreshToken: auth.issueJWT(user.userId, ENV.REFRESH_TOKEN_EXPIRES),
        accessToken: auth.issueJWT(user.userId, ENV.ACCESS_TOKEN_EXPIRES),
      },
    };
  }

  return result;
};

export const authenticate = async (input: {
  usernameOrEmail: string;
  password: string;
}): Promise<Result<object>> => {
  let user;
  let result;
  const validationResult = emailValidator.safeParse(input.usernameOrEmail);

  if (validationResult.success) {
    user = { email: input.usernameOrEmail };
    result = await repository.getUserByEmail(user);
  } else {
    user = { username: input.usernameOrEmail };
    result = await repository.getUserByUsername(user);
  }

  if (result.success) {
    const { hash, isActive, updatedAt, ...user } = result.data;
    const verifyResult = await auth.verifyPassword(input.password, hash);

    if (verifyResult) {
      return {
        success: result.success,
        data: {
          user: user,
          refreshToken: auth.issueJWT(user.id, ENV.REFRESH_TOKEN_EXPIRES),
          accessToken: auth.issueJWT(user.id, ENV.ACCESS_TOKEN_EXPIRES),
        },
      };
    }

    return {
      success: false,
      error: { code: "401", message: "Incorrect username or password" },
    };
  }

  return result;
};
