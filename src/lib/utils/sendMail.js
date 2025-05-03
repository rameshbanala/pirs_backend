import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.APP_MAIL,
    pass: process.env.APP_PASSWORD,
  },
});

export const sendOTPEmail = async (email, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your Verification Code",
    html: `
      <h2>Verify your email</h2>
      <p>Your OTP code is: <strong>${otp}</strong></p>
      <p>Expires in 10 minutes.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};
