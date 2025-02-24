import connect from "../lib/connect";
import User from "../models/User";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { userId, updatedValues, img } = req.body;

  if (!userId || !updatedValues) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  try {
    await connect();

    // Inclure l'image si elle est passée dans la requête
    if (img) {
      updatedValues.img = img;
    }

    // Mise à jour de l'utilisateur dans la base de données
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updatedValues },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found." });
    }

    return res.status(200).json({ 
      message: "User updated successfully.", 
      user: updatedUser 
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
}
