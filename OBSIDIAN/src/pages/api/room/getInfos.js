import connect from "../lib/connect";
import Room from "../models/Room";
import User from "../models/User";

export default async function handler(req, res) {
  const { id } = req.body;
  console.log(id)

  if (!id) {
    return res.status(400).json({ message: "Nothing to show :(" });
  }

  try {
    await connect();
    
    // Trouver la Room et remplir les infos des utilisateurs dans joinedUsers
    const room = await Room.findById(id).populate("joinedUsers.userID", "username email bio age sex country img");

    if (room) {
      return res.status(200).json({
        room: {
          id: room._id.toString(),
          name: room.name,
          ip: room.ip,
          port: room.port,
          owner: room.owner,
          membersCount: room.members,
          maxMembers: room.maxMembers,
          type: room.type,
          description: room.description,
          boysOnly: room.boysOnly,
          girlsOnly: room.girlsOnly,
          plus18Only: room.plus18Only,
          createdAt: room.createdAt,
          joinedUsers: room.joinedUsers, // Contiendra les infos complètes des utilisateurs
        },
      });
    } else {
      return res.status(200).json({ message: "Room not found :(" });
    }
  } catch (error) {
    console.error("Error fetching room:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
