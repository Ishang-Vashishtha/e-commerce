const Order = require("../models/order");
const sendEmail = require("../utils/sendEmail");

const createOrder = async (req, res) => {
  try {
    const { items, totalAmount, address, paymentId } = req.body;
    if (!items || items.length === 0) {
      return res.status(400).json({ message: "No order items" });
    }

    const order = new Order({
      user: req.user._id,
      items,
      totalAmount,
      address,
      paymentId,
    });
    const createdOrder = await order.save();

    const message = `
      <h2>Order Confirmation</h2>
      <p>Hello ${req.user.name || "Customer"},</p>
      <p>Your order has been successfully placed!</p>
      <p>Order ID: <strong>${createdOrder._id}</strong></p>
      <p>Total Amount Paid: $${createdOrder.totalAmount.toFixed(2)}</p>
      <p>Shipping Address:</p>
      <p>
        ${address.fullName}<br />
        ${address.street}<br />
        ${address.city}, ${address.postalCode}<br />
        ${address.country}
      </p>
      <p>Thank you for shopping with us!</p>
    `;

    await sendEmail({
      to: req.user.email,
      subject: "E-Shop - Order Confirmation",
      html: message,
    });

    res.status(201).json({ message: "order created ", createdOrder });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email",
    );
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (
      req.user.role !== "admin" &&
      order.user._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = req.body.status || order.status;
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    return res.json(orders);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  getMyOrders,
};
