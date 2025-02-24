import connect from "../lib/connect";
import Room from "../models/Room";
import User from "../models/User";
import { ObjectId } from "mongoose";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { roomID, userID } = req.body;

    try {
      await connect(); // Connecte la base de données MongoDB

      // Vérifie si la room existe
      const room = await Room.findById(roomID);
      if (!room) {
        return res.status(404).json({ message: "Room not found" });
      }

      // Vérifie si l'utilisateur existe
      const user = await User.findById(userID);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Ajoute l'utilisateur à la room
      room.joinedUsers.pop({ userID: userID });
      room.members -= 1;
      await room.save();

      // Ajoute la room à l'utilisateur
      user.rooms.pop({ roomID: roomID });
      await user.save();

      return res.status(200).json({ message: "Successfully left the room" });
    } catch (error) {
      console.error("Error joining room:", error);
      return res.status(500).json({ message: "Server error" });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}