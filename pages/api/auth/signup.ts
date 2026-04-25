import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcrypt";
import { connectDatabase, insertDocument } from "@/utils/db-utils";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed." });
  }

  const { fullName, email, password, dob } = req.body;

  if (!fullName || typeof fullName !== "string" || fullName.trim().length < 2) {
    return res.status(422).json({ message: "Full name is required." });
  }
  if (!email || typeof email !== "string" || !emailRegex.test(email)) {
    return res.status(422).json({ message: "Invalid email address." });
  }
  if (!password || typeof password !== "string" || password.length < 8) {
    return res.status(422).json({ message: "Password must be at least 8 characters." });
  }
  if (!dob || isNaN(Date.parse(dob))) {
    return res.status(422).json({ message: "Date of birth is required." });
  }

  let client;
  try {
    client = await connectDatabase();
  } catch {
    return res.status(500).json({ message: "Connection to DB failed." });
  }

  try {
    const db = client.db();
    const existing = await db.collection("users").findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "User already exists." });
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    await insertDocument(client, "users", { fullName: fullName.trim(), email, password: hashedPassword, dob });
    res.status(201).json({ message: "User created." });
  } catch {
    res.status(500).json({ message: "Could not create user." });
  } finally {
    client.close();
  }
}

export default handler;
