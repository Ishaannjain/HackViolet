import { useState } from "react";
import Chart from "react-apexcharts";
import Chatbot from "./ChatBot"; // Ensure correct path

const chartConfig = {
  type: "pie",
  width: 500,
  height: 500,
  series: [44, 55, 13, 43, 22],
  options: {
    chart: { toolbar: { show: false } },
    title: { show: "" },
    dataLabels: { enabled: false },
    colors: ["#ffffff", "#ff8f00", "#00897b", "#1e88e5", "#d81b60"],
    stroke: { show: false }, // Removes white outline
    legend: { show: false },
  },
};

const totalCredit = 1000;
const availableCredit = 750;
const usedPercentage = ((totalCredit - availableCredit) / totalCredit) * 100;

export default function Home() {
  const [fraudDetected, setFraudDetected] = useState(false);
  const [chatbotVisible, setChatbotVisible] = useState(false);
  const [code, setCode] = useState("");
  const [verificationStatus, setVerificationStatus] = useState(null);

  const handleVerify = () => {
    if (code === "1234") {
      setVerificationStatus("success");
    } else {
      setVerificationStatus("failure");
    }
    setFraudDetected(false);
    setTimeout(() => {
      setVerificationStatus(null);
      setCode("");
    }, 3000);
  };

  const handleReport = () => {
    setVerificationStatus("failure");
    setFraudDetected(false);
    setTimeout(() => {
      setVerificationStatus(null);
      setCode("");
    }, 3000);
  };

  return (
    <div className="relative min-h-screen bg-black flex flex-col items-center pt-10">
      {verificationStatus ? (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex flex-col justify-center items-center">
          <h1 className={`text-3xl font-bold mb-4 ${verificationStatus === "success" ? "text-green-500" : "text-red-500"}`}>
            {verificationStatus === "success" ? "Transaction Successful" : "Transaction Failed"}
          </h1>
          <div className={`p-6 rounded-lg shadow-lg text-white text-4xl ${verificationStatus === "success" ? "bg-green-600" : "bg-red-600"}`}>
            {verificationStatus === "success" ? "✅" : "❌"}
          </div>
        </div>
      ) : fraudDetected ? (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-96 text-center">
            <h2 className="text-white text-xl font-bold mb-4">🚨 Fraud Detected</h2>
            <p className="text-gray-300">Is this you?</p>
            <button 
              onClick={handleReport}
              className="mt-4 bg-red-600 w-full py-2 rounded text-white font-bold">
              Report. This was not me
            </button>
            <input
              type="text"
              className="mt-4 w-full p-2 rounded bg-gray-700 text-white text-center"
              maxLength="4"
              placeholder="Enter 4-digit code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <button 
              onClick={handleVerify}
              className="mt-4 bg-red-600 w-full py-2 rounded text-white font-bold">
              Verify
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap justify-center items-center w-full px-10">
          <div className="bg-gray-800 rounded-2xl p-10 shadow-lg flex justify-center items-center">
            <Chart {...chartConfig} />
          </div>

          <div className="flex flex-col space-y-4 ml-0 sm:ml-4">
            {/* Credit Section */}
            <div className="bg-gray-800 rounded-2xl p-6 shadow-lg w-[300px] h-[140px] flex flex-col justify-center items-center">
              <span className="text-white text-xl font-bold">Available Balance: ${availableCredit}</span>
              <div className="w-full bg-gray-600 rounded-full h-2.5 mt-3 overflow-hidden">
                <div className="bg-green-500 h-2.5" style={{ width: `${100 - usedPercentage}%` }}></div>
              </div>
              <span className="text-gray-400 text-sm mt-2">Total Credit: ${totalCredit}</span>
            </div>

            {/* Empty Notifications Box */}
            <div className="bg-gray-800 rounded-2xl p-6 shadow-lg w-[300px] h-[350px] text-white overflow-y-auto">
              <h2 className="text-lg font-semibold mb-4">Notifications</h2>
              <ul className="space-y-3">
                {/* Empty for now - You can add notifications here later */}
              </ul>
            </div>
            
            {/* Buttons for Fraud Alert and Chatbot */}
            <div className="flex space-x-4">
              <button 
                onClick={() => setFraudDetected(true)}
                className="bg-red-600 text-white py-2 px-4 rounded-lg shadow-lg w-[140px]">
                Trigger Fraud Alert
              </button>

              <button 
                onClick={() => setChatbotVisible(true)}
                className="bg-blue-600 text-white py-2 px-4 rounded-lg shadow-lg w-[140px]">
                Chatbot 💬
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chatbot Component (Only visible when chatbotVisible is true) */}
      {chatbotVisible && (
        <Chatbot closeChatbot={() => setChatbotVisible(false)} />
      )}
    </div>
  );
}
