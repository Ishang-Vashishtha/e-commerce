const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const { admin } = require("../middlewares/adminMiddleware");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController.js");

const router = express.Router();

router
  .route("/")
  .get(getProducts)
  .post(protect, admin, upload.single("image"), createProduct);
router
  .route("/:id")
  .get(getProductById)
  .put(protect, admin, upload.single("image"), updateProduct)
  .delete(protect, admin, deleteProduct);

module.exports = router;
