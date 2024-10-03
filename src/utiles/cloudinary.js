import fs from "fs";
import { v2 as cloudinary } from "cloudinary";

// Cloudinary configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
});

// Function to upload file to Cloudinary and remove the local file
const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) {
            throw new Error("No file path provided");
        }

        // Upload file to Cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto", // Auto detects the file type (image, video, etc.)
        });

        // Remove the local file after successful upload
        fs.unlinkSync(localFilePath); // Removing the local file synchronously
        console.log("File successfully uploaded to Cloudinary:", response.url);

        return response; // Return the Cloudinary response object
    } catch (error) {
        console.error("Error during file upload:", error);
        
        // Attempt to remove the local file if the upload fails
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath); // Ensure file removal
        }

        return null; // Returning null or an appropriate error response
    }
};

export { uploadOnCloudinary };
