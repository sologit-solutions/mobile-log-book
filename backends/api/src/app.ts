import express from "express";
import authRouter from "./auth/controller.ts";
import logbookRouter from "./logbooks/controller.ts";

const app = express();

app.use(express.json());

app.use("/auth", authRouter);
app.use("/logbooks", logbookRouter);

export default app;
