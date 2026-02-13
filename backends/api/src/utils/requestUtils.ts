import type { Response } from "express";
import type { Result } from "./../types/result.ts";
import { ZodType } from "zod";
import logger from "../utils/logger.ts";
import handlePrismaError from "./prismaErrorHandler.ts";

type ContextWithInput<T> = {
  res: Response;
  input: T;
  validator: ZodType<T>;
  fun: (input: T) => Promise<Result<object>>;
};

type ContextWithoutInput = {
  res: Response;
  fun: () => Promise<Result<object>>;
};

type HandlerContext<T> = ContextWithInput<T> | ContextWithoutInput;

const defaultErrorResponse: Result<object> = {
  success: false,
  status: 500,
  error: { message: "Internal server error" },
};

/**
 * Takes a context object as an input. The context of the
 * request contains the response object and the function
 * that should be called.
 *
 * The handlers context can optionally have an input field
 * which defines the input to the function that is to be
 * called, along with a mandatory ZodType validator to
 * validate the input object.
 *
 * If an error occurs in the function call, the function
 * catches the error and returns a 500 response to the
 * client and logs the errors.
 *
 * @template T
 * @param {HandlerContext<T>} context
 * @return {Promise<Response<object>>}
 */
const handleRequest = async <T>(
  context: HandlerContext<T>,
): Promise<Response<object>> => {
  try {
    let result: Result<object> = defaultErrorResponse;
    const { res } = context;

    // Check if input exists on handlerContext
    if ("input" in context) {
      const { input, validator, fun } = context;

      // Read and validate the request
      const validationResult = validator.safeParse(input);

      // Check if the validation was successful and return errors
      if (!validationResult.success) {
        return res.json(validationResult.error.issues[0]);
      }

      // Call the service function
      result = await fun(validationResult.data);
    } else {
      const { fun } = context;

      // Call the service function
      result = await fun();
    }

    return send(res, result);
  } catch (error) {
    // handle errors
    return await errorHandler(error, context);
  }
};

/**
 * Error handler function that can be extended by
 * adding more custom error handlers.
 *
 * @template T
 * @param {unknown} error
 * @param {HandlerContext<T>} context
 * @return {Promise<Response<object>>}
 */
const errorHandler = async <T>(
  error: unknown,
  context: HandlerContext<T>,
): Promise<Response<object>> => {
  let result: Result<object> = defaultErrorResponse;
  logger.error(error);
  const { res } = context;

  // ----- Error handlers begin -----

  result = await handlePrismaError(error, result);

  // ------ Error handlers end ------

  return send(res, result);
};

/**
 * Used to manipulate the response object before sending,
 * adds status to the response object if defined in the result.
 *
 * Can be further extended along with the result type if
 * necessary.
 *
 * @param {Response} res
 * @param {Result<object>} result
 * @return {Response<object>}
 */
const send = (res: Response, result: Result<object>): Response<object> => {
  // Check if the result set custom status code
  if (result.status) {
    res.status(result.status);
  }

  return res.json(result);
};

export default handleRequest;
