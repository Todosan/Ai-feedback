import { useState } from "react";
import PropTypes from "prop-types";
import "./ChatApp.css";

// ChatApp Component
const ChatApp = ({ onRecommend }) => {
  const [messages, setMessages] = useState([
    {
      text: "I'm Tina. I help you choose the right insurance policy. May I ask you a few personal questions to make sure I recommend the best policy for you?",
      isUser: false,
    },
  ]);
  const [userInput, setUserInput] = useState("");
  const [isRecommendationReady, setIsRecommendationReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const [error, setError] = useState(null); // Error state
  const [userResponses, setUserResponses] = useState([]); // Store user responses
  const [recommendation, setRecommendation] = useState(null); // Store the recommendation data

  // Send the user message and trigger recommendation process
  const sendMessage = async () => {
    if (!userInput.trim() || isLoading) return;
    setIsLoading(true);

    const newMessages = [...messages, { text: userInput, isUser: true }];
    setMessages(newMessages);
    setUserResponses([...userResponses, userInput]); // Store the response
    setUserInput(""); // Clear the input after sending
    setError(null); // Reset error state

    try {
      const response = await fetch(
        "http://localhost:5000/api/insurance/start-recommendation",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userResponse: userInput, questionCount: messages.length }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      // Check if recommendation is ready
      if (data.isComplete) {
        setIsRecommendationReady(true);
        setMessages([...newMessages, { text: "Recommendation process complete. Click to view.", isUser: false }]);
      } else {
        setMessages([...newMessages, { text: data.message, isUser: false }]);
      }
    } catch (error) {
      console.error("Error sending message:", error.message);
      setMessages([
        ...newMessages,
        { text: `Error: ${error.message}. Please try again.`, isUser: false },
      ]);
      setError(error.message);
    } finally {
      setIsLoading(false); // Reset loading state
    }
  };

  // Handle showing the recommendation after it's ready
  const handleViewRecommendation = async () => {
    setIsLoading(true);
    setError(null); // Reset error state
  
    try {
      const response = await fetch("http://localhost:5000/api/insurance/get-recommendation", {
        method: 'POST',  // Make sure to use POST to match the backend route
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ responses: userResponses }) // Send user responses
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const data = await response.json();
      
      // Log the recommendation data to check the structure
      console.log("Recommendation data received:", data);  // Log the received data
      
      // Check if recommendation and reasons are valid
      if (data && data.recommendation && Array.isArray(data.recommendation.reasons)) {
        setRecommendation(data.recommendation); // Set the recommendation state
        onRecommend(data.recommendation); // Pass it to the parent component
      } else {
        throw new Error("Invalid recommendation data or 'reasons' is not an array.");
      }
    } catch (error) {
      console.error("Error fetching recommendation:", error.message);
      setError("Failed to fetch recommendation. Please try again.");
    } finally {
      setIsLoading(false); // Reset loading state
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
      {error && <div className="error-message">{error}</div>} {/* Error message display */}
      
      {/* Display recommendation once it's available */}
      {recommendation && recommendation.policyName && (
        <div className="recommendation-container">
          <h2>{recommendation.policyName}</h2>
          <p>{recommendation.description}</p>
          <ul>
            {/* Ensure that reasons is always an array */}
            {Array.isArray(recommendation.reasons) && recommendation.reasons.length > 0 ? (
              recommendation.reasons.map((reason, index) => (
                <li key={index}>{reason}</li>
              ))
            ) : (
              <li>No reasons provided for the recommendation.</li>
            )}
          </ul>
        </div>
      )}

      <div className="input-container">
        {isRecommendationReady ? (
          <button
            onClick={handleViewRecommendation}
            className={`w-full py-2 rounded-md ${isLoading ? 'bg-gray-400' : 'bg-blue-600'} text-white hover:bg-blue-700`}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'View Recommendation'}
          </button>
        ) : (
          <>
            <textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Type your response here..."
            />
            <button
              onClick={sendMessage}
              disabled={isLoading}
              className={`w-full py-2 rounded-md ${isLoading ? 'bg-gray-400' : 'bg-blue-600'} text-white hover:bg-blue-700`}
            >
              {isLoading ? 'Sending...' : 'Submit'}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

// Prop Types for ChatApp
ChatApp.propTypes = {
  onRecommend: PropTypes.func.isRequired,
};

export default ChatApp;
