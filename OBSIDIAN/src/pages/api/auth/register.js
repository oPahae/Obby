import bcrypt from "bcryptjs";
import connect from "../lib/connect";
import User from "../models/User";

export default async function handler(req, res) {

  const { username, email, password, age, sex, country } = req.body;
  if (!username || !email || !password || !sex) {
    return res.status(400).json({ message: "Missing infos" });
  }

  try {
    await connect();
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already used" });
    }
    const existingUser2 = await User.findOne({ username });
    if (existingUser2) {
      return res.status(400).json({ message: "Username already used" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      bio: "",
      age,
      sex,
      country,
      rooms: [],
      img: ""
    });

    await newUser.save();

    return res.status(201).json({ message: "Registered Successfully! You can Login now" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}