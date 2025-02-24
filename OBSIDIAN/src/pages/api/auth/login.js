import bcrypt from "bcryptjs";
import connect from "../lib/connect";
import User from "../models/User";
import jwt from "jsonwebtoken";
import { serialize } from "cookie";

const JWT_SECRET = process.env.JWT_SECRET || "1111";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Missing infos" });
  }

  try {
    await connect();

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({ message: "Password incorrect!" });
    }

    // Générer un jeton JWT
    const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, {
      expiresIn: "1d",
    });

    // Enregistrer le jeton dans un cookie
    const serialized = serialize("authToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 7 jours
      path: "/",
    });

    res.setHeader("Set-Cookie", serialized);
    return res.status(200).json({ message: "Logged In Successfully!" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error" });
  }
}