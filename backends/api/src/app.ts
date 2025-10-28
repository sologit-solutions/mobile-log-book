import express from "express";
import authRouter from "./auth/routes.ts";
import logbookRouter from "./logbooks/routes.ts";

const app = express();

app.use("/auth", authRouter);
app.use("/logbooks", logbookRouter);

export default app;
