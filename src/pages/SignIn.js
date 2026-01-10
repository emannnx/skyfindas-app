import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signIn } from "../firebase/auth";

const SignIn = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signIn(formData.email, formData.password);
      navigate("/dashboard");
    } catch (err) {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="container"
      style={{ maxWidth: "500px", padding: "40px 20px" }}
    >
      <div className="card">
        <h2 className="text-center mb-2">Sign In</h2>
        <p className="text-center mb-3" style={{ color: "var(--gray-color)" }}>
          Welcome back to Sky Appointments
        </p>

        {error && (
          <div
            style={{
              backgroundColor: "var(--danger-color)",
              color: "white",
              padding: "10px",
              borderRadius: "var(--border-radius)",
              marginBottom: "20px",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="label">Email Address</label>
            <input
              type="email"
              name="email"
              className="form-control"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label className="label">Password</label>
            <input
              type="password"
              name="password"
              className="form-control"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%" }}
            disabled={loading}
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <p className="text-center mt-3">
          Don't have an account?{" "}
          <Link
            to="/signup"
            style={{ color: "var(--primary-color)", textDecoration: "none" }}
          >
            Sign Up
          </Link>
        </p>

        <div className="text-center mt-3">
          <Link
            to="/admin"
            style={{ color: "var(--primary-color)", textDecoration: "none" }}
          >
            Admin Login →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
