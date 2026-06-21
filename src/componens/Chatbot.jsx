import React, { useState, useEffect, useRef } from "react";
import "./Chatbot.css";

const ruleBasedResponses = [
  { keywords: ["app", "website", "about", "platform"], reply: "This is a car rental platform where you can explore and request to book cars. We also provide AI-based recommendations and customer support to help you choose the best car for your journey." },
  { keywords: ["price", "cost", "budget", "per day"], reply: "You can use our AI Recommendation feature to find rental cars within your daily budget quickly." },
  { keywords: ["help", "support"], reply: "I'm here to assist you! You can ask me about renting cars, booking requests, or daily charges." },
  { keywords: ["contact"], reply: "You can reach us through the Contact page available in the navigation bar." },
  { keywords: ["book", "rent", "request", "booking"], reply: "To rent a car, navigate to the 'AI Recommend' or 'BookCar' section, explore available cars, and click 'Request Booking' to submit your request to our team!" },
  { keywords: ["payment", "pay", "credit card", "emi", "charge"], reply: "We accept payments via Credit/Debit Cards, UPI, and EMI. You can make payments securely once your booking request is formally approved by an administrator." },
  { keywords: ["electric", "ev", "tesla"], reply: "Yes! We have a great range of Electric Vehicles (EVs) like the Tesla Model 3 and Tata Nexon EV. Check the AI Recommendation page for filtering by Electric fuel type." },
  { keywords: ["login", "register", "sign in", "sign up", "account"], reply: "To log in or create an account, click on 'Login' or 'Profile' on the top right corner of the navigation bar." },
  { keywords: ["gps", "tracker", "track", "location"], reply: "Our GPS Tracker feature allows you to track your booked car's location in real-time. Navigate to 'GPS Tracker' from the menu!" },
  { keywords: ["recommend", "suggest", "ai", "recommendation"], reply: "Try our new AI Car Recommendation tool! It intelligently finds the perfect car for you based on budget, purpose, and fuel preference. Click 'AI Recommend' in the top menu." },
  { keywords: ["hello", "hi", "hey"], reply: "Hello there! I'm your AI Support Assistant. How can I help you today? You can ask me about renting, booking requests, or car recommendations." },
];

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hi! I'm your AI Assistant. How can I help you with your car rental journey today?" }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to the bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen, isTyping]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    
    const userInputLower = input.toLowerCase().trim();
    setInput("");
    setIsTyping(true);

    // Simulate network delay for AI feel
    setTimeout(() => {
      let botReply = "I'm here to help! Please ask about renting, available cars, payment, or try our AI recommendations.";

      // Rule-based matching
      for (const rule of ruleBasedResponses) {
        if (rule.keywords.some((keyword) => userInputLower.includes(keyword))) {
          botReply = rule.reply;
          break; // Stop at the very first strong match
        }
      }

      setMessages((prev) => [...prev, { sender: "bot", text: botReply }]);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <div className="chatbot-wrapper">
      {/* Floating Button */}
      {!isOpen && (
        <button className="chat-fab" onClick={() => setIsOpen(true)}>
          💬
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <h4>AI Support Assistant</h4>
            <button className="chat-close-btn" onClick={() => setIsOpen(false)}>
              ✖
            </button>
          </div>

          <div className="chat-messages">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`chat-bubble ${msg.sender === "user" ? "user-bubble" : "bot-bubble"}`}
              >
                {msg.text}
              </div>
            ))}
            {isTyping && (
              <div className="chat-bubble bot-bubble typing-indicator">
                Typing...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSend} className="chat-input-area">
            <input
              type="text"
              placeholder="Ask me something..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button type="submit" className="chat-send-btn" disabled={!input.trim()}>
              ➤
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
