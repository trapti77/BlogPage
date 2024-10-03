/*import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null,"./public/temp");
    },
    filename: function (req, file, cb) {
        cb(null,file.originalname)
    }
})

export const upload = multer({
    storage:storage,
})*/
import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";  // To generate unique filenames

// Configure multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./public/temp");  // Set the destination folder
    },
    filename: function (req, file, cb) {
        // Generate a unique filename using uuid and preserve the file extension
        const uniqueSuffix = uuidv4() + path.extname(file.originalname);
        cb(null, uniqueSuffix);
    }
});

// File validation middleware (optional)
const fileFilter = (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|gif/;  // Acceptable file types (images)
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = fileTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error("Invalid file type! Only images are allowed."));
    }
};

// Export the upload middleware with options
export const upload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 5 },  // Limit file size to 5MB
    fileFilter: fileFilter  // Validate file type
});
