import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { connectDatabase } from "@/utils/db-utils";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed." });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(422).json({ message: "Email and password are required." });
  }

  let client;
  try {
    client = await connectDatabase();
  } catch {
    return res.status(500).json({ message: "Connection to DB failed." });
  }

  try {
    const db = client.db();
    const user = await db.collection("users").findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const passwordsMatch = await bcrypt.compare(password, user.password);
    if (!passwordsMatch) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET is not set.");

    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email },
      secret,
      { expiresIn: "7d" }
    );

    res.setHeader(
      "Set-Cookie",
      `token=${token}; HttpOnly; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=Strict`
    );
    res.status(200).json({ message: "Signed in." });
  } catch {
    res.status(500).json({ message: "Authentication failed." });
  } finally {
    client.close();
  }
}

export default handler;
