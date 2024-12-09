import { useState } from "react";
import "./App.css";
import ChatApp from "./components/ChatApp";
import InsuranceRecommendation from "./components/InsureRec";

const App = () => {
  const [recommendation, setRecommendation] = useState(null);

  const handleRecommendation = (data) => {
    setRecommendation(data);
  };

  const restartApp = () => {
    setRecommendation(null);
  };

  return (
    <div className="app-container">
      {recommendation ? (
        <InsuranceRecommendation recommendation={recommendation} onRestart={restartApp} />
      ) : (
        <ChatApp onRecommend={handleRecommendation} />
      )}
    </div>
  );
};

export default App;
