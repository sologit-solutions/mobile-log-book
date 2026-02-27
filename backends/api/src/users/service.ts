import * as repository from "./repository.ts";
import type { User } from "../types/user.ts";
import * as auth from "../utils/authUtils.ts";
import emailValidator from "./validators/emailValidator.ts";
import { ENV } from "../configs/env.ts";
import type { Result } from "../types/result.ts";
import { get } from "http";
import { th } from "zod/locales";
import logger from "../utils/logger.ts";
import { date } from "zod";

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
    const { hash, isActive, updatedAt, ...user } = result.data;
    return {
      success: result.success,
      status: 201,
      data: {
        user: user,
        refreshToken: auth.issueJWT(user.id, ENV.REFRESH_TOKEN_EXPIRES),
        accessToken: auth.issueJWT(user.id, ENV.ACCESS_TOKEN_EXPIRES),
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
      status: 401,
      error: { code: "401", message: "Incorrect username or password" },
    };
  }

  return result;
};

export const sendRecoveryEmail = async (
  input: { email: string }
): Promise<Result<object>> => {
  let user = null;
  let token = null;
  const validationResult = emailValidator.safeParse(input.email);

  // check if user input is a valid email and if the user exists in the database
  if (validationResult.success) {
    let res = await repository.getUserByEmail({ email: input.email });
    if (!res.success) {
      return {
        success: false,
        status: 401,
        error: { code: "401", message: "User not found" },
      };
    }
    user = res.data;
  } else {
    return {
      success: false,
      status: 401,
      error: { code: "401", message: "Invalid email" },
    };
  }

  // issue recovery token
  token = auth.issueRecoveryJWT(user.id, ENV.RECOVERY_TOKEN_EXPIRES);
  logger.info("Recovery token issued for user: " + user.email);

  // send recovery email
  logger.debug(`User ${user.email} issued recovery token: ${token.token}`); // e-mail sending not implemented yet

  // return email sent confiramtion
  return {
    success: true,
    data: {
      message: "A recovery email, valid for 10 minutes, has been sent.",
    },
  };
};

export const resetPassword = async (
  input: { token: string; password: string }
): Promise<Result<object>> => {
  let userId = null;

  // verify token and extract user id
  try {
    userId = auth.verifyRecoveryJWT(input.token);
    // fail if id null
    if (!userId)
      throw new Error("Invalid or expired token");
  } catch (err) {
    return {
      success: false,
      status: 401,
      error: { code: "401", message: "Invalid or expired token" },
    };
  }

  // hash new password
  const newHash = await auth.hashPassword(input.password);

  // update user password in database
  const result = await repository.SetUserPassword(userId, newHash);

  // check if update was successful
  if (!result.success) {
    return {
      success: false,
      status: 500,
      error: { code: "500", message: "Failed to reset password" },
    };
  }

  // return password reset confirmation
  return {
    success: true,
    data: {
      message: "Password reset successfully.",
    },
  };
};
