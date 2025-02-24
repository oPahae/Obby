export const config = {
  api: {
    bodyParser: {
      sizeLimit: '5mb', // Augmente la limite à 5 Mo
    },
  },
};

import Room from "../models/Room";
import User from "../models/User";
import connect from "../lib/connect";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { name, img, ip, port, owner, ownerID, maxMembers, type, description, boysOnly, girlsOnly, plus18Only } = req.body;
    // return res.status(400).json({ message: Number(maxMembers) });
    
    try {
      await connect();
      const newRoom = new Room({
        name,
        ip,
        port,
        owner,
        ownerID,
        maxMembers,
        type,
        description,
        boysOnly,
        girlsOnly,
        plus18Only,
        joinedUsers: [
          {
            userID: ownerID,
            joinedAt: new Date(),
          },
        ],
        members: 1,
        img
      });
      const savedRoom = await newRoom.save();

      // Mise à jour du modèle User pour l'ajout de la salle dans la liste des rooms
      await User.findByIdAndUpdate(ownerID, {
        $push: {
          rooms: {
            roomID: savedRoom._id,
            joinedAt: new Date(),
          },
        },
      });

      res.status(201).json(savedRoom);
    } catch (error) {
      console.error("Error creating room:", error);
      res.status(500).json({ error: "Internal server error." });
    }
  } else {
    res.status(405).json({ error: "Method not allowed." });
  }
}