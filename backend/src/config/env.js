import dotenv from "dotenv";

dotenv.config();

// ==============================
// REQUIRED ENVIRONMENT VARIABLES
// ==============================
const requiredEnv = [
  "PORT",
  "NODE_ENV",
  "DB_HOST",
  "DB_PORT",
  "DB_NAME",
  "DB_USER",
  "JWT_SECRET",
  "JWT_EXPIRES",
];

// ==============================
// VALIDATE ENV
// ==============================
for (const key of requiredEnv) {
  if (!process.env[key] || process.env[key].trim() === "") {
    console.error(`❌ Missing environment variable: ${key}`);
    process.exit(1);
  }
}

// ==============================
// EXPORT ENV
// ==============================
const env = {
  PORT: Number(process.env.PORT),
  NODE_ENV: process.env.NODE_ENV,

  DB_HOST: process.env.DB_HOST,
  DB_PORT: Number(process.env.DB_PORT),
  DB_NAME: process.env.DB_NAME,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD || "",

  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES: process.env.JWT_EXPIRES,
};

export default env;
