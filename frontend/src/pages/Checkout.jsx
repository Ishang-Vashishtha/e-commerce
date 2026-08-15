import React, { useContext, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { clearCart } from "../redux/cartSlice";

const Checkout = () => {
  const { user } = useContext(AuthContext);
  const cartItems = useSelector((state) => state.cart.cartItems);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [address, setAddress] = useState({
    fullName: "",
    street: "",
    city: "",
    postalCode: "",
    country: "",
  });

  const totalPrice = cartItems.reduce(
    (acc, item) => acc + Number(item.price) * Number(item.qty),
    0,
  );

  // -----------------------------------------
  // Save order using bypass/test mode
  // -----------------------------------------
  const bypassPayment = async () => {
    if (!user?.token) {
      alert("Please login first.");
      navigate("/login");
      return;
    }

    try {
      setLoading(true);

      const saveOrderRes = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          items: cartItems,
          totalAmount: totalPrice,
          address,
          paymentId: `bypass_txn_${Date.now()}`,
        }),
      });

      const data = await saveOrderRes.json();

      console.log("Bypass order response:", saveOrderRes.status, data);

      if (!saveOrderRes.ok) {
        alert(data.message || "Failed to create order.");
        return;
      }

      dispatch(clearCart());

      navigate("/ordersuccess", { replace: true });
    } catch (error) {
      console.error("Bypass payment error:", error);
      alert("Failed to create order.");
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------------------
  // Razorpay payment
  // -----------------------------------------
  const handlePayment = async () => {
    if (!user?.token) {
      alert("Please login first.");
      navigate("/login");
      return;
    }

    if (!cartItems || cartItems.length === 0) {
      alert("Your cart is empty.");
      navigate("/shop");
      return;
    }

    if (totalPrice <= 0) {
      alert("Invalid order amount.");
      return;
    }

    if (!window.Razorpay) {
      alert(
        "Razorpay could not be loaded. Please refresh the page and try again.",
      );
      return;
    }

    try {
      setLoading(true);

      // -----------------------------------------
      // STEP 1: Create Razorpay order
      // -----------------------------------------
      const orderRes = await fetch("/api/payment/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: totalPrice,
        }),
      });

      let orderData;

      try {
        orderData = await orderRes.json();
      } catch (error) {
        console.error("Invalid payment order response:", error);
        orderData = {};
      }

      console.log("Payment order response:", orderRes.status, orderData);

      // Backend failed to create Razorpay order
      if (!orderRes.ok) {
        setLoading(false);

        const fallback = window.confirm(
          "Payment could not be initialized. Would you like to use Student Bypass Mode?",
        );

        if (fallback) {
          await bypassPayment();
        } else {
          alert(orderData.message || "Payment failed to initialize.");
        }

        return;
      }

      const order = orderData.order;

      if (!order?.id) {
        setLoading(false);
        console.error("Invalid Razorpay order:", orderData);
        alert("Invalid payment order received from server.");
        return;
      }

      // -----------------------------------------
      // STEP 2: Razorpay Checkout options
      // -----------------------------------------
      const razorpayKey = process.env.RAZORPAY_API_KEY;

      if (!razorpayKey) {
        setLoading(false);

        console.error("REACT_APP_RAZORPAY_KEY_ID is not configured.");

        alert(
          "Razorpay key is not configured. Please add REACT_APP_RAZORPAY_KEY_ID.",
        );

        return;
      }

      const options = {
        key: razorpayKey,

        amount: order.amount,
        currency: order.currency || "INR",

        name: "E-Shop",
        description: "E-Shop Order",

        order_id: order.id,

        prefill: {
          name: address.fullName,
          email: user.email || "",
          contact: "9999999999",
        },

        notes: {
          address: `${address.street}, ${address.city}, ${address.postalCode}, ${address.country}`,
        },

        theme: {
          color: "#f97316",
        },

        // -----------------------------------------
        // STEP 3: Payment successful
        // -----------------------------------------
        handler: async function (response) {
          console.log("=================================");
          console.log("RAZORPAY PAYMENT SUCCESS");
          console.log("=================================");
          console.log("Razorpay response:", response);

          try {
            // -----------------------------------------
            // STEP 4: Verify payment on backend
            // -----------------------------------------
            const verifyRes = await fetch("/api/payment/verify", {
              method: "POST",

              headers: {
                "Content-Type": "application/json",
              },

              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            let verifyData;

            try {
              verifyData = await verifyRes.json();
            } catch (error) {
              verifyData = {};
            }

            console.log("Payment verification:", verifyRes.status, verifyData);

            if (!verifyRes.ok) {
              alert(verifyData.message || "Payment verification failed.");

              setLoading(false);
              return;
            }

            // -----------------------------------------
            // STEP 5: Save order in database
            // -----------------------------------------
            const saveOrderRes = await fetch("/api/orders", {
              method: "POST",

              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${user.token}`,
              },

              body: JSON.stringify({
                items: cartItems,
                totalAmount: totalPrice,
                address,
                paymentId: response.razorpay_payment_id,
              }),
            });

            let saveOrderData;

            try {
              saveOrderData = await saveOrderRes.json();
            } catch (error) {
              saveOrderData = {};
            }

            console.log("Order response:", saveOrderRes.status, saveOrderData);

            if (!saveOrderRes.ok) {
              alert(
                saveOrderData.message ||
                  "Payment succeeded, but order could not be saved.",
              );

              setLoading(false);
              return;
            }

            // -----------------------------------------
            // STEP 6: Clear cart
            // -----------------------------------------
            dispatch(clearCart());

            console.log("Order successfully created.");

            // -----------------------------------------
            // STEP 7: Go to success page
            // -----------------------------------------
            navigate("/ordersuccess", {
              replace: true,
            });
          } catch (error) {
            console.error("Payment confirmation error:", error);

            alert(
              "Payment completed, but something went wrong while confirming your order.",
            );

            setLoading(false);
          }
        },

        // -----------------------------------------
        // Razorpay modal closed
        // -----------------------------------------
        modal: {
          ondismiss: function () {
            console.log("Razorpay checkout was closed by the user.");

            setLoading(false);
          },
        },
      };

      console.log("Opening Razorpay...");
      console.log("Razorpay order:", order);

      // -----------------------------------------
      // STEP 8: Open Razorpay
      // -----------------------------------------
      const razorpay = new window.Razorpay(options);

      razorpay.on("payment.failed", function (response) {
        console.error("Razorpay payment failed:", response);

        setLoading(false);

        alert(
          response.error?.description || "Payment failed. Please try again.",
        );
      });

      razorpay.open();
    } catch (error) {
      console.error("Payment initialization error:", error);

      alert("Unable to initialize payment. Please try again.");

      setLoading(false);
    }
  };

  // -----------------------------------------
  // Submit checkout form
  // -----------------------------------------
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!user?.token) {
      alert("Please login first.");
      navigate("/login");
      return;
    }

    if (cartItems.length === 0) {
      alert("Your cart is empty.");
      navigate("/shop");
      return;
    }

    handlePayment();
  };

  return (
    <div className="checkout-container">
      <h2>Checkout</h2>

      <div className="checkout-content">
        <form onSubmit={handleSubmit} className="shipping-form">
          <h3>Shipping Address</h3>

          <input
            type="text"
            placeholder="Full Name"
            required
            value={address.fullName}
            onChange={(e) =>
              setAddress({
                ...address,
                fullName: e.target.value,
              })
            }
          />

          <input
            type="text"
            placeholder="Street"
            required
            value={address.street}
            onChange={(e) =>
              setAddress({
                ...address,
                street: e.target.value,
              })
            }
          />

          <input
            type="text"
            placeholder="City"
            required
            value={address.city}
            onChange={(e) =>
              setAddress({
                ...address,
                city: e.target.value,
              })
            }
          />

          <input
            type="text"
            placeholder="Postal Code"
            required
            value={address.postalCode}
            onChange={(e) =>
              setAddress({
                ...address,
                postalCode: e.target.value,
              })
            }
          />

          <input
            type="text"
            placeholder="Country"
            required
            value={address.country}
            onChange={(e) =>
              setAddress({
                ...address,
                country: e.target.value,
              })
            }
          />

          <div className="checkout-summary">
            <h4>Total to Pay: ₹{totalPrice.toFixed(2)}</h4>

            <button type="submit" className="btn" disabled={loading}>
              {loading ? "Processing..." : "Pay Now"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
