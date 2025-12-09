import * as z from "zod";

const process_env = {
  // ADD YOUR ENVIRONMENT VARIABLES HERE
  DEVELOP: process.env.DEVELOP,
  DEBUG: process.env.DEBUG,
  API_PORT: process.env.API_PORT,
  JWT_SECRET: process.env.JWT_SECRET,
};

const envSchema = z.object({
  // DEFINE THE OBJECT VALIDATOR
  DEVELOP: z.stringbool().default(true),
  DEBUG: z.stringbool().default(true),
  API_PORT: z.coerce.number().min(0).max(65535).default(8000),
  JWT_SECRET: z.coerce.string().default("secret"),
});

const envKey = envSchema.keyof();

type Env = z.infer<typeof envSchema>;

type EnvKey = z.infer<typeof envKey>;

const ENV: Env = envSchema.parse(process_env);

if (ENV.DEBUG) {
  console.log("DEBUG: Currently loaded environment variables:");
  (Object.keys(ENV) as EnvKey[]).forEach((key: EnvKey) => {
    console.log(
      `DEBUG:\t ${key}${": ".padEnd(16 - key.length, " ")}${ENV[key]}\t ENV: ${
        process.env[key]
      }`,
    );
  });
}

if (ENV.JWT_SECRET === "secret") {
  console.log("WARNING: USING DEFAULT JWT_SECRET!!!");
}

if (ENV.DEVELOP) {
  console.log("WARNING: Starting server in development mode!");
}

if (ENV.DEBUG) {
  console.log("WARNING: Starting in debug mode!");
}

export { ENV };
