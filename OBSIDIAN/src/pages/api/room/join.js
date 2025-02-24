import connect from "../lib/connect";
import Room from "../models/Room";
import User from "../models/User";
import { ObjectId } from "mongoose";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { roomId, userId } = req.body;

    try {
      await connect(); // Connecte la base de données MongoDB

      // Vérifie si la room existe
      const room = await Room.findById(roomId);
      if (!room) {
        return res.status(404).json({ message: "Room not found" });
      }

      // Vérifie si l'utilisateur existe
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Vérifie si l'utilisateur a déjà rejoint la room
      const isUserAlreadyJoined = room.joinedUsers.some(user => user.userID.toString() === userId);
      if (isUserAlreadyJoined) {
        return res.status(400).json({ message: "You have already joined this room" });
      }

      // Vérifie les restrictions de la room
      if (room.boysOnly && user.sex !== "Boy") {
        return res.status(400).json({ message: "This room is only for Boys !" });
      }

      if (room.girlsOnly && user.sex !== "Girl") {
        return res.status(400).json({ message: "This room is only for Girls !" });
      }

      if (room.plus18Only && (!user.age || user.age < 18)) {
        return res.status(400).json({ message: "This room is only for 18+ users !" });
      }

      // Vérifie si le nombre de membres ne dépasse pas la limite
      if (room.members >= room.maxMembers) {
        return res.status(400).json({ message: "Room full :(" });
      }

      // Ajoute l'utilisateur à la room
      room.joinedUsers.push({ userID: userId });
      room.members += 1;
      await room.save();

      // Ajoute la room à l'utilisateur
      user.rooms.push({ roomID: roomId });
      await user.save();

      return res.status(200).json({ message: "Successfully joined the room" });
    } catch (error) {
      console.error("Error joining room:", error);
      return res.status(500).json({ message: "Server error" });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
