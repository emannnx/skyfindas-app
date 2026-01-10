import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const AdminLogin = () => {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setIsAdmin } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (pin === "4242") {
      setLoading(true);
      setIsAdmin(true);

      // Simulate API call
      setTimeout(() => {
        navigate("/admin/dashboard");
        setLoading(false);
      }, 500);
    } else {
      setError("Invalid PIN. Please try again.");
    }
  };

  return (
    <div
      className="container"
      style={{
        maxWidth: "400px",
        padding: "40px 20px",
        minHeight: "80vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div className="card" style={{ width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <h2 style={{ color: "var(--primary-color)", marginBottom: "10px" }}>
            Admin Portal
          </h2>
          <p style={{ color: "var(--gray-color)" }}>
            Sky Appointments Management
          </p>
        </div>

        {error && (
          <div
            style={{
              backgroundColor: "var(--danger-color)",
              color: "white",
              padding: "10px",
              borderRadius: "var(--border-radius)",
              marginBottom: "20px",
              textAlign: "center",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="label">Enter Admin PIN</label>
            <input
              type="password"
              className="form-control"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              required
              placeholder="Enter 4-digit PIN"
              maxLength="4"
              style={{
                textAlign: "center",
                letterSpacing: "10px",
                fontSize: "24px",
              }}
            />
          </div>

          <div
            style={{
              fontSize: "14px",
              color: "var(--dark-gray)",
              marginBottom: "20px",
              textAlign: "center",
            }}
          >
            <p>
              Default PIN: <strong>4242</strong>
            </p>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%" }}
            disabled={loading}
          >
            {loading ? "Verifying..." : "Access Admin Dashboard"}
          </button>
        </form>

        <div className="text-center mt-3">
          <button
            onClick={() => navigate("/")}
            className="btn btn-outline btn-small"
          >
            ← Back to Home
          </button>
        </div>

        <div
          className="mt-3"
          style={{
            fontSize: "12px",
            color: "var(--dark-gray)",
            textAlign: "center",
          }}
        >
          <p>This area is restricted to authorized personnel only.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
