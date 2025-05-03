import express from "express";
import {
  signup,
  login,
  logout,
  getMe,
  getToken,
  googleAuth,
} from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/protectRoute.js";
import passport from "passport";
import { generateTokenAndSetCookie } from "../lib/utils/generateToken.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", protectRoute, getMe);
router.get("/token", protectRoute, getToken);

router.post("/google", googleAuth); // handles token from frontend

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/login",
  }),
  (req, res) => {
    generateTokenAndSetCookie(req.user._id, res);
    res.redirect(process.env.FRONTEND_URL);
  }
);

export default router;
