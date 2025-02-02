import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate

const UserDetails = () => {
  const [firstName, setFirstName] = useState("");
  const [secondName, setSecondName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [pin, setPin] = useState("");
  
  const navigate = useNavigate(); // Initialize navigate function

  const handleSubmit = () => {
    // Perform any form validation or API call here
    navigate("/"); // Redirect to homepage
  };

  return (
    <div className="flex justify-center items-center h-screen bg-black">
      <div className="w-96 p-6 shadow-lg bg-white rounded-md">
        <h1 className="text-3xl block text-center font-semibold">User Details</h1>

        <div className="mt-3">
          <label htmlFor="firstName" className="block text-base mb-2">
            First Name
          </label>
          <input
            type="text"
            id="firstName"
            className="border w-full text-base px-2 py-1 focus:outline-none focus:ring-0 focus:border-gray-600"
            placeholder="Enter first name..."
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </div>

        <div className="mt-3">
          <label htmlFor="secondName" className="block text-base mb-2">
            Second Name
          </label>
          <input
            type="text"
            id="secondName"
            className="border w-full text-base px-2 py-1 focus:outline-none focus:ring-0 focus:border-gray-600"
            placeholder="Enter second name..."
            value={secondName}
            onChange={(e) => setSecondName(e.target.value)}
          />
        </div>

        <div className="mt-3">
          <label htmlFor="phoneNumber" className="block text-base mb-2">
            Phone Number
          </label>
          <input
            type="text"
            id="phoneNumber"
            className="border w-full text-base px-2 py-1 focus:outline-none focus:ring-0 focus:border-gray-600"
            placeholder="Enter phone number..."
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
        </div>

        <div className="mt-3">
          <label htmlFor="pin" className="block text-base mb-2">
            4-Digit PIN
          </label>
          <input
            type="password"
            id="pin"
            className="border w-full text-base px-2 py-1 focus:outline-none focus:ring-0 focus:border-gray-600 text-center"
            placeholder="Enter 4-digit PIN..."
            value={pin}
            maxLength="4"
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, ""); // Only allow numbers
              if (value.length <= 4) setPin(value);
            }}
          />
        </div>

        <div className="mt-5">
          <button 
            className="bg-black w-full py-2 text-white rounded-md"
            onClick={handleSubmit}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserDetails;