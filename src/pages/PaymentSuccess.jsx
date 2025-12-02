import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { api } from "../api";

// Helper function to safely extract price - handles both cents (integers) and decimals
const getPrice = (value) => {
  if (value === null || value === undefined) return 0;
  
  let numPrice = parseFloat(value);
  if (isNaN(numPrice)) return 0;
  
  // If value appears to be in cents (large integer), convert to euros
  if (Number.isInteger(value) && value > 100) {
    numPrice = numPrice / 100;
  }
  
  return numPrice;
};

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [bookingData, setBookingData] = useState(null);
  const [error, setError] = useState("");

  // Get either session_id or use client_secret from URL (Stripe may redirect with client_secret)
  let verifyId = searchParams.get("session_id");
  if (!verifyId) {
    const clientSecret = searchParams.get("client_secret");
    if (clientSecret) {
      // Extract pi_xxx from client secret format: "pi_xxx_secret_yyy"
      const match = clientSecret.match(/^(pi_[^_]+)/);
      verifyId = match ? match[1] : clientSecret;
      console.log(`📋 Using Payment Intent ID from client_secret: ${verifyId}`);
    }
  }

  useEffect(() => {
    if (!verifyId) {
      console.warn("⚠️  No session_id or client_secret found in URL");
      navigate("/");
      return;
    }

    console.log(`🔍 Verifying payment with ID: ${verifyId}`);

    // Verify payment and get booking details
    const verifyPayment = async () => {
      try {
        const data = await api.verifyPayment(verifyId);
        setBookingData(data);
      } catch (err) {
        console.error("❌ Payment verification error:", err.message);
        setError(err.message || "Failed to verify payment");
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [verifyId, navigate]);

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
      <div className="payment-page">
        <div className="payment-result-container">
          <div className="payment-result-card error-card">
            <div className="result-icon error-icon">⚠️</div>
            <h2>Verification Failed</h2>
            <p className="result-message">{error}</p>
            <div className="error-details" style={{ marginTop: '20px', padding: '16px', background: '#fff3cd', borderRadius: '8px', textAlign: 'left', fontSize: '14px' }}>
              <p><strong>What happened?</strong></p>
              <p>We couldn't verify your payment. Your payment may still be processing, or there may have been an issue.</p>
              <p style={{ marginTop: '12px', marginBottom: '0' }}><strong>What to do:</strong></p>
              <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
                <li>Check your email for payment confirmation</li>
                <li>Your bank account will reflect the charge if payment was taken</li>
                <li>Contact support with your transaction ID if you have questions</li>
              </ul>
            </div>
            <div className="result-actions" style={{ marginTop: '24px' }}>
              <button onClick={() => navigate("/")} className="btn-primary">
                ← Return to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-page">
      <div className="payment-result-container">
        <div className="payment-result-card success-card">
          <div className="result-icon success-icon">✓</div>
          <h2>Payment Successful!</h2>
          <p className="result-message">
            Your booking has been confirmed. A confirmation email has been sent to your registered email address.
          </p>

          {bookingData && (
            <div className="booking-summary">
              <h3>📋 Booking Details</h3>
              {bookingData.bookingId && (
                <div className="summary-item">
                  <span className="summary-label">Confirmation ID:</span>
                  <span className="summary-value booking-id">{bookingData.bookingId}</span>
                </div>
              )}
              {bookingData.movieTitle && (
                <div className="summary-item">
                  <span className="summary-label">🎬 Movie:</span>
                  <span className="summary-value">{bookingData.movieTitle}</span>
                </div>
              )}
              {bookingData.showtime && (
                <div className="summary-item">
                  <span className="summary-label">⏰ Showtime:</span>
                  <span className="summary-value">
                    {new Date(bookingData.showtime).toLocaleString('en-US', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              )}
              {bookingData.theaterName && (
                <div className="summary-item">
                  <span className="summary-label">🏢 Theater:</span>
                  <span className="summary-value">{bookingData.theaterName}</span>
                </div>
              )}
              {bookingData.auditoriumName && (
                <div className="summary-item">
                  <span className="summary-label">🎪 Auditorium:</span>
                  <span className="summary-value">{bookingData.auditoriumName}</span>
                </div>
              )}
              {bookingData.seats && (
                <div className="summary-item">
                  <span className="summary-label">🎟️ Tickets:</span>
                  <span className="summary-value">{bookingData.seats} {bookingData.seats === 1 ? 'ticket' : 'tickets'}</span>
                </div>
              )}
              {bookingData.seatNumbers && (
                <div className="summary-item">
                  <span className="summary-label">🪑 Seat Numbers:</span>
                  <span className="summary-value seat-list">{bookingData.seatNumbers}</span>
                </div>
              )}
              {bookingData.total !== undefined && (
                <div className="summary-item total-item">
                  <span className="summary-label">💳 Total Paid:</span>
                  <span className="summary-value total-amount">
                    €{getPrice(bookingData.total).toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="confirmation-message">
            <p><strong>✅ Your payment has been received and processed securely.</strong></p>
            <p style={{ fontSize: '14px', marginTop: '8px' }}>Your e-tickets have been sent to your email. Please arrive 15 minutes before showtime.</p>
          </div>

          <div className="result-actions">
            <button onClick={() => navigate("/")} className="btn-primary">
              🎬 Browse More Movies
            </button>
            <button onClick={() => window.print()} className="btn-secondary" title="Print or save this confirmation">
              🖨️ Print Confirmation
            </button>
          </div>

          <div className="payment-info">
            <p>📧 Confirmation details have been sent to your email</p>
            <p style={{ fontSize: '12px', marginTop: '8px', color: '#999' }}>Keep your booking reference for check-in at the theater</p>
          </div>
        </div>
      </div>
    </div>
  );
}
