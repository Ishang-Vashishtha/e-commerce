const Order = require("../models/order.js");
const User = require("../models/user.js");
const Product = require("../models/product.js");

const getAdminStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments({});
    const totalUsers = await User.countDocuments({});
    const totalProducts = await Product.countDocuments({});
    const orders = await Order.find({});
    const totalRevenue = orders.reduce(
      (acc, order) => acc + order.totalAmount,
      0,
    );
    res.status(200).json({
      totalOrders,
      totalUsers,
      totalProducts,
      totalRevenue,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};




module.exports = { getAdminStats };
