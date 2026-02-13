import * as z from "zod";

const loginValidator = z.object({
  usernameOrEmail: z.string().min(1),
  password: z.string().min(1),
});

export default loginValidator;
