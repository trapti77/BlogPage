import mongoose, { Schema } from "mongoose";
const registerSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: Number,
      required: true,
    },
    age: {
      type: Number,
      required: true,
    },
    gender: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
    },
    coverimage: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export const Register = mongoose.model("Register", registerSchema);
