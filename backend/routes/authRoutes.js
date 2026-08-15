const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  logoutUser,
  getUsers,
  verifyOtp,
  resendOtp,
} = require("../controllers/authController.js");
const { protect } = require("../middlewares/authMiddleware");
const { admin } = require("../middlewares/adminMiddleware");

router.post("/register", registerUser);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);
router.post("/login", loginUser);
router.post("/logout", protect, logoutUser);
router.get("/getUsers", protect, admin, getUsers);

module.exports = router;