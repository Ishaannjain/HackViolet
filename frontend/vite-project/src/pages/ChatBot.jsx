import React, { useState } from "react";

const Chatbot = ({ closeChatbot }) => {
  const [messages, setMessages] = useState([
    { text: "Hello! How can I help you?", sender: "bot" }
  ]);
  const [input, setInput] = useState("");

  const handleSendMessage = () => {
    if (input.trim() === "") return;
    
    const newMessage = { text: input, sender: "user" };
    setMessages([...messages, newMessage]);
    setInput("");

    // Simulated bot response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { text: "I'm just a bot! 😊", sender: "bot" }
      ]);
    }, 1000);
  };

  return (
    <div className="fixed bottom-5 right-5 w-[350px] h-[500px] bg-white rounded-2xl shadow-lg flex flex-col z-50">
      {/* Chat Header */}
      <div className="bg-gray-800 text-white py-3 px-5 font-semibold text-lg flex justify-between items-center rounded-t-2xl">
        Chatbot 💬
        <button 
          onClick={closeChatbot}
          className="text-white text-xl">
          ❌
        </button>
      </div>

      {/* Messages Container */}
      <div className="flex-1 p-4 overflow-y-auto space-y-2">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`px-4 py-2 rounded-lg max-w-[70%] text-white 
              ${msg.sender === "user" ? "bg-blue-500" : "bg-gray-400"}`}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-3 border-t flex items-center">
        <input
          type="text"
          className="flex-1 border rounded-full px-3 py-2 outline-none"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
        />
        <button 
          className="ml-2 bg-blue-500 text-white px-4 py-2 rounded-full" 
          onClick={handleSendMessage}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chatbot;
