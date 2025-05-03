import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    sparse: true,
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true,
  },
  profileImg: {
    type: String,
    default: "",
  },
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: function () {
      return this.method === "local";
    },
    unique: true,
  },
  password: {
    type: String,
    required: function () {
      return this.method === "local";
    },
    minlength: 6,
  },
  department: {
    type: String,
    enum: [
      "Electricity",
      "Sanitation",
      "Roads",
      "Traffic",
      "Water",
      "Health",
      "Fire",
      "Infrastructure",
    ],
  },
  likedPosts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      default: [],
    },
  ],
  votes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      default: [],
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  method: {
    type: String,
    enum: ["local", "google"],
    required: true,
    default: "local",
  },
});

const User = mongoose.model("User", userSchema);

export default User;
