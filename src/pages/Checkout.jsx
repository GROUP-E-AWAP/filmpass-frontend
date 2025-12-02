import React, { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
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

// Inner checkout form component
function CheckoutForm({ clientSecret, sessionId, onSuccess, onError }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      console.error("❌ Stripe or Elements not loaded");
      return;
    }

    setLoading(true);
    console.log("🔄 Starting payment submission...");

    try {
      // Step 1: Submit elements FIRST (required by Stripe)
      console.log("📝 Submitting payment elements...");
      const { error: submitError } = await elements.submit();
      
      if (submitError) {
        console.error("❌ Elements submission error:", submitError);
        onError(submitError.message || "Failed to submit payment form");
        setLoading(false);
        return;
      }

      console.log("✅ Elements submitted successfully");

      // Step 2: Confirm payment with Stripe
      console.log("💳 Confirming payment with Stripe...");
      const successUrl = sessionId 
        ? `${window.location.origin}/payment-success?session_id=${encodeURIComponent(sessionId)}`
        : `${window.location.origin}/payment-success`;
      
      console.log("🔗 Success redirect URL:", successUrl);
      
      const result = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: successUrl,
        },
      });

      if (result.error) {
        console.error("❌ Payment confirmation error:", result.error);
        onError(result.error.message);
      } else {
        console.log("✅ Payment successful:", result.paymentIntent);
        onSuccess();
      }
    } catch (err) {
      console.error("❌ Unexpected payment error:", err);
      onError(err.message || "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <button 
        type="submit" 
        className="btn-primary" 
        disabled={loading || !stripe || !elements}
        style={{ marginTop: '20px', width: '100%' }}
      >
        {loading ? "Processing..." : "Complete Payment"}
      </button>
    </form>
  );
}

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [clientSecret, setClientSecret] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [stripePromise, setStripePromise] = useState(null);
  const [loading, setLoading] = useState(false);

  const bookingData = location.state;

  useEffect(() => {
    if (!bookingData) {
      navigate("/");
      return;
    }
  }, [bookingData, navigate]);

  const totalAmount = useMemo(() => {
    if (!bookingData) return 0;
    return getPrice(bookingData.price) * Number(bookingData.seats);
  }, [bookingData]);

  const handlePayment = async () => {
    if (clientSecret) return; // Already initialized

    setError("");
    setLoading(true);

    try {
      const payload = {
        showtimeId: bookingData.showtimeId,
        seats: bookingData.seats,
        userEmail: bookingData.userEmail,
        userName: bookingData.userName,
        amount: Math.round(totalAmount * 100), // Convert to cents
      };

      console.log("📤 Creating checkout session with payload:", payload);

      const response = await api.createCheckoutSession(payload);
      console.log("📥 Raw backend response:", response);
      console.log("📥 Response type:", typeof response);
      console.log("📥 Response keys:", Object.keys(response || {}));
      console.log("📥 Full response object:", JSON.stringify(response, null, 2));

      // Handle wrapped responses (some backends return { data: { clientSecret, ... } })
      let data = response;
      if (response?.data && typeof response.data === 'object') {
        console.log("ℹ️  Detected wrapped response format, unwrapping...");
        data = response.data;
      }

      // Check for clientSecret in various possible locations
      const clientSecret = data?.clientSecret || data?.client_secret || response?.clientSecret || response?.client_secret;
      const publishableKey = data?.publishableKey || data?.publishable_key || response?.publishableKey || process.env.VITE_STRIPE_PUBLIC_KEY;
      
      // Extract session ID - CRITICAL for payment verification
      const session = data?.sessionId || data?.session_id || data?.id || response?.sessionId || response?.session_id || response?.id;
      
      // Also check for payment intent ID from client secret (backup method)
      let paymentIntentId = null;
      if (!session && clientSecret) {
        // Extract pi_xxx from client secret format: "pi_xxx_secret_yyy"
        const match = clientSecret.match(/^(pi_[^_]+)/);
        if (match) {
          paymentIntentId = match[1];
          console.log(`📋 Extracted Payment Intent ID from secret: ${paymentIntentId}`);
        }
      }

      if (!clientSecret) {
        console.error("❌ clientSecret not found in response. Available keys:", Object.keys(data || response || {}));
        throw new Error(`Invalid response from payment server: missing clientSecret. Response: ${JSON.stringify(response)}`);
      }

      if (!publishableKey) {
        throw new Error("Stripe public key not configured. Set VITE_STRIPE_PUBLIC_KEY in .env.local");
      }

      if (!session) {
        console.warn("⚠️  Session ID not found in backend response. Verify backend is returning sessionId, session_id, or id field.");
      }

      console.log("✅ Successfully extracted clientSecret and publishableKey");
      console.log(`📋 Session ID: ${session || "NOT PROVIDED"}`);
      
      // Use session ID if available, otherwise use payment intent ID as fallback
      const idForVerification = session || paymentIntentId;
      
      setClientSecret(clientSecret);
      setSessionId(idForVerification || null); // Store session/payment intent ID for redirect
      setStripePromise(loadStripe(publishableKey));
    } catch (err) {
      console.error("❌ Payment error:", err);
      setError(err.message || "Failed to create checkout session");
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    navigate("/payment-success");
  };

  const handlePaymentError = (errorMsg) => {
    setError(errorMsg);
    setClientSecret(null); // Reset for retry
  };

  if (!bookingData) {
    return null;
  }

  // Show checkout form if ready
  if (clientSecret && stripePromise) {
    return (
      <div className="checkout-container">
        <div className="checkout-card">
          <h2 className="checkout-title">Complete Your Payment</h2>
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <CheckoutForm 
              clientSecret={clientSecret}
              sessionId={sessionId}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
            />
          </Elements>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-page">
      <div className="checkout-container">
        <div className="checkout-card">
          <h2 className="checkout-title">💳 Complete Your Booking</h2>

          <div className="checkout-details">
            <div className="detail-section">
              <h3>🎬 Movie Details</h3>
              <div className="detail-item">
                <span className="detail-label">Movie:</span>
                <span className="detail-value">{bookingData.movieTitle}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Showtime:</span>
                <span className="detail-value">
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
              <div className="detail-item">
                <span className="detail-label">Theater:</span>
                <span className="detail-value">{bookingData.theaterName}</span>
              </div>
            </div>

            <div className="detail-section">
              <h3>🎟️ Booking Information</h3>
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
                <span className="detail-label">💰 Total Amount:</span>
                <span className="detail-value total-amount">€{totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="message error">
              <strong>❌ Error:</strong> {error}
              <details style={{ marginTop: "8px", fontSize: "12px" }}>
                <summary>Troubleshooting</summary>
                <p style={{ marginTop: "8px" }}>
                  • Ensure the backend server is running at {import.meta.env.VITE_API_BASE || "http://localhost:8080"}
                  <br />
                  • Check that the payment endpoint exists: POST /create-checkout-session
                  <br />
                  • Verify Stripe API key is configured on backend
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
              disabled={loading}
              className="btn-primary"
            >
              {loading ? "⏳ Initializing..." : `💳 Proceed to Payment - €${totalAmount.toFixed(2)}`}
            </button>
          </div>

          <div className="payment-info">
            <p>🔒 Secure payment powered by Stripe</p>
            <p>Your payment information is encrypted and secure</p>
          </div>
        </div>
      </div>
    </div>
  );
}
