import express from "express";
import * as controller from "./controller.ts";

const router = express.Router();

router.post("/login", (req, res) => {
  return controller.login(req, res);
});

router.post("/logout", (req, res) => {
  return controller.logout(req, res);
});

router.post("/signup", (req, res) => {
  return controller.signup(req, res);
});

export default router;
