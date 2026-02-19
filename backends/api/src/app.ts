import express from "express";
import cors from "cors";
import passport from "./configs/passport.ts";
import usersRouter from "./users/controller.ts";
import logbookRouter from "./logbooks/controller.ts";
import requireAuth from "./middleware/requireAuth.ts";
import requestLogging from "./middleware/requestLogging.ts";

const app = express();

app.use(cors());
app.use(express.json());
app.use(passport.initialize());
app.use(requestLogging);

app.use("/api/users", usersRouter);
app.use("/api/logbooks", requireAuth, logbookRouter);

export default app;
