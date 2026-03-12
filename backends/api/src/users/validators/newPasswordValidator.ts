import * as z from "zod";
import passwordValidator from "./passwordValidator.ts";

const recoveryValidator = z.object({
  token: z.string().min(1, "Token is required"),
  password: passwordValidator,
});

export default recoveryValidator;
