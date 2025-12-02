import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { api } from "../api";

// Helper function to safely extract price
const getPrice = (value) => {
  const numPrice = parseFloat(value);
  return isNaN(numPrice) ? 0 : numPrice;
};

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [bookingData, setBookingData] = useState(null);
  const [error, setError] = useState("");

  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    if (!sessionId) {
      navigate("/");
      return;
    }

    // Verify payment and get booking details
    const verifyPayment = async () => {
      try {
        const data = await api.verifyPayment(sessionId);
        setBookingData(data);
      } catch (err) {
        setError(err.message || "Failed to verify payment");
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [sessionId, navigate]);

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p style={{ marginTop: "16px" }}>Verifying your payment...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="payment-result-container">
        <div className="payment-result-card error-card">
          <div className="result-icon error-icon">✗</div>
          <h2>Payment Verification Failed</h2>
          <p className="result-message">{error}</p>
          <button onClick={() => navigate("/")} className="btn-primary">
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-result-container">
      <div className="payment-result-card success-card">
        <div className="result-icon success-icon">✓</div>
        <h2>Payment Successful!</h2>
        <p className="result-message">
          Your booking has been confirmed. A confirmation email has been sent to your email address.
        </p>

        {bookingData && (
          <div className="booking-summary">
            <h3>Booking Details</h3>
            <div className="summary-item">
              <span className="summary-label">Booking ID:</span>
              <span className="summary-value">{bookingData.bookingId}</span>
            </div>
            {bookingData.movieTitle && (
              <div className="summary-item">
                <span className="summary-label">Movie:</span>
                <span className="summary-value">{bookingData.movieTitle}</span>
              </div>
            )}
            {bookingData.showtime && (
              <div className="summary-item">
                <span className="summary-label">Showtime:</span>
                <span className="summary-value">
                  {new Date(bookingData.showtime).toLocaleString()}
                </span>
              </div>
            )}
            {bookingData.theaterName && (
              <div className="summary-item">
                <span className="summary-label">Theater:</span>
                <span className="summary-value">{bookingData.theaterName}</span>
              </div>
            )}
            {bookingData.seats && (
              <div className="summary-item">
                <span className="summary-label">Number of Tickets:</span>
                <span className="summary-value">{bookingData.seats}</span>
              </div>
            )}
            {bookingData.total && (
              <div className="summary-item total-item">
                <span className="summary-label">Total Paid:</span>
                <span className="summary-value total-amount">
                  €{getPrice(bookingData.total).toFixed(2)}
                </span>
              </div>
            )}
          </div>
        )}

        <div className="result-actions">
          <button onClick={() => navigate("/")} className="btn-primary">
            Browse More Movies
          </button>
        </div>

        <div className="payment-info">
          <p>📧 Check your email for booking confirmation and ticket details</p>
        </div>
      </div>
    </div>
  );
}
