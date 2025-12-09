import app from "./app.ts";
import { ENV } from "./configs/env.ts";

app.listen(ENV.API_PORT, () => {
  console.log(`INFO: Server is starting on port ${ENV.API_PORT}`);
});
