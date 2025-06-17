import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Payment = () => {
  const [transactionCount, setTransactionCount] = useState(0);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const savedCount = localStorage.getItem("transactionCount");
    if (savedCount) {
      setTransactionCount(parseInt(savedCount));
    }
  }, []);

  const handlePaymentConfirm = async () => {
    const newCount = transactionCount + 1;
    setTransactionCount(newCount);
    localStorage.setItem("transactionCount", newCount.toString());

    if (newCount === 3) {
      localStorage.setItem("fraudDetected", "true");
      navigate("/");
    } else {
      setShowConfirmation(true);
      setTimeout(() => {
        setShowConfirmation(false);
      }, 3000);
    }

    // Also send to backend
    try {
      const response = await fetch("http://localhost:4000/send_balls", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      setStatus(data.message || "Payment confirmed");
    } catch (error) {
      console.error("Error:", error);
      setStatus("Error confirming payment");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-black">
      <div className="w-96 p-6 shadow-lg bg-white rounded-md relative">
        {showConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 transform transition-all duration-500 animate-bounce">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4">
                  <svg
                    className="w-8 h-8 text-white animate-scale"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Payment Successful!
                </h2>
                <p className="text-gray-600 mb-4">
                  ${amount || "0"} has been processed successfully
                </p>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Processing transaction...</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <h1 className="text-3xl block text-center font-semibold">Make a Payment</h1>

        <div className="mt-3">
          <label htmlFor="amount" className="block text-base mb-2">
            Payment Amount
          </label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="border w-full text-base px-2 py-1 focus:outline-none focus:ring-0 focus:border-gray-600"
            placeholder="Enter amount..."
          />
        </div>

        <div className="mt-3">
          <label htmlFor="card" className="block text-base mb-2">
            Card Number
          </label>
          <input
            type="text"
            id="card"
            className="border w-full text-base px-2 py-1 focus:outline-none focus:ring-0 focus:border-gray-600"
            placeholder="Enter card number..."
          />
        </div>

        <div className="mt-3">
          <label htmlFor="expiry" className="block text-base mb-2">
            Expiry Date
          </label>
          <input
            type="text"
            id="expiry"
            className="border w-full text-base px-2 py-1 focus:outline-none focus:ring-0 focus:border-gray-600"
            placeholder="MM/YY"
          />
        </div>

        <div className="mt-3">
          <label htmlFor="cvv" className="block text-base mb-2">
            CVV
          </label>
          <input
            type="password"
            id="cvv"
            className="border w-full text-base px-2 py-1 focus:outline-none focus:ring-0 focus:border-gray-600"
            placeholder="Enter CVV..."
          />
        </div>

        <div className="mt-5">
          <button
            onClick={handlePaymentConfirm}
            className="bg-green-600 w-full py-2 text-white rounded-md hover:bg-green-700 transition-colors transform hover:scale-105 duration-200"
          >
            Confirm Payment
          </button>
        </div>

        {status && (
          <div className="mt-3 text-center text-blue-600">{status}</div>
        )}
      </div>

      <style jsx>{`
        @keyframes scale {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }
        .animate-scale {
          animation: scale 2s infinite;
        }
      `}</style>
    </div>
  );
};

export default Payment;
