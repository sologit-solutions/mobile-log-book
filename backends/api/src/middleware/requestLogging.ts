import morgan from "morgan";
import logger from "../utils/logger.ts";
import { ENV } from "../configs/env.ts";

const morganMiddleware = morgan(ENV.MORGAN, {
  stream: { write: (message) => logger.info(message) },
});

export default morganMiddleware;
