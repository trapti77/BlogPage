import express from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { isLoggedIn } from "../middlewares/auth.middleware.js";
import {
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
} from "../controllers/lab.controller.js";
const router = express.Router();

router.route("/register").post(
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverimage", maxCount: 1 },
  ]),
  registerUser
); //ho gya hai
router.route("/login").post(loginUser); //ho gya hai
router.route("/logout").post(isLoggedIn, logoutUser); //ho gya hai
router.route("/forgotpassword").post(forgotPassword); //ho gya
router.post("/reset/token-check/:resetToken", tokenCheck); //ho gya
router.route("/reset/:resetToken").post(resetPassword); //ho gya
router.route("/changepassword").post(isLoggedIn, changePassword); //ho gya
router
  .route("/updateaccount")
  .put(isLoggedIn, upload.single("avatar"), updateAccount); //ho gya
router.route("/deleteaccount").delete(isLoggedIn, deletAccount); //ho ya
router
  .route("/:userId")
  .patch(isLoggedIn, upload.single("avatar"), updateAvatar);

export default router;
