import React from "react";
import { Link } from "react-router-dom";
import "../styles/product.css";

const ProductCard = ({ product }) => {
  return (
    <div className="product-card">
      <Link to={`/products/${product._id}`} className="view-details-button">
      <img
        className="product-image"
        src={product.images[0]}
        alt={product.name}
      />
      <div className="product-info">
        <h3>{product.name}</h3>
        <p className="price">${product.price.toFixed(2)}</p>
        
          View Details
        
      </div>
      </Link>
    </div>
  );
};

export default ProductCard;
