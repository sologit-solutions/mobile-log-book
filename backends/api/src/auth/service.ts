import * as repository from "./repository.ts";
import type { User } from "@prisma/client";
import * as auth from "../utils/authUtils.ts";
import emailValidator from "./validators/emailValidator.ts";

export const createUser = async (
  userdata: Pick<User, "username" | "email"> & { password: string },
) => {
  const { password, ...fields } = userdata;
  const user = {
    hash: await auth.hashPassword(password),
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
    const { hash, ...user } = queryResult;
    const verifyResult = await auth.verifyPassword(userdata.password, hash);
    if (verifyResult) {
      return auth.issueJWT(user.id);
    }
  }
};
