import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
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
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  role: {
    type: String,
    enum: ["citizen", "employee"],
    required: true,
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
    required: function () {
      return this.role === "employee"; // Department is required only for employees
    },
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
});

const User = mongoose.model("User", userSchema);

export default User;
