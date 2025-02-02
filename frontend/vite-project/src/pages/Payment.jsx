import React, { useState } from "react";

const Payment = () => {
  const [status, setStatus] = useState("");

  const handleConfirmPayment = async () => {
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
      <div className="w-96 p-6 shadow-lg bg-white rounded-md">
        <h1 className="text-3xl block text-center font-semibold">
          Make a Payment
        </h1>

        <div className="mt-3">
          <label htmlFor="amount" className="block text-base mb-2">
            Payment Amount
          </label>
          <input
            type="number"
            id="amount"
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
            onClick={handleConfirmPayment}
            className="bg-green-600 w-full py-2 text-white rounded-md"
          >
            Confirm Payment
          </button>
        </div>

        {status && (
          <div className="mt-3 text-center text-blue-600">{status}</div>
        )}
      </div>
    </div>
  );
};

export default Payment;
