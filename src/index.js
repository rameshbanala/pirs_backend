import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import session from "express-session";
import passport from "passport";
import path from "path";
import cors from "cors";
import multer from "multer";
import { PythonShell } from "python-shell";
import { v2 as cloudinary } from "cloudinary";

import connectMongoDB from "./db/connectMongoDB.js";
import authRoutes from "./routes/auth.route.js";
import postRoutes from "./routes/post.route.js";
import userRoutes from "./routes/user.route.js";

import "./config/passport.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Secure trust proxy
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/users", userRoutes);

// Multer for image upload
const upload = multer({ storage: multer.memoryStorage() });
const streamUpload = (fileBuffer) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: "image" },
      (error, result) => (error ? reject(error) : resolve(result))
    );
    stream.end(fileBuffer);
  });

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

    pyshell.on("message", (message) => (outputData += message));
    pyshell.end((err) => {
      if (err) return res.status(500).json({ error: "Python script failed" });

      try {
        const prediction = JSON.parse(outputData);
        res.json(prediction);
      } catch (e) {
        res.status(500).json({ error: "Invalid JSON from Python" });
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message || "Internal error" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  connectMongoDB();
});
