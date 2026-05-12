import fs from "node:fs";
import path from "node:path";
import { loadDotEnv } from "./env.mjs";

const envPath = path.join(process.cwd(), ".env");
const envExamplePath = path.join(process.cwd(), ".env.example");

loadDotEnv(envPath);

const checks = {
  cwd: process.cwd(),
  dotEnvExists: fs.existsSync(envPath),
  dotEnvExampleExists: fs.existsSync(envExamplePath),
  tourApiKeyLoaded: Boolean(process.env.TOUR_API_KEY),
  tourApiDecodedKeyLoaded: Boolean(process.env.TOUR_API_KEY_DECODED),
};

console.log(JSON.stringify(checks, null, 2));

if (!checks.dotEnvExists) {
  console.log("Create .env in the cwd above. Do not put the key in .env.example.");
}

if (checks.dotEnvExists && !checks.tourApiKeyLoaded && !checks.tourApiDecodedKeyLoaded) {
  console.log("The .env file exists, but TOUR_API_KEY or TOUR_API_KEY_DECODED was not loaded.");
}
