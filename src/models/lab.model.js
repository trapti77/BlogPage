import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { kStringMaxLength } from "buffer";
const registerSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        "Please fill in a valid email address",
      ],
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
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },
    avatar: {
      type: String,
      required: true,
    },
    coverimage: {
      type: String,
      default: "",
    },
    refreshToken: {
      type: String,
    },
    forgotPasswordToken: String,
    forgotPasswordExpiry: Date,
  },
  { timestamps: true }
);

/*registerSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
}); //here when data is saved before that we have to encrypt password
registerSchema.methods.isPasswordCorrect = async function (password) {
  //custom method created name ispasscorrect
  return await bcrypt.compare(password, this.password);
};*/
registerSchema.pre("save", async function (next) {
  // If password is not modified then do not hash it
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);
});

registerSchema.methods = {
  // method which will help us compare plain password with hashed password and returns true or false
  isPasswordCorrect: async function (plainPassword) {
    return await bcrypt.compare(plainPassword, this.password);
  },
};

registerSchema.methods.generatePasswordResetToken = async function () {
  // creating a random token using node's built-in crypto module
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Hash the OTP using SHA-256 algorithm and store it in the database
  this.forgotPasswordToken = crypto
    .createHash("sha256")
    .update(otp)
    .digest("hex");

  // Set the OTP expiry time to 15 minutes
  this.forgotPasswordExpiry = Date.now() + 15 * 60 * 1000;

  // Return the plain OTP (not hashed)
  return otp;
};
//------------------------------------------------------
//generate access token
registerSchema.methods.generateAccessToken = function () {
  //in jwt has sign method that generate tokens
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      name: this.name,
      phone: this.phone,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

registerSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};
registerSchema.methods.generateJWTToken = async function () {
  return await jwt.sign(
    { id: this._id, role: this.role, subscription: this.subscription },
    "SECRET",
    {
      expiresIn: "10d",
    }
  );
};
export const Register = mongoose.model("Register", registerSchema);
