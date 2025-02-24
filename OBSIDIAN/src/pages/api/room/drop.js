import Room from "../models/Room";
import User from "../models/User";
import connect from "../lib/connect";

export default async function handler(req, res) {
    const { roomID } = req.body;

    if (!roomID) {
      return res.status(400).json({ error: "Room ID is required." });
    }

    try {
      await connect();
      const room = await Room.findById(roomID);
      if (!room) {
        return res.status(404).json({ error: "Room not found" });
      }
      await Room.findByIdAndDelete(roomID);

      // Update the users who joined the room
      for (const user of room.joinedUsers) {
        await User.findByIdAndUpdate(user.userID, {
          $pull: {
            rooms: { roomID: roomID },
          },
        });
      }

      res.status(200).json({ message: "Room deleted successfully !" });
    } catch (error) {
      console.error("Error deleting room:", error);
      res.status(500).json({ error: "Internal server error." });
    }
}