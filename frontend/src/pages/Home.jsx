import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";

export const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Simulate an API call
        const response = await fetch("/api/products");
        const data = await response.json();
        setProducts(data.slice(0, 6)); // Get the first 6 products
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);
  return (
    <div className="home-container">
      <div className="hero-banner">
        <h1>Welcome to E-shop</h1>
        <p>Your one-stop shop for all your needs!</p>
        <Link to="/shop" className="shop-now-button">
          Shop Now
        </Link>
      </div>
      <h2>Featured Products</h2>
        {loading ? (
          <p>Loading products...</p>
        ) : (
          <div className="product-grid">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
    </div>
  );
};
