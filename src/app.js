import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import morgan from "morgan";

dotenv.config({ path: "./.env" });

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static("public"));
app.use(morgan("dev"));
app.use(cookieParser());

import userRouter from "./routes/user.route.js";
import regiterRouter from "./routes/lab.route.js";
import blabRouter from "./routes/blab.route.js";

app.use("/api/lab", regiterRouter);
app.use("/api/blogs", userRouter);
app.use("/api/labs", blabRouter);
export { app };
