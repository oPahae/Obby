import Room from "../models/Room";
import connect from "../lib/connect";
import mongoose from "mongoose";
import { ObjectId } from "mongodb";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Only POST requests are allowed" });
  }

  try {
    const { id, message } = req.body;
    await connect();

    // Validez l'ID de la Room
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Room ID" });
    }

    // Recherchez la Room
    const room = await Room.findById(id);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    // Validez et convertissez userID en ObjectId
    if (!message.userID || !mongoose.Types.ObjectId.isValid(message.userID)) {
      return res.status(400).json({ message: "Invalid User ID" });
    }

    const newMessage = {
      userID: message.userID,
      username: message.username,
      type: message.type,
      content: message.content,
      date: message.date,
      likes: message.likes,
      tags: message.tags,
    };
    room.messages.push(newMessage);
    await room.save();

    res.status(201).json({
      message: "Message sent successfully",
      msg: newMessage, // Retourne le message ajouté
    });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
}
