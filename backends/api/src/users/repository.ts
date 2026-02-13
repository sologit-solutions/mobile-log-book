import { prisma } from "../configs/db.ts";
import type { User } from "../types/user.ts";
import type { Result } from "../types/result.ts";

export const createUser = async (
  user: Pick<User, "username" | "email" | "hash">,
): Promise<Result<{ userId: string }>> => {
  const data = await prisma.user.create({
    data: user,
  });

  return { success: true, data: { userId: data.id } };
};

export const getUserByEmail = async (
  user: Partial<Pick<User, "username" | "email">>,
): Promise<Result<User>> => {
  const result = await prisma.user.findFirstOrThrow({
    where: { email: user.email },
  });

  return { success: true, data: result };
};

export const getUserByUsername = async (
  user: Partial<Pick<User, "username" | "email">>,
): Promise<Result<User>> => {
  const result = await prisma.user.findFirstOrThrow({
    where: { username: user.username },
  });

  return { success: true, data: result };
};
