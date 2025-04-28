import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.route.js";
import postRoutes from "./routes/post.route.js";
import userRoutes from "./routes/user.route.js";
import connectMongoDB from "./db/connectMongoDB.js";
import { v2 as cloudinary } from "cloudinary";
import path from "path";
import cors from "cors";
import multer from "multer";
import { PythonShell } from "python-shell";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json({limit:"10mb"}));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/users", userRoutes);

// Multer for in-memory file upload
const upload = multer({ storage: multer.memoryStorage() });

// Cloudinary stream upload wrapped in a Promise
const streamUpload = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: "image" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.end(fileBuffer);
  });
};

app.post("/predict", upload.single("image"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  try {
    const uploadResult = await streamUpload(req.file.buffer);

    const options = {
      mode: "text",
      pythonOptions: ["-u"],
      scriptPath: process.cwd(),
      args: [uploadResult.secure_url],
    };

    let outputData = "";
    const pyshell = new PythonShell(path.join("src", "predict.py"), options);

    pyshell.on("message", (message) => {
      outputData += message;
    });

    pyshell.end((err) => {
      if (err) {
        console.error("Python error:", err); // 🔍 Full traceback
        return res.status(500).json({ error: "Python script failed" });
      }

      try {
        console.log("Python output:", outputData); // 🔍 Print raw output
        const prediction = JSON.parse(outputData);
        res.json(prediction);
      } catch (parseError) {
        console.error("JSON Parse Error:", parseError);
        res.status(500).json({ error: "Failed to parse prediction output" });
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message || "Internal server error" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  connectMongoDB();
});
