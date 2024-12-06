import { useState } from "react";
import "./ChatApp.css";

const ChatApp = () => {
  const [messages, setMessages] = useState([
    { text: "I’m Tina. I help you to choose the right insurance policy. May I ask you a few personal questions to make sure I recommend the best policy for you?", isUser: false }
  ]);
  const [userInput, setUserInput] = useState("");

  const sendMessage = async () => {
    if (!userInput.trim()) return;

    const newMessages = [...messages, { text: userInput, isUser: true }];
    setMessages(newMessages);

    setUserInput("");

    try {
        const response = await fetch("/api/insurance/start-recommendation", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userResponse: userInput, questionCount: messages.length })
        });
        

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setMessages([...newMessages, { text: data.message, isUser: false }]);
    } catch (error) {
        console.error("Error sending message:", error.message);
        setMessages([...newMessages, { text: "Error: Unable to get a response. Please try again.", isUser: false }]);
    }
};



  return (
    <div className="chat-container">
      <div className="messages">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`message ${message.isUser ? "user-message" : "ai-message"}`}
          >
            {message.text}
          </div>
        ))}
      </div>
      <div className="input-container">
        <textarea
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Type your response here..."
        />
        <button onClick={sendMessage}>Submit</button>
      </div>
    </div>
  );
};

export default ChatApp;
