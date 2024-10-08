import { asyncHandler } from "../utiles/asynchandler.js";
import { APIError } from "../utiles/apierror.js";
import { Blog } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utiles/cloudinary.js";
import { APIResponse } from "../utiles/apiresponse.js";
import { Contact } from "../models/contact.model.js";
import { Upload } from "../models/uploadimg.model.js";

//Delete Blog
const deleteBlog = asyncHandler(async (req, res) => {
  try {
    const { blogId } = req.params;
    console.log(blogId);
    const user = await Blog.findOneAndDelete({
      _id: blogId,
    });

    // If no blog found
    if (!user) {
      throw new APIError(
        404,
        "Blog not found or you are not authorized to delete it"
      );
    }

    return res
      .status(200)
      .json(new APIResponse(200, null, "Blog deleted successfully"));
  } catch (error) {
    console.error("Error deleting blog:", error);
    throw new APIError(500, `Failed to delete the blog: ${error.message}`);
  }
});
// Update blog post
const updateBlog = asyncHandler(async (req, res) => {
  const { name, title, description, category } = req.body;

  if (!name || !title || !description || !category) {
    throw new APIError(400, "All fields are required");
  }

  const { blogId } = req.params;
  console.log("Blog ID:", blogId); // Logging the blogId for debugging purposes

  // Check if the blog exists
  const blogExists = await Blog.findById(blogId);
  if (!blogExists) {
    throw new APIError(404, "Blog not found");
  }

  // Update the blog
  const updatedBlog = await Blog.findByIdAndUpdate(
    blogId,
    {
      $set: {
        name,
        title,
        category,
        description,
      },
    },
    { new: true } // This returns the updated document
  );

  if (!updatedBlog) {
    throw new APIError(404, "Failed to update: Blog not found");
  }

  // Send response with the updated blog
  return res
    .status(200)
    .json(new APIResponse(200, updatedBlog, "Blog updated successfully"));
});

//upload images
const uploadImg = asyncHandler(async (req, res) => {
  try {
    let files = [];

    // Handle both single file and multiple files
    if (req.file) {
      // Single file upload
      files = [req.file];
    } else if (req.files && req.files.length > 0) {
      // Multiple files upload
      files = req.files;
    } else {
      throw new ApiError(400, "No files were uploaded");
    }

    const uploadPromises = files.map(async (file) => {
      try {
        const result = await uploadOnCloudinary(file.path);
        console.log(result);
        if (!result) {
          throw new ApiError(
            400,
            `Failed uploading file ${file.originalname} to Cloudinary`
          );
        }
        return result.url;
      } catch (error) {
        console.error(`Error uploading ${file.originalname}:`, error);
        throw new ApiError(
          400,
          `Failed uploading file ${file.originalname} to Cloudinary: ${error.message}`
        );
      }
    });

    const uploadedUrls = await Promise.all(uploadPromises);

    const upload = await Upload.create({
      avatar: uploadedUrls,
    });

    res.status(200).json({
      message: "Images successfully uploaded",
      data: upload,
    });
  } catch (error) {
    console.error("Error in uploadImg:", error);
    res.status(error.statusCode || 500).json({ error: error.message });
  }
});

//contact us
const contactUs = asyncHandler(async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const newContact = new Contact({
      name,
      email,
      message,
    });

    await newContact.save();
    res.status(201).json({ message: "Contact saved successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//create new blog
const createBlog = asyncHandler(async (req, res) => {
  const { name, category, title, description } = req.body;
  if (
    [name, category, title, description].some((field) => field?.trim() === "")
  ) {
    throw new APIError(400, "all fields are required");
  }

  const avatarlocalpath = req.files?.avatar?.[0]?.path;
  let coverimagelocalpath;
  if (
    req.files &&
    Array.isArray(req.files.coverimage) &&
    req.files.coverimage.length > 0
  ) {
    coverimagelocalpath = req.files.coverimage?.[0]?.path;
  }
  if (!avatarlocalpath) {
    throw new APIError(400, "avatar files is required");
  }

  const avatar = await uploadOnCloudinary(avatarlocalpath);
  // console.log(avatar)
  const coverimage = await uploadOnCloudinary(coverimagelocalpath);
  // console.log(coverimage)

  if (!avatar) {
    throw new APIError(400, "avatar is required");
  }

  const blog = await Blog.create({
    avatar: avatar.url,
    coverimage: coverimage?.url || "",
    category,
    title,
    description,
    name: name.toLowerCase(),
  });

  //return response
  return res
    .status(201)
    .json(new APIResponse(200, blog, "user registered successfully"));
});

//update image
const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarPath = req.file?.path;
  if (!avatarPath) {
    throw new APIError(400, "Avatar file is missing");
  }

  const avatar = await uploadOnCloudinary(avatarPath);

  if (!avatar.url) {
    throw new APIError(400, "Error while uploading on cloudinary");
  }
  const { blogId } = req.params;

  const blogs = await Blog.findByIdAndUpdate(
    {
      _id: blogId,
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
    .json(new APIResponse(200, blogs, "Avatar successfulaly updated"));
});

//update cover img
const updateUserCoverImage = asyncHandler(async (req, res) => {
  const converimagepath = req.file?.body;
  if (!converimagepath) {
    throw new APIError(400, "cover image missing ");
  }

  const coverimage = await uploadOnCloudinary(converimagepath);
  if (!coverimage.url) {
    throw new APIError(400, "error while uploading file on cloudinary");
  }
  const blogId = req.params;
  const blogs = await Blog.findById(
    {
      _id: blogId,
    },
    {
      $set: {
        coverimage: coverimage.url,
      },
    },
    {
      new: true,
    }
  );

  return res
    .status(200)
    .json(new APIResponse(200, blogs, "Coverimage updated successfully"));
});

export {
  deleteBlog,
  updateBlog,
  contactUs,
  uploadImg,
  createBlog,
  updateUserAvatar,
  updateUserCoverImage,
};
