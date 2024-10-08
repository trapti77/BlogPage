import mongoose, { Schema } from "mongoose";

const uploadSchema = new Schema(
  {
    avatar: {
      type: [String],
      required: true,
    },
  },
  { timestamps: true }
);

export const Upload = mongoose.model("Upload", uploadSchema);
