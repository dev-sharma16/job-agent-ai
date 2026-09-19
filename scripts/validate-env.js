#!/usr/bin/env node

/**
 * Environment validation script
 * Run with: node scripts/validate-env.js
 */

const requiredEnvVars = [
  // Database
  { key: "DATABASE_URL", description: "Neon PostgreSQL connection string" },
  { key: "DIRECT_URL", description: "Direct PostgreSQL connection for migrations" },

  // NextAuth
  { key: "NEXTAUTH_URL", description: "Application URL (e.g., https://yourdomain.com)" },
  { key: "NEXTAUTH_SECRET", description: "NextAuth secret (min 32 chars)" },

  // OAuth
  { key: "GOOGLE_CLIENT_ID", description: "Google OAuth client ID" },
  { key: "GOOGLE_CLIENT_SECRET", description: "Google OAuth client secret" },
  { key: "LINKEDIN_CLIENT_ID", description: "LinkedIn OAuth client ID" },
  { key: "LINKEDIN_CLIENT_SECRET", description: "LinkedIn OAuth client secret" },

  // AI
  { key: "GEMINI_API_KEY", description: "Google Gemini API key" },

  // Payments
  { key: "RAZORPAY_KEY_ID", description: "Razorpay key ID" },
  { key: "RAZORPAY_KEY_SECRET", description: "Razorpay key secret" },
  { key: "RAZORPAY_WEBHOOK_SECRET", description: "Razorpay webhook secret" },

  // Email
  { key: "RESEND_API_KEY", description: "Resend API key" },
  { key: "EMAIL_FROM", description: "Sender email address" },

  // Redis (Upstash)
  { key: "UPSTASH_REDIS_REST_URL", description: "Upstash Redis REST URL" },
  { key: "UPSTASH_REDIS_REST_TOKEN", description: "Upstash Redis REST token" },

  // Extension
  { key: "EXTENSION_HMAC_KEY", description: "Extension HMAC key (32+ chars)" },
  { key: "COOKIE_ENCRYPTION_KEY", description: "Cookie encryption key (32 chars)" },
];

const optionalEnvVars = [
  { key: "ASSET_STORAGE_PROVIDER", description: "Asset storage provider (vercel-blob/s3/r2)", default: "vercel-blob" },
];

function validateEnv() {
  console.log("🔍 Validating environment variables...\n");

  let hasErrors = false;
  let hasWarnings = false;

  // Check required variables
  for (const { key, description } of requiredEnvVars) {
    const value = process.env[key];
    if (!value) {
      console.error(`❌ MISSING: ${key} - ${description}`);
      hasErrors = true;
    } else if (key === "NEXTAUTH_SECRET" && value.length < 32) {
      console.error(`❌ INVALID: ${key} - ${description} (must be at least 32 characters, got ${value.length})`);
      hasErrors = true;
    } else {
      console.log(`✅ ${key} - ${description}`);
    }
  }

  // Check optional variables
  for (const { key, description, default: defaultValue } of optionalEnvVars) {
    const value = process.env[key];
    if (!value) {
      console.warn(`⚠️  OPTIONAL: ${key} - ${description} (default: ${defaultValue})`);
      hasWarnings = true;
    } else {
      console.log(`✅ ${key} - ${description}`);
    }
  }

  // Validate URL formats
  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.startsWith("postgresql://")) {
    console.error("❌ INVALID: DATABASE_URL must start with postgresql://");
    hasErrors = true;
  }

  if (process.env.NEXTAUTH_URL && !process.env.NEXTAUTH_URL.startsWith("http")) {
    console.error("❌ INVALID: NEXTAUTH_URL must start with http:// or https://");
    hasErrors = true;
  }

  if (process.env.GOOGLE_CLIENT_ID && !process.env.GOOGLE_CLIENT_ID.includes(".apps.googleusercontent.com")) {
    console.warn("⚠️  GOOGLE_CLIENT_ID format may be incorrect");
    hasWarnings = true;
  }

  console.log("\n" + "=".repeat(50));
  if (hasErrors) {
    console.error("❌ Environment validation FAILED");
    process.exit(1);
  } else if (hasWarnings) {
    console.warn("⚠️  Environment validation PASSED with warnings");
    process.exit(0);
  } else {
    console.log("✅ Environment validation PASSED");
    process.exit(0);
  }
}

validateEnv();