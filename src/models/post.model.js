const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to the user who posted
    required: true,
  },
  imageUrl: {
    type: String,
    required: true, // URL of the uploaded image
  },
  labels: {
    mainCategory: {
      type: String, // e.g., "Electricity"
      required: true,
    },
    subCategory: {
      type: String, // e.g., "Power Outages"
      required: true,
    },
  },
  location: {
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
    address: {
      type: String, // Optional, human-readable address
    },
  },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Users who liked the post
    },
  ],
  comments: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      text: {
        type: String,
        required: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  votes: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Users who upvoted
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Post", PostSchema);
