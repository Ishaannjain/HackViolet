import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // For navigation
import Chart from "react-apexcharts";
import Chatbot from "./ChatBot";
import transactionsData from "../data/transactions.json"; // Import JSON

const categories = ["Dining", "Entertainment", "Bills and Utilities", "Subscriptions", "Miscellaneous", "Travel"];

export default function Home() {
  const [transactions, setTransactions] = useState(transactionsData);
  const [fraudDetected, setFraudDetected] = useState(false);
  const [chatbotVisible, setChatbotVisible] = useState(false);
  const [code, setCode] = useState("");
  const [verificationStatus, setVerificationStatus] = useState(null);
  const navigate = useNavigate(); // Navigation hook

  // Compute spending per category
  const categorySpending = categories.map(category =>
    transactions.filter(t => t.category === category).reduce((sum, t) => sum + t.cost, 0)
  );

  // Update pie chart
  const chartConfig = {
    type: "pie",
    width: 500,
    height: 500,
    series: categorySpending,
    options: {
      chart: { toolbar: { show: false } },
      title: { show: "" },
      dataLabels: { enabled: false },
      colors: ["#ff8f00", "#1e88e5", "#d81b60", "#00897b", "#fbc02d", "#7b1fa2"],
      stroke: { show: false },
      legend: { show: false }, // Removed category listing
      tooltip: {
        enabled: true,
        y: {
          formatter: function (value, { seriesIndex }) {
            return `$${value} spent on ${categories[seriesIndex]}`; // Show category + cost
          }
        }
      }
    }
  };

  // Function to update transactions when a new payment is made
  const updateTransactions = (newTransaction) => {
    setTransactions((prevTransactions) => [...prevTransactions, newTransaction]);
  };

  return (
    <div className="relative min-h-screen bg-black flex flex-col items-center pt-10">
      <div className="flex flex-wrap justify-center items-center w-full px-10">
        <div className="bg-gray-800 rounded-2xl p-10 shadow-lg flex justify-center items-center">
          <Chart {...chartConfig} />
        </div>

        <div className="flex flex-col space-y-4 ml-0 sm:ml-4">
          {/* Credit Section */}
          <div className="bg-gray-800 rounded-2xl p-6 shadow-lg w-[300px] h-[140px] flex flex-col justify-center items-center">
            <span className="text-white text-xl font-bold">Available Balance: $750</span>
            <div className="w-full bg-gray-600 rounded-full h-2.5 mt-3 overflow-hidden">
              <div className="bg-green-500 h-2.5" style={{ width: "75%" }}></div>
            </div>
            <span className="text-gray-400 text-sm mt-2">Total Credit: $1000</span>
          </div>

          {/* Fraud History Section */}
          <div className="bg-gray-800 rounded-2xl p-6 shadow-lg w-[300px] h-[350px] text-white overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">Fraud History</h2>
            <ul className="space-y-3">
              <li className="border-b border-gray-600 pb-2">
                <p className="text-white font-bold">$250.00</p>
                <p className="text-gray-400 text-sm">2025-02-01 14:30</p>
              </li>
              <li className="border-b border-gray-600 pb-2">
                <p className="text-white font-bold">$125.50</p>
                <p className="text-gray-400 text-sm">2025-01-30 19:45</p>
              </li>
            </ul>
          </div>

          {/* Make Payment (Full Width) */}
          <button onClick={() => navigate("/payment")} className="bg-green-600 text-white py-3 px-6 rounded-lg shadow-lg w-full">

            Make Payment 💳
          </button>
        </div>
      </div>

      {/* Chatbot Toggle Button (Bottom Right) */}
      <button 
        onClick={() => setChatbotVisible(!chatbotVisible)}
        className="fixed bottom-5 right-5 bg-blue-600 text-white p-3 rounded-full shadow-lg">
        {chatbotVisible ? "⬇️" : "⬆️"}
      </button>

      {/* Chatbot Component */}
      {chatbotVisible && <Chatbot closeChatbot={() => setChatbotVisible(false)} />}
    </div>
  );
}
