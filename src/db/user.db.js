import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";  

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`mongodb://localhost:27017/myblog`);
        console.log(`\nMongoDB connected!! DB host: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("MongoDB connection FAILED", error);
        process.exit(1);
    }
};

export default connectDB;
