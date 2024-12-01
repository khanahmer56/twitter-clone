import express from "express";
import authRoutes from "./routes/auth.route.js";
import dotenv from "dotenv";
import connectMongoDb from "./db/connectMongoDb.js";

dotenv.config();
const app = express();

app.use(express.json());

app.use("/api/auth", authRoutes);

app.listen(3000, () => {
  console.log("Example app listening on port 3000!");
  connectMongoDb();
});
