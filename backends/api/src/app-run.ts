import app from "./app.ts";
import { ENV } from "./configs/env.ts";

app.listen(ENV.API_PORT, () => {
  if (ENV.DEVELOP) {
    console.log("WARNING: Starting server in development mode!");
  }
  if (ENV.DEBUG) {
    console.log("WARNING: Starting in debug mode!");
  }
  console.log(`INFO: Server is starting on port ${ENV.API_PORT}`);
});
