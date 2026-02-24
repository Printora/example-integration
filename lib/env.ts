import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    // Server-only variables - never exposed to client
    PRINTORA_API_KEY: z.string().min(1, "PRINTORA_API_KEY is required"),
    PRINTORA_API_URL: z.string().url().default("https://api-staging.printora.ai"),
    PRINTORA_WEBHOOK_SECRET: z.string().min(1, "PRINTORA_WEBHOOK_SECRET is required"),
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  },
  client: {
    // Client-accessible variables (must use NEXT_PUBLIC_ prefix)
    NEXT_PUBLIC_APP_URL: z.string().url(),
  },
  runtimeEnv: {
    // Server variables
    PRINTORA_API_KEY: process.env.PRINTORA_API_KEY,
    PRINTORA_API_URL: process.env.PRINTORA_API_URL,
    PRINTORA_WEBHOOK_SECRET: process.env.PRINTORA_WEBHOOK_SECRET,
    NODE_ENV: process.env.NODE_ENV,
    // Client variables
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
  // Allow Docker builds where env vars are injected at runtime
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});
