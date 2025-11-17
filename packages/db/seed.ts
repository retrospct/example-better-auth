import { db } from "./db";
import { users } from "./schema";
import * as dotenv from "dotenv";

dotenv.config({ path: "../../.env" });

async function seed() {
  console.log("Seeding database...");

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
  }
}

seed();

