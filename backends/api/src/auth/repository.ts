import { Prisma } from "@prisma/client";
import { prisma } from "../configs/db.ts";
import type { User } from "@prisma/client";

type CreateUserSuccess = {
  success: true;
  data: {
    userId: number;
  };
};

type CreateUserFailure = {
  success: false;
  error: {
    code?: string;
    message?: string;
  };
};

type CreateUserResult = CreateUserSuccess | CreateUserFailure;

export const createUser = async (
  user: Pick<User, "username" | "email" | "hash">,
): Promise<CreateUserResult> => {
  try {
    const data = await prisma.user.create({
      data: user,
    });
    return { success: true, data: { userId: data.id } };
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2002") {
        const target = e.meta?.target as string[];
        if (target[0] === "username") {
          return {
            success: false,
            error: {
              code: e.code,
              message: "This username is already in use.",
            },
          };
        }
        if (target[0] === "email") {
          return {
            success: false,
            error: {
              code: e.code,
              message: "This email address is already in use.",
            },
          };
        }
      }
      return { success: false, error: { code: e.code } };
    }
    return { success: false, error: { message: "Unknown error" } };
  }
};

export const getUserByEmail = async (
  user: Partial<Pick<User, "username" | "email">>,
) => {
  try {
    return await prisma.user.findFirstOrThrow({
      where: { email: user.email },
    });
  } catch (e) {
    // TODO: error handling
  }
};

export const getUserByUsername = async (
  user: Partial<Pick<User, "username" | "email">>,
) => {
  try {
    return await prisma.user.findFirstOrThrow({
      where: { username: user.username },
    });
  } catch (e) {
    // TODO: error handling
  }
};
