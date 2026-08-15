const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

const createOtp = async () => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedOtp = await bcrypt.hash(otp, 10);
  return { otp, hashedOtp };
};

//register new user
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ name, email, password: hashPassword });

    if (newUser) {
      const { otp, hashedOtp } = await createOtp();
      newUser.otp = hashedOtp;
      newUser.otpExpire = Date.now() + 10 * 60 * 1000;
      await newUser.save();

      const message = `
        <h2>Welcome to E-commerce, ${name}!</h2>
        <p>Thank you for registering on our platform.</p>
        <p>Your one-time verification OTP is: <strong>${otp}</strong></p>
        <p>The OTP expires in 10 minutes.</p>
      `;
      await sendEmail({
        to: newUser.email,
        subject: "E-commerce OTP Verification",
        html: message,
      });

      return res.status(201).json({
        message:
          "User registered successfully. Please verify your email using the OTP sent to you.",
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        token: generateToken(newUser._id),
        verified: newUser.verified,
      });
    } else {
      return res.status(400).json({
        message: "User registration failed",
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Server error",
    });
  }
};

const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.verified) {
      return res.status(400).json({ message: "User is already verified" });
    }

    if (!user.otp || !user.otpExpire || user.otpExpire < Date.now()) {
      return res.status(400).json({ message: "OTP is missing or has expired" });
    }

    const isMatch = await bcrypt.compare(otp, user.otp);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    user.verified = true;
    user.otp = undefined;
    user.otpExpire = undefined;
    await user.save();

    return res.json({
      message: "OTP verified successfully",
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

const resendOtp = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.verified) {
      return res.status(400).json({ message: "User is already verified" });
    }

    const { otp, hashedOtp } = await createOtp();
    user.otp = hashedOtp;
    user.otpExpire = Date.now() + 10 * 60 * 1000;
    await user.save();

    const message = `
      <h2>E-commerce OTP Resend</h2>
      <p>Your new OTP is: <strong>${otp}</strong></p>
      <p>The OTP expires in 10 minutes.</p>
    `;
    await sendEmail({
      to: user.email,
      subject: "Your new E-commerce OTP",
      html: message,
    });

    return res.json({ message: "A new OTP has been sent to your email" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (!(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (!user.verified) {
      return res
        .status(401)
        .json({
          message:
            "Account not verified. Please verify your OTP before logging in.",
        });
    }

    return res.json({
      message: "User login successful",
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server error",
    });
  }
};

const logoutUser = async (req, res) => {
  return res.json({ message: "Logged out successfully" });
};

const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("-password");
    return res.json(users);
  } catch (err) {
    return res.status(500).json({ message: "server error" });
  }
};

module.exports = { registerUser, loginUser, logoutUser, getUsers, verifyOtp, resendOtp };
