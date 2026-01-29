import app from "./app.ts";
import { ENV, process_env } from "./configs/env.ts";
import logger from "./utils/logger.ts";

if (ENV.LOG_LEVEL == "silly") {
  logger.silly("Process ENV", process_env);
  logger.silly("Loaded ENV", ENV);
}

if (ENV.JWT_SECRET === "secret") {
  logger.warn("USING DEFAULT JWT_SECRET!!!");
}

if (ENV.DEVELOP) {
  logger.info("Starting server in development mode!");
}

app.listen(ENV.API_PORT, () => {
  logger.info(`Server is starting on port ${ENV.API_PORT}`);
});
