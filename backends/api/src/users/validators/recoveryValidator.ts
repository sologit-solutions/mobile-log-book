import * as z from "zod";
import emailValidator from "./emailValidator.ts";

const recoveryValidator = z.object({
  email: emailValidator,
});

export default recoveryValidator;
