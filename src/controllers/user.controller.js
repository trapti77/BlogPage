import { asyncHandler } from "../utiles/asynchandler.js";
import { APIError } from "../utiles/apierror.js"
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utiles/cloudinary.js"
import { APIResponse } from "../utiles/apiresponse.js"

const registerUser = asyncHandler(async (req, res) => {
    const { name,category,title,description} = req.body;
    if ([ name,category,title,description].some((field) =>
        field?.trim() === "")
    ) {
        throw new APIError(400,"all fields are required")
    }
  const existuser= await User.findOne({
        $or:[{name},{category}]
  })
    
    if (existuser) {
        throw new APIError(409,"user with email or username already exist")
    }

   
    const avatarlocalpath = req.files?.avatar?.[0]?.path;
    let coverimagelocalpath;
    if (req.files && Array.isArray(req.files.coverimage) && req.files.coverimage.length > 0) {
        coverimagelocalpath=req.files.coverimage?.[0]?.path
    }
    if (!avatarlocalpath) {
        throw new APIError(400,"avatar files is required")
    }

    //upload oncloudinary
    const avatar = await uploadOnCloudinary(avatarlocalpath);
   // console.log(avatar)
    const coverimage = await uploadOnCloudinary(coverimagelocalpath);
   // console.log(coverimage)
    
    if (!avatar) {
        throw new APIError(400,"avatar is required")
    }

    //create object and entry in db

    const user = await User.create({
       
        avatar: avatar.url,
        coverimage: coverimage?.url || "", 
        category,
        title,
         description,
        name:name.toLowerCase()
   })
    
    //check user hai ya nhi by id jo bydefault hota hai
    const createduser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    
    if (!createduser) {
        throw new APIError(500, "something went wrong while registering the user");
    }

    //return response
    return res.status(201).json(
        new APIResponse(200,createduser,"user registered successfully")
    )
})

const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarPath = req.files?.path;
    if (!avatarPath) {
        throw new APIError(400,"Avatar file is missing")
    }

    const avatar = await uploadOnCloudinary(avatarPath);
    
    if (!avatar.url) {
        throw new APIError(400,"Error while uploading on cloudinary")
    }

  const user=  await User.findById(req.user?._id,
        {
        $set:{
        avatar:avatar.url
    }
    },
        { new: true }
    ).select("-password")

     return res.
        status(200)
    .json(200,"avatar updated successfully")
})

const updateUserCoverImage = asyncHandler(async (req, res) => {
    const converimagepath = req.files?.body;
    if (!converimagepath) {
        throw new APIError(400, "cover image missing ");
    }

    const  coverimage = await uploadOnCloudinary(converimagepath);
    if (! coverimage.url) {
        throw new APIError(400,"error while uploading file on cloudinary")
    }

   const user= await User.findById(req.user?._id,
        {
            $set: {
                 coverimage: coverimage.url
            }
        },
        {
            new:true
        }
    )

    return res.
        status(200)
    .json(200,user,"coverimage updated successfully")
})


export {
    registerUser,
    updateUserAvatar,
    updateUserCoverImage
}