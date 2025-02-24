import Room from "../models/Room";
import connect from "../lib/connect"; // Assure-toi d'avoir une fonction connect pour te connecter à la base de données.

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      await connect();
      const { userId } = req.query;

      const rooms = await Room.find({
        "joinedUsers.userID": userId
      }).populate('joinedUsers.userID', 'username email'); // Populate pour obtenir les informations de l'utilisateur

      res.status(200).json(rooms);
    } catch (error) {
      res.status(500).json({ message: "Error fetching rooms", error: error.message });
    }
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
}