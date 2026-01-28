import winston from "winston";
const { combine, timestamp, json, errors } = winston.format;
import { ENV } from "../configs/env.ts";

const logger = winston.createLogger({
  level: ENV.LOG_LEVEL,
  format: combine(timestamp(), errors({ stack: true }), json()),
  transports: [new winston.transports.Console()],
});

export default logger;