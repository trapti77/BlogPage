import registerModel from "../models/lab.model.js";
import { asyncHandler } from "../utiles/asynchandler.js";
import { APIError } from "../utiles/apierror.js";
import { uploadOnCloudinary } from "../utiles/cloudinary.js";
import { APIResponse } from "../utiles/apiresponse.js";
import { Upload } from "../models/uploadimg.model.js";

const registerUser = asyncHandler((req, res) => {});
const loginUser = asyncHandler((req, res) => {});
const logoutUser = asyncHandler((req, res) => {});
const forgotPassword = asyncHandler((req, res) => {});
const resetPassword = asyncHandler((req, res) => {});
const changePassword = asyncHandler((req, res) => {});
const updateAccount = asyncHandler((req, res) => {});
const deletAccount = asyncHandler((req, res) => {});
const uploadImage = asyncHandler((req, res) => {});
const updateAvatar = asyncHandler((req, res) => {});
const updateCoverImage = asyncHandler((req, res) => {});

export {
  registerUser,
  loginUser,
  logoutUser,
  forgotPassword,
  resetPassword,
  changePassword,
  updateAccount,
  deletAccount,
  uploadImage,
  updateAvatar,
  updateCoverImage,
};
