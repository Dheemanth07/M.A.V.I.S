/**
 * @file Loads backend environment variables from the repo-local env file.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import dotenv from "dotenv";

const backendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const envFiles = [
    path.join(backendRoot, ".ENV"),
    path.join(backendRoot, ".env"),
];

for (const envFile of envFiles) {
    if (fs.existsSync(envFile)) {
        dotenv.config({ path: envFile, quiet: true });
        break;
    }
}
