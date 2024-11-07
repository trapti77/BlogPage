import mongoose, { Schema } from "mongoose";
const pharmacySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    address: {
      type: [String],
      default: [],
      required: true,
    },
    phone: {
      type: [String],
      default: [],
      required: true,
      match: [/^\d{10}$/, "Please provide a valid phone number"],
    },
    type: {
      type: [String],
      default: [],
      required: true,
    },
    openingtime: {
      type: String,
      required: true,
    },
    closingtime: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      required: true,
      match: [
        /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/,
        "Please provide a valid URL",
      ],
    },
  },
  { timestamps: true }
);

export const Pharmacy = mongoose.model("Pharmacy", pharmacySchema);
