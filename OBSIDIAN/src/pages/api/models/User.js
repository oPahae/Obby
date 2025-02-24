import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    bio: { type: String, required: false },
    age: { type: Number, required: false },
    sex: { type: String, required: false, enum: ["Boy", "Girl"] },
    country: { type: String, required: false },
    rooms: [
      {
        roomID: { type: mongoose.Schema.Types.ObjectId, ref: "Room" },
        joinedAt: { type: Date, default: Date.now },
      },
    ],
    img: { type: String, required: false }
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);