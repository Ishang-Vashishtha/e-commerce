const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();
const connectDB = require("./config/db");

connectDB();


const app = express();
app.use(cors([{ origin: ["http://localhost:3000", process.env.FRONTEND_URL], credentials: true }]));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("backend is working properly");
});
app.use("/api/auth", require("./routes/authRoutes.js"));
app.use("/api/products", require("./routes/productRoutes.js"));
app.use("/api/orders", require("./routes/orderRoutes.js"));
app.use("/api/payment", require("./routes/paymentRoutes.js"));
app.use("/api/analytics", require("./routes/analyticsRoutes.js"));

if(process.env.NODE_ENV === "production") {
  app.use(express.static(path.resolve(__dirname, "../frontend/build")));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../frontend/build/index.html"));
  });
}else{
  app.get("/", (req, res) => {
    res.send("E-Shop is running in development mode");
  });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`server is running on port: ${PORT}`);
});
