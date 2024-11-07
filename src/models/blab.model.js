import mongoose, { Schema } from "mongoose";

const labSchema = new Schema(
  {
    labname: {
      type: String,
      required: true,
    },
    address: {
      type: [String],
      default: [],
      required: true,
      validate: {
        validator: function (value) {
          // Check for uniqueness in the array
          return value.length === new Set(value).size;
        },
        message: "address array contains duplicate values.",
      },
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

export const Lab = mongoose.model("Lab", labSchema);
