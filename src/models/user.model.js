import mongoose, { Schema } from "mongoose";

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
        unique: true,  // Ensure this is what you need, or remove it if categories can repeat
        lowercase: true,
        trim: true,
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
        maxlength: 500,  // Example: Limit description length
    },
    avatar: {
        type: String,
        required: true,  // Avatar is required, so ensure upload is handled
    },
    coverimage: {
        type: String,
        default: "",  // Optional, set a default if necessary
    },
    refreshToken: {
        type: String,
        default: "",  // Optional, can be null initially
    },
}, { timestamps: true });

// Export the User model
export const User = mongoose.model("User", userSchema);
