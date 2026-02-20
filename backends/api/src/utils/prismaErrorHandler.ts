import { Prisma } from "../generated/client.ts";
import logger from "./logger.ts";
import type { ResultFailure } from "../types/result.ts";

/**
 *
 *
 * @param {unknown} error
 * @param {ResultFailure} result
 * @return {*}  {Promise<ResultFailure>}
 */
const handlerPrismaError = async (
  error: unknown,
  result: ResultFailure,
): Promise<ResultFailure> => {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code !== "P2002") {
      return { success: false, error: { code: error.code } };
    }

    const target = error.meta?.target as string[];

    logger.info(error);

    if (target[0] === "username") {
      return {
        success: false,
        error: {
          code: error.code,
          message: "This username is already in use.",
        },
      };
    }

    if (target[0] === "email") {
      return {
        success: false,
        error: {
          code: error.code,
          message: "This email address is already in use.",
        },
      };
    }
  }
  return result;
};

export default handlerPrismaError;
