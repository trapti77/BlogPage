import express from "express";
import {
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
} from "../controllers/lab.controller.js";
const router = express.Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").post(logoutUser);
router.route("/forgotpassword").post(forgotPassword);
router.route("/resetpassword").post(resetPassword);
router.route("/changepassword").post(changePassword);
router.route("/updateaccount").put(updateAccount);
router.route("/deleteaccount").delete(deletAccount);
router.route("/uploadimage").patch(uploadImage);
router.route("/updateavatar").patch(updateAvatar);
router.route("/updatecoverimage").patch(updateCoverImage);

export default router;
