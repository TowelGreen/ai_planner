import React, { useEffect, useState } from "react";
import styles from "../styles/History.module.css";

interface Message {
  type: "user" | "bot";
  text: string;
  businesses?: Business[];
}

interface Business {
  name: string;
  category: string;
  address: string;
  rating: number | string;
  image_url: string;
  url: string;
}

interface HistoryItem {
  timestamp: string;
  messages: Message[];
}

const HistoryPage: React.FC = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("datePlannerHistory");
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  }, []);

  const handleClearHistory = () => {
    if (confirm("Delete all saved conversations?")) {
      localStorage.removeItem("datePlannerHistory");
      setHistory([]);
    }
  };

  return (
    <div className={styles.historyWrapper}>
      <h1>Past Conversations</h1>

      <div className={styles.actions}>
        <button className={styles.clearButton} onClick={handleClearHistory}>
          🗑️ Clear All History
        </button>
      </div>

      {history.length === 0 && <p>No saved conversations yet.</p>}

      {history.map((item, idx) => (
        <div key={idx} className={styles.historyItem}>
          <div className={styles.timestamp}>
            {new Date(item.timestamp).toLocaleString()}
          </div>
          <div className={styles.messages}>
            {item.messages.map((msg, mIdx) => (
              <div
                key={mIdx}
                className={
                  msg.type === "bot" ? styles.botBubble : styles.userBubble
                }
              >
                {msg.text}
                {msg.businesses && (
                  <ul className={styles.businessList}>
                    {msg.businesses.map((b) => (
                      <li key={b.url}>
                        <a
                          href={b.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {b.name} ({b.category})
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default HistoryPage;
