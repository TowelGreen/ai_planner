import React from "react";
import { Link } from "react-router-dom";
import styles from "../styles/Home.module.css";

const Home: React.FC = () => {
  return (
    <div className="home-container">
      {/* Chat area */}
      <div className="chat-window">
        <div className="chat-header">
          <div className="chat-emoji">🤖</div>
          <h1 className="chat-title">✨ AI Date Planner ✨</h1>
          <p className="chat-subtitle">
            Your personal assistant for planning perfect dates.
          </p>

          <div className="button-group">
            <Link to="/general">
              <button className="nav-button primary">Geneeeral Planner</button>
            </Link>
            <Link to="/local">
              <button className="nav-button secondary">Local Planner</button>
            </Link>
          </div>
        </div>

        {/* Sample conversation */}
        <div className="chat-message bot">
          Hi! I can help you plan your next perfect date.
        </div>
        <div className="chat-message user">
          Show me local dinner spots in LA.
        </div>
      </div>

      {/* Input bar */}
      <div className={styles.inputBar}>
        <input
          type="text"
          placeholder="Ask me anything..."
          className={styles.inputBox}
        />
        <button className={styles.sendButton}>Send</button>
      </div>
    </div>
  );
};

export default Home;
