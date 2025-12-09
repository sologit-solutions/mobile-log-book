import express from "express";
import * as z from "zod";
import * as service from "./service.ts";

const router = express.Router();

// TODO: Move validators somewhere else
const emailValidator = z.email({ pattern: z.regexes.html5Email });

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

const loginValidator = z.object({
  usernameOrEmail: z.coerce.string().min(1),
  password: z.coerce.string().min(1),
});

router.post("/signup", async (req, res) => {
  const body = await req.body;
  const validationResult = signupValidator.safeParse(body);
  if (!validationResult.success) {
    return res.json(validationResult.error.issues[0]);
  }
  const serviceResult = await service.createUser(validationResult.data);
  if (!serviceResult.success) {
    return res.json(serviceResult.error);
  }
  return res.json({ success: validationResult.success });
});

router.post("/login", async (req, res) => {
  const body = await req.body;
  const validationResult = loginValidator.safeParse(body);
  if (!validationResult.success) {
    return res.json(validationResult.error.issues[0]);
  }
  await service.authenticate(validationResult.data);
});

router.post("/logout", async (req, res) => {
  return res;
});

export default router;
