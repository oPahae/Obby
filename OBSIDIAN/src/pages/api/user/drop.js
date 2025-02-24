import connect from "../lib/connect";
import User from "../models/User";
import Room from "../models/Room";

export default async function handler(req, res) {
  try {
    await connect();
    const { id } = req.query;
    const user = await User.findById(id);

    for (const room of user.rooms) {
      await Room.findByIdAndUpdate(room.roomID, {
        $pull: { joinedUsers: { userID: id } },
        $inc: { members: -1 },
      });
    }

    await User.findByIdAndDelete(id);

    res.status(200).json({ message: "User account deleted successfully !" });
  } catch (error) {
    console.error("Error deleting user account:", error);
    res.status(500).json({ message: "Internal server error." });
  }
}