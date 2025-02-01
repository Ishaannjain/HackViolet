import React from 'react';
import { Link } from 'react-router-dom';
import "tailwindcss";

const Login = () => {
  return (
    <div className="flex justify-center items-center h-screen bg-black">
      <div className="w-96 p-6 shadow-lg bg-white rounded-md mt-[-50px]">
        <h1 className="text-3xl block text-center font-semibold">Login</h1>
        <div className="mt-3">
          <label htmlFor="username" className="block text-base mb-2">
            Username/Phone Number
          </label>
          <input
            type="text"
            id="username"
            className="border w-full text-base px-2 py-1 focus:outline-none focus:ring-0 focus:border-gray-600"
            placeholder="Enter username..."
          />
        </div>
        <div className="mt-3">
          <label htmlFor="password" className="block text-base mb-2">
            Password
          </label>
          <input
            type="password"
            id="password"
            className="border w-full text-base px-2 py-1 focus:outline-none focus:ring-0 focus:border-gray-600"
            placeholder="Enter password..."
          />
        </div>
        <div className="mt-5">
          <button className="bg-black w-full py-2 text-white rounded-md">
            Sign In
          </button>
        </div>
        <div className="mt-3 text-center">
          <p className="text-gray-600">Don't have an account?</p>
          <Link to="/signup">
            <button className="bg-gray-700 w-full py-2 text-white rounded-md mt-2">
              Sign Up
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;