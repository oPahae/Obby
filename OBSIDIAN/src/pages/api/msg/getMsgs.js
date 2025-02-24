import Room from "../models/Room";
import Msg from "../models/Msg";
import connect from "../lib/connect";

// async function migrateMessages() {
//   await connect();

//   const rooms = await Room.find();
//   for (const room of rooms) {
//     const messageObjects = room.messages; // Messages intégrés
//     const messageIds = [];

//     for (const message of messageObjects) {
//       const newMessage = await Msg.create({
//         userID: message.userID,
//         username: message.username,
//         type: message.type,
//         content: message.content,
//         date: message.date,
//         likes: message.likes,
//         tags: message.tags,
//       });
//       messageIds.push(newMessage._id); // Stocke l'ID du message
//     }

//     room.messages = messageIds; // Remplace les messages par leurs références
//     await room.save();
//   }

//   console.log("Migration Done :D");
// }

// migrateMessages().catch(console.error);

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ error: "Room ID is required." });
    }

    try {
      await connect();

      const room = await Room.findById(id); // Pas de populate

      if (!room) {
        return res.status(404).json({ error: "Room not found." });
      }

      return res.status(200).json(room.messages); // Messages intégrés
    } catch (error) {
      console.error("Error fetching room messages:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  } else {
    return res.status(405).json({ error: "Method not allowed." });
  }
}