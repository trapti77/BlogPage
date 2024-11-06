import { Register } from "../models/lab.model.js";
import { asyncHandler } from "../utiles/asynchandler.js";
import { APIError } from "../utiles/apierror.js";
import { uploadOnCloudinary } from "../utiles/cloudinary.js";
import { APIResponse } from "../utiles/apiresponse.js";
import { Upload } from "../models/uploadimg.model.js";
import mongoose, { syncIndexes } from "mongoose";
import jwt from "jsonwebtoken";
import cloudinary from "cloudinary";
import crypto from "crypto";
import fs from "fs/promises";
import sendEmail from "../utiles/sendEmail.js";
const cookieOptions = {
  secure: process.env.NODE_ENV === "production" ? true : false,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  httpOnly: true,
  SameSite: "none",
};
const generateAccessandRefreshToken = async (userId) => {
  try {
    // Find the user by the provided userId
    const user = await Register.findById(userId);
    if (!user) {
      throw new APIError("User not found", 404); // Pass a status code
    }

    // Generate tokens
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // Save the refresh token to the user document
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new Error(error.message); // Rethrow the error for the calling function to handle
  }
};

const registerUser = asyncHandler(async (req, res) => {
  try {
    const { name, email, phone, age, gender, password } = req.body;
    if (
      [name, email, phone, age, gender, password].some(
        (field) => field?.trim() === ""
      )
    ) {
      throw new APIError(400, "all fields are required");
    }
    const userexist = await Register.findOne({ email }).select("+password");
    if (userexist) {
      throw new APIError(409, "user with this email already exist");
    }

    const avatarlocalpath = req.files?.avatar?.[0]?.path;
    if (!avatarlocalpath) {
      throw new APIError(400, "image is required");
    }
    let coverimagelocalpath;
    if (
      req.files &&
      Array.isArray(req.files.coverimage) &&
      req.files.coverimage.length > 0
    ) {
      coverimagelocalpath = req.files.coverimage?.[0]?.path;
    }
    const avatar = await uploadOnCloudinary(avatarlocalpath);
    const coverimage = await uploadOnCloudinary(coverimagelocalpath);
    if (!avatar) {
      throw new APIError(400, "avatar is required");
    }

    const user = await Register.create({
      name,
      email,
      phone,
      age,
      gender,
      password,
      avatar: avatar.url,
      coverimage: coverimage?.url || "",
    });
    const createduser = await Register.findById(user._id).select(
      "-password -refreshToken"
    );
    if (!user) {
      throw new APIError(
        500,
        "something went wrong while registering the user"
      );
    }

    return res
      .status(201)
      .json(
        new APIResponse(200, createduser, "registration complete successfully")
      );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new APIError("Email and Password are required", 400));
  }

  // Finding the user with the sent email
  const user = await Register.findOne({ email }).select("+password");

  // If no user or sent password do not match then send generic response
  if (!(user && (await user.isPasswordCorrect(password)))) {
    return next(
      new APIError("Email or Password do not match or user does not exist", 401)
    );
  }

  await user.save();

  // Generating a JWT token
  const token = await user.generateJWTToken();

  // Setting the password to undefined so it does not get sent in the response
  user.password = undefined;

  // Setting the token in the cookie with name token along with cookieOptions
  res.cookie("token", token, cookieOptions);

  // If all good send the response to the frontend
  res.status(200).json(new APIResponse(200, user, "user login successfully"));
});

const logoutUser = asyncHandler(async (req, res) => {
  try {
    // Ensure req.user._id exists
    if (!req.user || !req.user._id) {
      throw new APIError("User is not authenticated", 401);
    }

    // Clear the user's refreshToken
    await Register.findByIdAndUpdate(
      req.user._id,
      { $set: { refreshToken: null } },
      { new: true }
    );

    // Clear cookies without options to simplify
    res.clearCookie("accessToken").clearCookie("refreshToken");

    // Send successful response
    return res
      .status(200)
      .json(new APIResponse(200, {}, "User logged out successfully"));
  } catch (error) {
    // Catch errors and pass them to the error handler
    res.status(500).json({ message: error.message });
  }
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  // If no email send email required message
  if (!email) {
    return next(new APIError("Email is required", 400));
  }

  // Finding the user via email
  const user = await Register.findOne({ email });

  // If no email found send the message email not found
  if (!user) {
    return next(new APIError("Email not registered", 400));
  }

  // Generating the OTP via the method we created earlier
  const otp = await user.generatePasswordResetToken();
  console.log(otp);

  // Saving the forgotPassword* fields to DB
  await user.save();

  // We need to send an email to the user with the OTP
  const subject = "Your Password Reset OTP";
  const message = `Your OTP for resetting your password is: ${otp}\n\nThis OTP is valid for 15 minutes.\nIf you did not request this, please ignore this email.`;

  try {
    await sendEmail(email, subject, message);

    // If email sent successfully send the success response
    res.status(200).json({
      success: true,
      message: `Password reset OTP has been sent to ${email} successfully`,
    });
  } catch (error) {
    // If some error happened we need to clear the forgotPassword* fields in our DB
    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiry = undefined;

    await user.save();

    return next(
      new APIError(
        error.message || "Something went wrong, please try again.",
        500
      )
    );
  }
});
const tokenCheck = asyncHandler(async (req, res, next) => {
  const { resetToken } = req.params;
  console.log("received:", resetToken);
  const forgotPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  console.log(forgotPasswordToken);

  // Checking if token matches in DB and if it is still valid(Not expired)
  const user = await Register.findOne({
    forgotPasswordToken,
    forgotPasswordExpiry: { $gt: Date.now() }, // $gt will help us check for greater than value, with this we can check if token is valid or expired
  });

  // If not found or expired send the response
  if (!user) {
    return res
      .status(400)
      .json({ message: "Token is invalid or expired, please try again" });
  }
  res.status(200).json({
    success: true,
    message: "Otp matched  successfully",
  });
});

