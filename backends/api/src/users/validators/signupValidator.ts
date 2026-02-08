import * as z from "zod";
import usernameValidator from "./usernameValidator.ts";
import emailValidator from "./emailValidator.ts";
import passwordValidator from "./passwordValidator.ts";

const signupValidator = z.object({
  username: usernameValidator,
  email: emailValidator,
  password: passwordValidator,
});

export default signupValidator;
