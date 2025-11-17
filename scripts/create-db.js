/**
 * Script to create the PostgreSQL database if it doesn't exist
 * Reads DATABASE_URL from .env file
 */

import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import postgres from "postgres";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, "..");

// Load .env file
function loadEnv() {
  try {
    const envPath = join(rootDir, ".env");
    const envContent = readFileSync(envPath, "utf-8");
    const env = {};
    
    envContent.split("\n").forEach((line) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#")) {
        const [key, ...valueParts] = trimmed.split("=");
        if (key && valueParts.length > 0) {
          env[key.trim()] = valueParts.join("=").trim();
        }
      }
    });
    
    return env;
  } catch (error) {
    console.error("Error reading .env file:", error.message);
    console.error("Make sure you've run 'cp sample.env .env' first");
    process.exit(1);
  }
}

// Parse DATABASE_URL to extract connection details
function parseDatabaseUrl(url) {
  try {
    const urlObj = new URL(url);
    return {
      host: urlObj.hostname,
      port: parseInt(urlObj.port) || 5432,
      user: urlObj.username,
      password: urlObj.password,
      database: urlObj.pathname.slice(1).split("?")[0], // Remove leading / and query params
    };
  } catch (error) {
    console.error("Error parsing DATABASE_URL:", error.message);
    process.exit(1);
  }
}

async function createDatabase() {
  const env = loadEnv();
  const databaseUrl = env.DATABASE_URL;

  if (!databaseUrl) {
    console.error("DATABASE_URL not found in .env file");
    process.exit(1);
  }

  const dbConfig = parseDatabaseUrl(databaseUrl);
  const { host, port, user, password, database } = dbConfig;

  console.log(`Connecting to PostgreSQL at ${host}:${port}...`);

  // Connect to PostgreSQL server (using 'postgres' database to create our target database)
  const adminConnectionString = `postgresql://${user}:${password}@${host}:${port}/postgres`;
  
  // Validate database name is safe (only alphanumeric, underscore, hyphen)
  if (!/^[a-zA-Z0-9_-]+$/.test(database)) {
    console.error(`Invalid database name: ${database}`);
    console.error("Database name can only contain letters, numbers, underscores, and hyphens.");
    process.exit(1);
  }

  // Escape database name for use in SQL (double quotes for identifiers)
  const escapedDatabase = `"${database.replace(/"/g, '""')}"`;

  let sql;
  try {
    sql = postgres(adminConnectionString);
    
    // Check if database exists
    const result = await sql`
      SELECT 1 FROM pg_database WHERE datname = ${database}
    `;

    if (result.length > 0) {
      console.log(`Database '${database}' already exists.`);
    } else {
      console.log(`Creating database '${database}'...`);
      // CREATE DATABASE doesn't support parameterized queries, so we use unsafe with validated input
      await sql.unsafe(`CREATE DATABASE ${escapedDatabase}`);
      console.log(`Database '${database}' created successfully!`);
    }
  } catch (error) {
    if (error.message.includes("does not exist") || error.message.includes("database") && error.message.includes("does not exist")) {
      // Try connecting to template1 instead
      console.log("Trying template1 database...");
      const templateConnectionString = `postgresql://${user}:${password}@${host}:${port}/template1`;
      sql = postgres(templateConnectionString);
      
      const result = await sql`
        SELECT 1 FROM pg_database WHERE datname = ${database}
      `;

      if (result.length > 0) {
        console.log(`Database '${database}' already exists.`);
      } else {
        await sql.unsafe(`CREATE DATABASE ${escapedDatabase}`);
        console.log(`Database '${database}' created successfully!`);
      }
    } else {
      console.error("Error creating database:", error.message);
      console.error("\nMake sure PostgreSQL is running and the connection details in .env are correct.");
      process.exit(1);
    }
  } finally {
    if (sql) {
      await sql.end();
    }
  }
}

createDatabase().catch((error) => {
  console.error("Unexpected error:", error);
  process.exit(1);
});

