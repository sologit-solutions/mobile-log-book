import { Prisma } from "@prisma/client";
import { prisma } from "../configs/db.ts";
import type { User } from "../types/user.ts";
import type { Result } from "../types/result.ts";

export const createUser = async (
  user: Pick<User, "username" | "email" | "hash">,
): Promise<Result<{ userId: string }>> => {
  try {
    const data = await prisma.user.create({
      data: user,
    });

    return { success: true, data: { userId: data.id } };
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code !== "P2002") {
        return { success: false, error: { code: e.code } };
      }

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

    return { success: false, error: { message: "Unknown error" } };
  }
};

export const getUserByEmail = async (
  user: Partial<Pick<User, "username" | "email">>,
): Promise<Result<User>> => {
  try {
    const result = await prisma.user.findFirstOrThrow({
      where: { email: user.email },
    });

    return { success: true, data: result };
  } catch (e) {
    // TODO: error handling
    return { success: false, error: { message: "Unknown error" } };
  }
};

export const getUserByUsername = async (
  user: Partial<Pick<User, "username" | "email">>,
): Promise<Result<User>> => {
  try {
    const result = await prisma.user.findFirstOrThrow({
      where: { username: user.username },
    });

    return { success: true, data: result };
  } catch (e) {
    // TODO: error handling
    return { success: false, error: { message: "Unknown error" } };
  }
};
