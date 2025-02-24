import connect from "../lib/connect";
import Room from "../models/Room";

export default async function handler(req, res) {
  try {
    await connect();
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ message: "Room ID is required" });
    }

    const room = await Room.findById(id);

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    return res.status(200).json({ message: "OK" });
  } catch (error) {
    console.error("Error checking room:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
