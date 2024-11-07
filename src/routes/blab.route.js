import express from "express";
import { upload } from "../middlewares/multer.middleware.js";
import {
  labUser,
  phaymacyUser,
  hospitalUser,
} from "../controllers/blab.controller.js";
const router = express.Router();

router.route("/register-lab").post(
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverimage", maxCount: 1 },
  ]),
  labUser
);
router.route("/register-pharmacy").post(
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverimage", maxCount: 1 },
  ]),
  phaymacyUser
);
router.route("/register-hospital").post(
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverimage", maxCount: 1 },
  ]),
  hospitalUser
);
export default router;