const resetPassword = asyncHandler(async (req, res) => {
  // Extracting resetToken from req.params object
  const { resetToken } = req.params;
  // console.log(resetToken)

  // Extracting password from req.body object
  const { password } = req.body;
  console.log("passward  is ", password);

  // We are again hashing the resetToken using sha256 since we have stored our resetToken in DB using the same algorithm
  const forgotPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Check if password is not there then send response saying password is required
  if (!password) {
    return next(new APIError("Password is required", 400));
  }

  console.log(forgotPasswordToken);

  // Checking if token matches in DB and if it is still valid(Not expired)
  const user = await Register.findOne({
    forgotPasswordToken,
    forgotPasswordExpiry: { $gt: Date.now() }, // $gt will help us check for greater than value, with this we can check if token is valid or expired
  });

  // If not found or expired send the response
  if (!user) {
    return res
      .status(400)
      .json({ message: "Token is invalid or expired, please try again" });
  }

  // Update the password if token is valid and not expired
  user.password = password;

  // making forgotPassword* valus undefined in the DB
  user.forgotPasswordExpiry = undefined;
  user.forgotPasswordToken = undefined;

  // Saving the updated user values
  await user.save();

  // Sending the response when everything goes good
  res.status(200).json({
    success: true,
    message: "Password changed successfully",
  });
});
const changePassword = asyncHandler(async (req, res) => {
  // Destructuring the necessary data from the req object
  const { oldPassword, newPassword } = req.body;
  console.log(oldPassword, newPassword);
  const { id } = req.user; // because of the middleware isLoggedIn

  // Check if the values are there or not
  if (!oldPassword || !newPassword) {
    return next(
      new APIError("Old password and new password are required", 400)
    );
  }

  // Finding the user by ID and selecting the password
  const user = await Register.findById(id).select("+password");

  // If no user then throw an error message
  if (!user) {
    return next(new APIError("Invalid user id or user does not exist", 400));
  }

  // Check if the old password is correct
  const isPasswordValid = await user.isPasswordCorrect(oldPassword);

  // If the old password is not valid then throw an error message
  if (!isPasswordValid) {
    return next(new APIError("Invalid old password", 400));
  }

  // Setting the new password
  user.password = newPassword;

  // Save the data in DB
  await user.save();

  // Setting the password undefined so that it won't get sent in the response
  user.password = undefined;

  res.status(200).json({
    success: true,
    message: "Password changed successfully",
  });
});
const updateAccount = asyncHandler(async (req, res) => {
  // Destructuring the necessary data from the req object
  const { name, email, phone, age, gender } = req.body;
  const id = req.user.id;

  const user = await Register.findById(id);

  if (!user) {
    return next(new APIError("Invalid user id or user does not exist"));
  }

  user.name = name;
  user.email = email;
  user.phone = phone;
  user.age = age;
  user.gender = gender;
  // Run only if user sends a file
  if (req.file) {
    // Deletes the old image uploaded by the user
    await cloudinary.v2.uploader.destroy(user.avatar.public_id);

    try {
      const result = await cloudinary.v2.uploader.upload(req.file.path, {
        folder: "lms", // Save files in a folder named lms
        width: 250,
        height: 250,
        gravity: "faces", // This option tells cloudinary to center the image around detected faces (if any) after cropping or resizing the original image
        crop: "fill",
      });

      // If success
      if (result) {
        // Set the public_id and secure_url in DB
        user.avatar.public_id = result.public_id;
        user.avatar.secure_url = result.secure_url;

        // After successful upload remove the file from local storage
        fs.rm(`uploads/${req.file.filename}`);
      }
    } catch (error) {
      return next(
        new APIError(error || "File not uploaded, please try again", 400)
      );
    }
  }

  // Save the user object
  await user.save();

  res
    .status(201)
    .json(new APIResponse(200, user, "account update successfully "));
});
const deletAccount = asyncHandler(async (req, res) => {
  // Assuming the user is authenticated and their ID is available in req.user
  const userId = req.user.id;

  // Check if user ID is provided (or comes from authentication token)
  if (!userId) {
    return res
      .status(400)
      .json({ message: "User not authenticated or invalid" });
  }

  try {
    // Find the user by their ID in the database and delete
    const user = await Register.findByIdAndDelete(userId);

    // If the user does not exist
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Return success response
    res.status(200).json({
      success: true,
      message: "User account deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting account:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
const updateAvatar = asyncHandler(async (req, res) => {
  const avatarPath = req.file?.path;
  if (!avatarPath) {
    throw new APIError(400, "Avatar file is missing");
  }

  const avatar = await uploadOnCloudinary(avatarPath);

  if (!avatar.url) {
    throw new APIError(400, "Error while uploading on cloudinary");
  }
  const { userId } = req.params;

  const users = await Register.findByIdAndUpdate(
    {
      _id: userId,
    },
    {
      $set: {
        avatar: avatar.url,
      },
    },
    { new: true }
  );

  return res
    .status(200)
    .json(new APIResponse(200, users, "Avatar successfulaly updated"));
});

export {
  generateAccessandRefreshToken,
  registerUser,
  loginUser,
  logoutUser,
  forgotPassword,
  tokenCheck,
  resetPassword,
  changePassword,
  updateAccount,
  deletAccount,
  updateAvatar,
};
