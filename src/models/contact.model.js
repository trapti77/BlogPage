import mongoose, { Schema } from "mongoose";

const ContactSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique:true
    },
    message: {
        type: String,
        required: true,
        maxlength:1000
    }
}, { timestamps: true })

export const Contact = mongoose.model("Contact", ContactSchema);

