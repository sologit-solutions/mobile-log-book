import express from "express";
import cors from "cors";
import passport from "./configs/passport.ts";
import authRouter from "./auth/controller.ts";
import logbookRouter from "./logbooks/controller.ts";

const app = express();

app.use(cors());
app.use(express.json());
app.use(passport.initialize());

app.use("/auth", authRouter);
app.use(
  "/logbooks",
  passport.authenticate("jwt", { session: false }),
  logbookRouter,
);

export default app;
