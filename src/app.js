import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

// Load environment variables from .env file
dotenv.config({ path: './.env' });

const app = express();

// CORS setup to allow requests from specific origins
app.use(cors({
    origin: process.env.CORS_ORIGIN, // Example: 'http://localhost:3000'
    credentials: true
}));

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the 'public' directory
app.use(express.static("public"));

// Cookie parser middleware to handle cookies
app.use(cookieParser());

// Import user routes
import userRouter from './routes/user.route.js';

// Routes declaration
app.use("/api/v1/users", userRouter); // Example route: http://localhost:8000/api/v1/users/registration or login

// Export app for server initialization
export { app };
