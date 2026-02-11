import type { Response } from "express";
import type { Result } from "./../types/result.ts";
import { ZodType } from "zod";
import logger from "../utils/logger.ts";

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
 */
const handleRequest = async <T>(
  context: HandlerContext<T>,
): Promise<Response<object>> => {
  try {
    // Destructure the response object from the context
    const { res } = context;

    // Check if input exists on handlerContext
    let serviceResult;
    if ("input" in context) {
      // Destructure the context
      const { input, validator, fun } = context;

      // Read and validate the request
      const validationResult = validator.safeParse(input);

      // Check if the validation was successful and return errors
      if (!validationResult.success) {
        return res.json(validationResult.error.issues[0]);
      }

      // Call the service function
      serviceResult = await fun(validationResult.data);
    } else {
      // Destructure function from the context
      const { fun } = context;

      // Call the service function
      serviceResult = await fun();
    }

    // Check if the service set custom status code
    if (serviceResult.status) {
      res.status(serviceResult.status);
    }

    // Check if the service function completed successfully
    if (serviceResult.success) {
      return res.json(serviceResult);
    }

    // Return errors
    return res.json(serviceResult.error);
  } catch (e) {
    // Log error
    logger.error(e);

    // Destructure the context
    const { res } = context;

    // Return 500
    return res.status(500).json({ error: "Internal server error" });
  }
};

export default handleRequest;
