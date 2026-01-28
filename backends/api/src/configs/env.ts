import * as z from "zod";

const process_env = {
  // ADD YOUR ENVIRONMENT VARIABLES HERE
  DEVELOP: process.env.DEVELOP,
  API_PORT: process.env.API_PORT,
  JWT_SECRET: process.env.JWT_SECRET,
  ACCESS_EXPIRES: process.env.ACCESS_TOKEN_EXPIRES,
  REFRESH_EXPIRES: process.env.REFRESH_TOKEN_EXPIRES,
  LOG_LEVEL: process.env.LOG_LEVEL,
  MORGAN: process.env.MORGAN,
};

const envSchema = z.object({
  // DEFINE THE OBJECT VALIDATOR
  DEVELOP: z.stringbool().default(true),
  API_PORT: z.coerce.number().min(0).max(65535).default(8000),
  JWT_SECRET: z.coerce.string().default("secret"),
  ACCESS_TOKEN_EXPIRES: z.coerce
    .number()
    .min(5 * 60)
    .default(15 * 60),
  REFRESH_TOKEN_EXPIRES: z.coerce
    .number()
    .min(24 * 60 * 60)
    .default(30 * 24 * 60 * 60),
  LOG_LEVEL: z
    .enum(["silly", "debug", "verbose", "http", "info", "warn", "error"])
    .default("info"),
  MORGAN: z
    .enum(["combined", "common", "dev", "short", "tiny"])
    .default("common"),
});

type Env = z.infer<typeof envSchema>;

const ENV: Env = envSchema.parse(process_env);

export { process_env, ENV };
