import mongoose from "mongoose";

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
    type: {
      type: String, // GeoJSON type
      enum: ["Point"], // Only 'Point' is allowed
      required: true,
    },
    coordinates: {
      type: [Number], // Array of numbers [longitude, latitude]
      required: true,
    },
    address: {
      type: String, // Optional, human-readable address
    },
  },
  description: {
    type: String, // Description of the post
    required: true, // Make it required if every post must have a description
  },
  assigned_department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to the user (department) assigned to handle the post
  },
  status: {
    type: String,
    enum: ["pending", "in-progress", "resolved"], // Allowed status values
    default: "pending", // Default status when a post is created
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

// Add a 2dsphere index for geospatial queries on the location field
PostSchema.index({ location: "2dsphere" });
const Post = mongoose.model("Post", PostSchema);
export default Post;
