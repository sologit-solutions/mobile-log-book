import express from "express";
import authRouter from "./auth/routes.ts";
import vesselRouter from "./vessels/routes.ts";

const app = express();

app.use("/auth", authRouter);
app.use("/vessels", vesselRouter);

export default app;
