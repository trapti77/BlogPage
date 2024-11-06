//this middleware is used to verify  user (means user hai ya nhi hai)

import { APIError } from "../utiles/apierror.js";
import { asyncHandler } from "../utiles/asynchandler.js";
import jwt, { decode } from "jsonwebtoken";
import { Register } from "../models/lab.model.js";

export const isLoggedIn = asyncHandler(async (req, _res, next) => {
  // extracting token from the cookies
  const { token } = req.cookies;
  console.log(token);

  // If no token send unauthorized message
  if (!token) {
    return next(new APIError("Unauthorized, please login to continue", 401));
  }

  // Decoding the token using jwt package verify method
  const decoded = await jwt.verify(token, "SECRET");

  // If no decode send the message unauthorized
  if (!decoded) {
    return next(
      new APIError("Unauthorized, please login to continue false token", 401)
    );
  }

  // If all good store the id in req object, here we are modifying the request object and adding a custom field user in it
  req.user = decoded;

  // Do not forget to call the next other wise the flow of execution will not be passed further
  next();
});
