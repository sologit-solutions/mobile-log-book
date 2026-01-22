import * as z from "zod";
import emailValidator from "./emailValidator.ts";

const signupValidator = z.object({
  username: z.coerce
    .string()
    .min(3, { message: "Username must contain at least 3 characters." })
    .max(20, { message: "Username cannot exceed 20 characters." })
    .regex(
      /^[A-Za-z0-9_]+$/,
      "Usernames may only contain letters, numbers and underscores.",
    ),
  email: emailValidator,
  password: z.coerce.string().min(8), // TODO: Add password validator pattern.
});

export default signupValidator;
