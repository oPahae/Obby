import connect from "../lib/connect";
import Room from "../models/Room";

export default async function handler(req, res) {
  try {
    await connect();
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const rooms = await Room.find({ ownerID: userId });

    if (!rooms) {
      return res.status(404).json({ message: "No rooms found" });
    }

    return res.status(200).json(rooms);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}