const Product = require("../models/product");
const cloudinary = require("../config/cloudinary");

const getProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    return res.json(products);
  } catch (err) {
    res.status(500).json({ message: "server error" });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (err) {
    res.status(500).json({ message: "server error" });
  }
};

const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, stock } = req.body;
    let images = [];
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path);
      //   console.log(result);

      images.push(result.secure_url);
    }
    const product = new Product({
      name,
      description,
      price,
      category,
      stock,
      images,
    });
    const savedProduct = await product.save();
    return res.status(201).json(savedProduct);
  } catch (err) {
    res.status(500).json({ message: "server error" });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { name, description, price, category, stock } = req.body;
    const product = await Product.findById(req.params.id);
    if (product) {
      product.price = price ?? product.price;
      product.stock = stock ?? product.stock;
      product.name = name ?? product.name;
      product.description = description ?? product.description;
      product.category = category ?? product.category;
      if (req.file) {
        const result = await cloudinary.uploader.upload(req.file.path);
        //  console.log(result);
        product.images = [result.secure_url];
      }
      const updatedProduct = await product.save();
      return res.json(updatedProduct);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (err) {
    res.status(500).json({ message: "server error" });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.json({ message: "Product removed successfully" });
  } catch (err) {
    res.status(500).json({ message: "server error" });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
