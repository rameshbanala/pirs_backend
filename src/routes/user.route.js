import express from "express";
import {protectRoute} from "../middleware/protectRoute.js"
import {getUserProfile,updateUser, } from "../controllers/user.controller.js"
const router=express.Router();


router.get("/profile/:id",protectRoute,getUserProfile);
// router.get("/suggested",protectRoute,getSuggestedUsers);
// router.post("/follow/:id",protectRoute,followUnfollowUser);
router.post("/update",protectRoute,updateUser);



export default router;