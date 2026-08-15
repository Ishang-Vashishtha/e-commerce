const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const connectDB = require("./config/db");

connectDB();

const app = express();

// CORS
const allowedOrigins = [
  "http://localhost:3000",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use("/api/auth", require("./routes/authRoutes.js"));
app.use("/api/products", require("./routes/productRoutes.js"));
app.use("/api/orders", require("./routes/orderRoutes.js"));
app.use("/api/payment", require("./routes/paymentRoutes.js"));
app.use("/api/analytics", require("./routes/analyticsRoutes.js"));

// Production: serve React frontend
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/build")));

  // React SPA fallback
  app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/build/index.html"));
  });
} else {
  // Development
  app.get("/", (req, res) => {
    res.send("E-Shop backend is running in development mode");
  });
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});
