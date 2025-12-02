import React, { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { CheckoutProvider } from "@stripe/react-stripe-js/checkout";
import { PaymentElement, useCheckout } from "@stripe/react-stripe-js/checkout";
import { api } from "../api";

// Helper function to safely extract price
const getPrice = (value) => {
  const numPrice = parseFloat(value);
  return isNaN(numPrice) ? 0 : numPrice;
};

// Inner checkout form component
function CheckoutForm() {
  const checkoutState = useCheckout();

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (checkoutState.type === 'loading' || checkoutState.type === 'error') {
      return;
    }

    const { checkout } = checkoutState;
    const result = await checkout.confirm();
    console.log('Checkout result:', result);

    if (result.type === 'error') {
      console.log(result.error.message);
    }
  };

  if (checkoutState.type === 'loading') {
    return <div className="loading">Loading payment form...</div>;
  }

  if (checkoutState.type === 'error') {
    return <div className="message error">Error: {checkoutState.error.message}</div>;
  }

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <button type="submit" className="btn-primary" style={{ marginTop: '20px', width: '100%' }}>
        Complete Payment
      </button>
    </form>
  );
}

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [showCheckout, setShowCheckout] = useState(false);
  const [stripePromise, setStripePromise] = useState(null);

  const bookingData = location.state;

  useEffect(() => {
    if (!bookingData) {
      navigate("/");
      return;
    }
  }, [bookingData, navigate]);

  const totalAmount = getPrice(bookingData.price) * Number(bookingData.seats);

  // Create clientSecret promise using useMemo
  const clientSecretPromise = useMemo(() => {
    if (!showCheckout) return null;

    const payload = {
      showtimeId: bookingData.showtimeId,
      seats: bookingData.seats,
      userEmail: bookingData.userEmail,
      userName: bookingData.userName,
      amount: totalAmount,
    };

    console.log("Creating checkout session with data:", payload);

    return api.createCheckoutSession(payload)
      .then((response) => {
        console.log("Checkout session response:", response);
        if (!response.clientSecret) {
          throw new Error("Invalid response from payment server");
        }
        // Set stripe promise when we have the publishable key
        if (response.publishableKey && !stripePromise) {
          setStripePromise(loadStripe(response.publishableKey));
        }
        return response.clientSecret;
      })
      .catch((err) => {
        console.error("Payment error:", err);
        setError(err.message || "Failed to create checkout session");
        throw err;
      });
  }, [showCheckout, bookingData, totalAmount, stripePromise]);

  const handlePayment = () => {
    setError("");
    setShowCheckout(true);
  };

  if (!bookingData) {
    return null;
  }

  // Show checkout form if ready
  if (showCheckout && stripePromise && clientSecretPromise) {
    return (
      <div className="checkout-container">
        <div className="checkout-card">
          <h2 className="checkout-title">Complete Your Payment</h2>
          <CheckoutProvider
            stripe={stripePromise}
            options={{ clientSecret: clientSecretPromise }}
          >
            <CheckoutForm />
          </CheckoutProvider>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <div className="checkout-card">
        <h2 className="checkout-title">Complete Your Booking</h2>

        <div className="checkout-details">
          <div className="detail-section">
            <h3>Movie Details</h3>
            <div className="detail-item">
              <span className="detail-label">Movie:</span>
              <span className="detail-value">{bookingData.movieTitle}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Showtime:</span>
              <span className="detail-value">
                {new Date(bookingData.showtime).toLocaleString()}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Theater:</span>
              <span className="detail-value">{bookingData.theaterName}</span>
            </div>
          </div>

          <div className="detail-section">
            <h3>Booking Information</h3>
            <div className="detail-item">
              <span className="detail-label">Number of Tickets:</span>
              <span className="detail-value">{bookingData.seats}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Price per Ticket:</span>
              <span className="detail-value">€{getPrice(bookingData.price).toFixed(2)}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Name:</span>
              <span className="detail-value">{bookingData.userName || "Guest"}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Email:</span>
              <span className="detail-value">{bookingData.userEmail || "guest@example.com"}</span>
            </div>
          </div>

          <div className="detail-section total-section">
            <div className="detail-item total-item">
              <span className="detail-label">Total Amount:</span>
              <span className="detail-value total-amount">€{totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="message error">
            <strong>Error:</strong> {error}
            <details style={{ marginTop: "8px", fontSize: "12px" }}>
              <summary>Troubleshooting</summary>
              <p style={{ marginTop: "8px" }}>
                • Ensure the backend server is running at {import.meta.env.VITE_API_BASE || "http://localhost:8080"}
                <br />
                • Check that the payment endpoint exists: POST /create-checkout-session
                <br />
                • Open browser console (F12) for detailed error logs
              </p>
            </details>
          </div>
        )}

        <div className="checkout-actions">
          <button
            onClick={() => navigate(-1)}
            className="btn-secondary"
          >
            ← Back
          </button>
          <button
            onClick={handlePayment}
            className="btn-primary"
          >
            Proceed to Payment - €{totalAmount.toFixed(2)}
          </button>
        </div>

        <div className="payment-info">
          <p>🔒 Secure payment powered by Stripe</p>
          <p>You will be redirected to Stripe's secure checkout page</p>
        </div>
      </div>
    </div>
  );
}
