import express from "express";
import cors from "cors";
import passport from "./configs/passport.ts";
import authRouter from "./auth/controller.ts";
import logbookRouter from "./logbooks/controller.ts";
import requireAuth from "./middleware/requireAuth.ts";
import morganMiddleware from "./middleware/morgan.ts";

const app = express();

app.use(cors());
app.use(express.json());
app.use(passport.initialize());
app.use(morganMiddleware);

app.use("/auth", authRouter);
app.use("/logbooks", requireAuth, logbookRouter);

export default app;
