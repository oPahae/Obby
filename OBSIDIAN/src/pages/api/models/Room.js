import mongoose from "mongoose";

const RoomSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    ip: { type: String, required: true },
    port: { type: Number, required: true },
    owner: { type: String, required: true },
    ownerID: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    maxMembers: { type: Number, required: true },
    type: { type: String, enum: ["Studing", "Gaming", "Chatting", "Designing", "Other"] },
    description: { type: String },
    boysOnly: { type: Boolean, default: false },
    girlsOnly: { type: Boolean, default: false },
    plus18Only: { type: Boolean, default: false },
    joinedUsers: [
      {
        userID: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        joinedAt: { type: Date, default: Date.now }
      }
    ],
    members: { type: Number, default: 0 },
    img: { type: String, required: false },
    messages: [
      {
        userID: { type: String, required: true  },
        username: { type: String, required: true },
        type: { type: String, enum: ["text", "image", "video", "audio"], required: true },
        content: { type: String, required: true },
        date: { type: Date, default: Date.now },
        likes: { type: Number, default: 0 },
        tags: { type: [String], default: [] },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.Room || mongoose.model('Room', RoomSchema);