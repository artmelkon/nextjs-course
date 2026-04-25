import { connectDatabase } from "@/utils/db-utils";
import bcrypt from "bcrypt";

const SEED_USERS = [
  { email: "test@example.com", password: "password123" },
  { email: "admin@example.com", password: "admin1234" },
];

async function seed() {
  const client = await connectDatabase();
  const db = client.db();

  for (const user of SEED_USERS) {
    const existing = await db.collection("users").findOne({ email: user.email });
    if (existing) {
      console.log(`Skipping ${user.email} — already exists.`);
      continue;
    }
    const hashedPassword = await bcrypt.hash(user.password, 12);
    await db.collection("users").insertOne({ email: user.email, password: hashedPassword });
    console.log(`Created user: ${user.email}`);
  }

  await client.close();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
