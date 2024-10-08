import dotenv from "dotenv";
import connectDB from "./db/user.db.js";
import { app } from "./app.js";
dotenv.config({ path: "./.env" });
connectDB()
  .then(() => {
    const PORT = process.env.PORT || 1101;
    app.listen(PORT, () => {
      console.log(`Server is running at port: ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("MongoDB connection failed!!!", err);
    process.exit(1);
  });
