import dotenv from "dotenv";
import connectDB from "./db/user.db.js";
import { app } from './app.js';

// Load environment variables from .env file
dotenv.config({ path: './.env' });

// Connect to the database
connectDB()
    .then(() => {
        const PORT = process.env.PORT || 1100;
        app.listen(PORT, () => {
            console.log(`Server is running at port: ${PORT}`);
        });
    })
    .catch((err) => {
        console.log("MongoDB connection failed!!!", err);
        process.exit(1);  // Exit process if DB connection fails
    });
