import { Router } from "express";
import {
  deleteBlog,
  updateBlog,
  contactUs,
  uploadImg,
  createBlog,
  updateUserAvatar,
  updateUserCoverImage,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();
router.route("/addblog").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 5,
    },
    {
      name: "coverimage",
      maxCount: 5,
    },
  ]),
  createBlog
);

router.post("/uploadimage", upload.array("avatar", 20), uploadImg);
router.route("/contactus").post(contactUs);
router.route("/:blogId").put(updateBlog);
router.route("/:blogId").delete(deleteBlog);
router
  .route("/update-coverimage")
  .patch(upload.single("coverImage"), updateUserCoverImage);
router.route("/:blogId").patch(upload.single("avatar"), updateUserAvatar);

export default router;
