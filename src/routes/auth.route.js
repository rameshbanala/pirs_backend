import express from "express";
import {signup,login,logout,getMe, getToken } from "../controllers/auth.controller.js"
import {protectRoute} from "../middleware/protectRoute.js"

const router = express.Router();

router.post("/signup",signup)
router.post("/login",login)
router.post("/logout",logout)
router.get("/me",protectRoute,getMe)
router.get('/token',protectRoute,getToken)
export default router;