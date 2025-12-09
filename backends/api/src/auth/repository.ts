import { Prisma } from "@prisma/client";
import { prisma } from "../configs/db.ts";
import type { User } from "@prisma/client";

export const createUser = async (
  user: Pick<User, "username" | "email" | "pwdHash">,
) => {
  try {
    await prisma.user.create({
      data: user,
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2002") {
        const target = e.meta?.target as string[];
        if (target[0] === "name") {
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
  return { success: true };
};

export const getPwdHash = async (
  user: Partial<Pick<User, "username" | "email">>,
) => {
  try {
    return await prisma.user.findFirstOrThrow({
      where: {
        OR: [
          user.email ? { email: user.email } : undefined,
          user.username ? { username: user.username } : undefined,
        ].filter(Boolean) as any[],
      },
    });
  } catch (e) {
    // TODO: error handling
  }
};
