import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "../styles/auth.css";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useContext(AuthContext);
  const [otp, setOtp] = useState("");
  const [processing, setProcessing] = useState(false);
  const [resending, setResending] = useState(false);

  const [showOtpInput, setShowOtpInput] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setShowOtpInput(true);
      } else {
        alert(data.message);
      }
    } catch (error) {
        alert("Something went wrong. Please try again.");
      console.error(error);
    } finally {
      setProcessing(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (res.ok) {
        login(data);
        navigate("/");
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong. Please try again.");
    } finally {
      setProcessing(false);
    }
  };
  const handleResendOtp = async () => {
    setResending(true);
    try {
        const res = await fetch("/api/auth/resend-otp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
        });
        const data = await res.json();
        if (res.ok) {
            alert("OTP resent successfully.");
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error(error);
        alert("Something went wrong. Please try again.");
    } finally {
        setResending(false);
    }
  };

  return (
    <div className="auth-container">
      {!showOtpInput ? (
        <form
          onSubmit={handleSubmit}
          className={`auth-form ${processing ? "loading-form" : ""}`}
        >
          <h2>Register</h2>
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" className="btn" disabled={processing}>
            {processing ? "Sending OTP..." : "Register and Verify OTP"}
          </button>
          <p>
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </form>
      ) : (
        <form
          onSubmit={handleOtpSubmit}
          className={`auth-form ${processing ? "loading-form" : ""}`}
        >
          <h2>Verify OTP</h2>
          <input
            type="text"
            placeholder="OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            maxLength={6}
            inputMode="numeric"
            required
          />
          <button
            type="submit"
            className="btn"
            disabled={processing || otp.length !== 6}
          >
            {processing ? "Verifying..." : "Verify OTP"}
          </button>
          <p>
            Didn't receive the OTP?{" "}
            <span
              onClick={!resending ? handleResendOtp : undefined}
              style={{
                cursor: resending ? "not-allowed" : "pointer",
                color: "orange",
                opacity: resending ? 0.5 : 1,
              }}
            >
              {resending ? "Resending..." : "Resend OTP"}
            </span>
          </p>
        </form>
      )}
    </div>
  );
};

export default Register;
