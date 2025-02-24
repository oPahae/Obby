import connect from "../lib/connect";
import Room from "../models/Room";

export default async function handler(req, res) {
  const { ip, port } = req.body;

  if (!ip || !port) {
    return res.status(400).json({ message: "IP and port are required." });
  }

  try {
    await connect();
    const room = await Room.findOne({ ip, port: parseInt(port, 10) });

    if (room) {
      return res.status(200).json({
        room: {
          id: room._id.toString(),
          name: room.name,
          ip: room.ip,
          port: room.port,
          owner: room.owner,
          ownerID: room.ownerID,
          maxMembers: room.maxMembers,
          type: room.type,
          description: room.description,
          boysOnly: room.boysOnly,
          girlsOnly: room.girlsOnly,
          plus18Only: room.plus18Only,
          joinedUsers: room.joinedUsers,
          members: room.members,
          img: room.img,
          createdAt: room.createdAt,
          updatedAt: room.updatedAt,
        },
      });
    } else {
      return res.status(200).json({ message: "Room not found !" });
    }
  } catch (error) {
    console.error("Error fetching room:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}