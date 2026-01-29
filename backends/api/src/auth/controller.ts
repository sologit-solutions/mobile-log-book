import express from "express";
import * as service from "./service.ts";
import signupValidator from "../validators/signupValidator.ts";
import loginValidator from "../validators/loginValidator.ts";

const router = express.Router();

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

  return res.json(serviceResult);
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
