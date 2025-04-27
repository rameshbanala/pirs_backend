import { protectRoute } from "../middleware/protectRoute.js";
import express from "express";
import {
  getPostLocations,
  getAllPosts,
  getFollowingPosts,
  getLikedPosts,
  getUserPosts,
  createPost,
  likeUnlikePost,
  commentOnPost,
  deletePost,
  updatePost,
  getDepartmentPosts,
} from "../controllers/post.contoller.js";
const router = express.Router();

router.get("/all", protectRoute, getAllPosts);
router.get("/locations", protectRoute, getPostLocations);
router.get("/following", protectRoute, getFollowingPosts);
router.get("/likes/:id", protectRoute, getLikedPosts);
router.get("/user/:username", protectRoute, getUserPosts);
router.get("/department/:department", getDepartmentPosts);
router.post("/create", protectRoute, createPost);
router.post("/like/:id", protectRoute, likeUnlikePost);
router.post("/comment/:id", protectRoute, commentOnPost);
router.delete("/:id", protectRoute, deletePost);

router.post("/update/:id", protectRoute, updatePost);

export default router;
