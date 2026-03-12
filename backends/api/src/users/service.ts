import * as repository from "./repository.ts";
import type { User } from "../types/user.ts";
import * as auth from "../utils/authUtils.ts";
import emailValidator from "./validators/emailValidator.ts";
import { ENV } from "../configs/env.ts";
import type { Result } from "../types/result.ts";
import logger from "../utils/logger.ts";

/** 
 * Takes a validated user input converts it to a user object with a
 * hash for the given password and creates a user in the database using 
 * the method provided by the repository boundary.
 */
export const createUser = async (
  input: Pick<User, "username" | "email"> & { password: string },
): Promise<Result<object>> => {
  // Transform the user input into a user object with hash of password
  const { password, ...fields } = input;
  const user = {
    hash: await auth.hashPassword(password),
    ...fields,
  };

  // Create the user in the database
  const result = await repository.createUser(user);

  // Check if the user creation was successful and send response
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

  // Return errors to handleRequest in requestUtils.ts
  return result;
};

/** 
 * Takes a validated login request body and authenticate the user using
 * the given identifier and verifies that the password matches the hash
 * that is stored in the database.
 */
export const authenticate = async (input: {
  usernameOrEmail: string;
  password: string;
}): Promise<Result<object>> => {
  let user;
  let result;
  // Determine if the input is a username or an email
  const validationResult = emailValidator.safeParse(input.usernameOrEmail);

  // Use the emailValidator result to handle logic both cases
  if (validationResult.success) {
    user = { email: input.usernameOrEmail };
    result = await repository.getUserByEmail(user);
  } else {
    user = { username: input.usernameOrEmail };
    result = await repository.getUserByUsername(user);
  }

  // Check if the user query by identifier was successful
  if (result.success) {
    const { hash, isActive, updatedAt, ...user } = result.data;
    // Verify that the hashes match
    const verifyResult = await auth.verifyPassword(input.password, hash);

    // If the hashes match send login response with tokens
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

    // If the hashes don't match send a 401 response
    return {
      success: false,
      status: 401,
      error: { code: "401", message: "Incorrect username or password" },
    };
  }

  // Return errors to handleRequest in requestUtils.ts
  return result;
};

/** 
 * 
 */
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
  const result = await repository.setUserPassword(userId, newHash);

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
