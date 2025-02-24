import bcrypt from "bcryptjs";
import connect from "../lib/connect";
import User from "../models/User";

export default async function handler(req, res) {

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  try {
    await connect();

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.findOneAndUpdate({ email }, { password: hashedPassword });

    return res.status(200).json({ message: "Password reset successfully." });
  } catch (error) {
    return res.status(500).json({ message: "Server error." });
  }
}