import { Lab } from "../models/blab.model.js";
import { Pharmacy } from "../models/pharmacy.model.js";
import { Hospital } from "../models/hospital.model.js";
import { asyncHandler } from "../utiles/asynchandler.js";
import { APIError } from "../utiles/apierror.js";
import { uploadOnCloudinary } from "../utiles/cloudinary.js";
import { APIResponse } from "../utiles/apiresponse.js";
import { Upload } from "../models/uploadimg.model.js";
import jwt from "jsonwebtoken";
import cloudinary from "cloudinary";

const labUser = asyncHandler(async (req, res) => {
  try {
    const { labname, address, phone, type, openingtime, closingtime } =
      req.body;
    if (
      [labname, address, phone, type, openingtime, closingtime].some(
        (field) => field?.trim() === ""
      )
    ) {
      throw new APIError(400, "all fields are required");
    }

    const avatarlocalpath = req.files?.avatar?.[0]?.path;
    if (!avatarlocalpath) {
      throw new APIError(400, "image is required");
    }
    const avatar = await uploadOnCloudinary(avatarlocalpath);
    if (!avatar) {
      throw new APIError(400, "avatar is required");
    }

    const user = await Lab.create({
      labname,
      address,
      phone,
      type,
      openingtime,
      closingtime,
      avatar: avatar.url,
    });
    if (!user) {
      throw new APIError(
        500,
        "something went wrong while registering the user"
      );
    }

    return res
      .status(201)
      .json(new APIResponse(200, user, "lab registered successfully"));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
const phaymacyUser = asyncHandler(async (req, res) => {
  try {
    const { name, address, phone, type, openingtime, closingtime } = req.body;
    if (
      [name, address, phone, type, openingtime, closingtime].some(
        (field) => field?.trim() === ""
      )
    ) {
      throw new APIError(400, "all fields are required");
    }

    const avatarlocalpath = req.files?.avatar?.[0]?.path;
    if (!avatarlocalpath) {
      throw new APIError(400, "image is required");
    }
    const avatar = await uploadOnCloudinary(avatarlocalpath);
    if (!avatar) {
      throw new APIError(400, "avatar is required");
    }

    const user = await Pharmacy.create({
      name,
      address,
      phone,
      type,
      openingtime,
      closingtime,
      avatar: avatar.url,
    });
    if (!user) {
      throw new APIError(
        500,
        "something went wrong while registering the user"
      );
    }

    return res
      .status(201)
      .json(new APIResponse(200, user, "pharmacy registered successfully"));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
const hospitalUser = asyncHandler(async (req, res) => {
  try {
    const { hospitalname, address, phone, type, openingtime, closingtime } =
      req.body;
    if (
      [hospitalname, address, phone, type, openingtime, closingtime].some(
        (field) => field?.trim() === ""
      )
    ) {
      throw new APIError(400, "all fields are required");
    }

    const avatarlocalpath = req.files?.avatar?.[0]?.path;
    if (!avatarlocalpath) {
      throw new APIError(400, "image is required");
    }
    const avatar = await uploadOnCloudinary(avatarlocalpath);
    if (!avatar) {
      throw new APIError(400, "avatar is required");
    }

    const user = await Hospital.create({
      hospitalname,
      address,
      phone,
      type,
      openingtime,
      closingtime,
      avatar: avatar.url,
    });
    if (!user) {
      throw new APIError(
        500,
        "something went wrong while registering the user"
      );
    }

    return res
      .status(201)
      .json(new APIResponse(200, user, "hospital registered successfully"));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
export { labUser, phaymacyUser, hospitalUser };
