import User from "../models/user.model.js";
// controllers/otp.controller.js
import crypto from "crypto";
import { sendOTPEmail } from "../lib/utils/sendMail.js";

export const resendOTP = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ error: "User not found" });
  if (user.isVerified)
    return res.status(400).json({ error: "User already verified" });

  // Prevent frequent resend (e.g., 60 seconds)
  const now = Date.now();
  if (
    user.otp &&
    user.otp.lastSentAt &&
    now - user.otp.lastSentAt < 60 * 1000
  ) {
    return res.status(400).json({ error: "Please wait before resending OTP" });
  }

  // Generate new OTP
  const otp = crypto.randomInt(100000, 999999).toString();
  user.otp = {
    code: otp,
    expiresAt: now + 10 * 60 * 1000,
    lastSentAt: now,
  };
  await user.save();

  await sendOTPEmail(email, otp);

  res.status(200).json({ message: "OTP resent to your email" });
};

export const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ error: "User not found" });
  if (user.otp.code !== otp || user.otp.expiresAt < Date.now()) {
    return res.status(400).json({ error: "Invalid or expired OTP" });
  }

  // OTP valid, set user as verified
  user.isVerified = true;
  user.otp = undefined; // Clear OTP
  await user.save();

  res.status(200).json({ message: "Email verified successfully!" });
};
