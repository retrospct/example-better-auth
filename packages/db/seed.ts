import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { users } from "./schema";
import * as schema from "./schema";
import * as dotenv from "dotenv";

dotenv.config({ path: "../../.env" });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

async function seed() {
  console.log("Seeding database...");

  // Create a connection for seeding that we can close
  const client = postgres(connectionString);
  const db = drizzle(client, { schema });

  try {
    // Example seed data - you can modify this as needed
    const seedUsers = [
      {
        id: "user_1",
        name: "Test User",
        email: "test@example.com",
        emailVerified: null,
        image: null,
      },
    ];

    for (const user of seedUsers) {
      await db.insert(users).values(user).onConflictDoNothing();
    }

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  } finally {
    // Close the database connection
    await client.end();
  }
}

seed();
