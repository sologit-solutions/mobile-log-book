import * as z from "zod";

const loginValidator = z.object({
  usernameOrEmail: z.coerce.string().min(1),
  password: z.coerce.string().min(1),
});

export default loginValidator;
