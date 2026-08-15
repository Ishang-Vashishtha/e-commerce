const jwt = require("jsonwebtoken");
const User = require("../models/user");

const protect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");
      return next();
    } catch (err) {
      return res.status(401).json({ message: "not authorized, token failed" });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "not authorized, no token" });
  }
};

const verifyUser = (req, res, next) => {
  if (req.user && req.user.verified) {
    return next();
  }
  return res.status(401).json({ message: "Account not verified" });
};

module.exports = { protect, verifyUser };
