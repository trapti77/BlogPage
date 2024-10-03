import { Router } from "express";
import {
    registerUser,
    updateUserAvatar,
    updateUserCoverImage,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
// import { verifyJWT } from "../middlewares/auth.middleware.js";  // Uncomment this when JWT is ready

const router = Router();

// Route to handle user registration with avatar and cover image upload
router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1,  // Maximum of 1 file for avatar
        },
        {
            name: "coverimage",
            maxCount: 1,  // Maximum of 1 file for cover image
        }
    ]),
    registerUser
);

// Route to handle avatar update
router.route("/change-avatar").patch(
    upload.single("avatar"), 
    updateUserAvatar
);

// Route to handle cover image update
router.route("/update-coverimage").patch(
    upload.single("coverImage"), 
    updateUserCoverImage
);

export default router;
