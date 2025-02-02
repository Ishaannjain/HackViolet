import React, { useState } from "react";

const Payment = () => {
  const [category, setCategory] = useState("");

  return (
    <div className="flex justify-center items-center h-screen bg-black">
      <div className="w-96 p-6 shadow-lg bg-white rounded-md">
        <h1 className="text-3xl block text-center font-semibold">Make a Payment</h1>
        
        <div className="mt-3">
          <label htmlFor="amount" className="block text-base mb-2">Payment Amount</label>
          <input
            type="number"
            id="amount"
            className="border w-full text-base px-2 py-1 focus:outline-none focus:ring-0 focus:border-gray-600"
            placeholder="Enter amount..."
          />
        </div>

        <div className="mt-3">
          <label htmlFor="card" className="block text-base mb-2">Card Number</label>
          <input
            type="text"
            id="card"
            className="border w-full text-base px-2 py-1 focus:outline-none focus:ring-0 focus:border-gray-600"
            placeholder="Enter card number..."
          />
        </div>

        <div className="mt-3">
          <label htmlFor="expiry" className="block text-base mb-2">Expiry Date</label>
          <input
            type="text"
            id="expiry"
            className="border w-full text-base px-2 py-1 focus:outline-none focus:ring-0 focus:border-gray-600"
            placeholder="MM/YY"
          />
        </div>

        <div className="mt-3">
          <label htmlFor="cvv" className="block text-base mb-2">CVV</label>
          <input
            type="password"
            id="cvv"
            className="border w-full text-base px-2 py-1 focus:outline-none focus:ring-0 focus:border-gray-600"
            placeholder="Enter CVV..."
          />
        </div>

        <div className="mt-3">
          <label htmlFor="category" className="block text-base mb-2">Payment Category</label>
          <select
            id="category"
            className="border w-full text-base px-2 py-1 focus:outline-none focus:ring-0 focus:border-gray-600"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">Select a category...</option>
            <option value="Dining">Dining</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Bills and Utilities">Bills and Utilities</option>
            <option value="Subscriptions">Subscriptions</option>
            <option value="Miscellaneous">Miscellaneous</option>
            <option value="Travel">Travel</option>
          </select>
        </div>

        <div className="mt-5">
          <button className="bg-green-600 w-full py-2 text-white rounded-md">Confirm Payment</button>
        </div>
      </div>
    </div>
  );
};

export default Payment;