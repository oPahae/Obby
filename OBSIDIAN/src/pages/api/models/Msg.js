import mongoose from "mongoose";

const MsgSchema = new mongoose.Schema(
  {
    userID: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    username: { type: String, required: true },
    type: { type: String, enum: ["text", "image", "video", "audio"], required: true },
    content: { type: String, required: true },
    date: { type: Date, default: Date.now },
    likes: { type: Number, default: 0 },
    tags: { type: [String], default: [] },
  },
  { timestamps: true }
);

export default mongoose.models.Msg || mongoose.model('Msg', MsgSchema);