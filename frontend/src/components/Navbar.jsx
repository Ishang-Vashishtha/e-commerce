import React from "react";
import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/navbar.css";
import { AuthContext } from "../context/AuthContext";
import { useSelector } from "react-redux";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const cartItems = useSelector((state) => state.cart.cartItems);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">
          <img src="/logo.svg" alt="Logo" className="navbar-logo" />
          E-Shop
        </Link>
      </div>
      <ul className="navbar-links">
        <li>
          <Link to="/shop">Shop</Link>
        </li>
        <li>
          <Link to="/cart">Cart ({cartItems.length})</Link>
        </li>
        {user ? (
          <>
            <li>
              <Link to="/profile">Hi, {user.name}</Link>
            </li>
            {user.role === "admin" && (
              <li>
                <Link to="/admin">Admin Panel</Link>
              </li>
            )}
            <li>
              <button onClick={handleLogout} className="btn btn-outline">
                Logout
              </button>
            </li>
          </>
        ) : (
          <li>
            <Link to="/login">Login</Link>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
