import React from "react";
import { useNavigate } from "react-router-dom";

export default function PaymentCancel() {
  const navigate = useNavigate();

  return (
    <div className="payment-page">
      <div className="payment-result-container">
        <div className="payment-result-card cancel-card">
          <div className="result-icon cancel-icon">⚠</div>
          <h2>Payment Cancelled</h2>
          <p className="result-message">
            Your payment has been cancelled. No charges were made to your account.
          </p>
          <p className="result-submessage">
            You can try booking again or browse other movies.
          </p>

          <div className="result-actions">
            <button onClick={() => navigate(-2)} className="btn-secondary">
              ← Return to Movie
            </button>
            <button onClick={() => navigate("/")} className="btn-primary">
              🎬 Browse Movies
            </button>
          </div>

          <div className="payment-info">
            <p>💡 Need help? Contact our support team</p>
          </div>
        </div>
      </div>
    </div>
  );
}
