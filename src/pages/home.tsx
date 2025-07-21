import React, { useState, useEffect, useRef } from "react";
import styles from "../styles/Home.module.css"; // Using CSS Modules for styling

// --- A list of predefined date ideas ---
const dateSuggestions = [
  "Coffee date ☕️",
  "A walk in the park 🌳",
  "Go bowling 🎳",
  "Visit a museum 🏛️",
  "Dinner and a movie 🎬",
  "Go for a hike ⛰️",
  "Try a new restaurant 🍜",
  "Picnic in the park 🧺",
];

// --- Interfaces for Type Safety ---
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
interface FollowUpResponse {
  followUp: string;
  knownTerm: string;
  knownLocation: string;
}
interface BusinessResponse {
  businesses: Business[];
  knownTerm: string;
  knownLocation: string;
}

// --- The Home Component (Chat Interface) ---
const Home: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [knownTerm, setKnownTerm] = useState("");
  const [knownLocation, setKnownLocation] = useState("");
  const [lastResults, setLastResults] = useState<Business[]>([]); // 🆕 Store last Yelp results
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  // --- Function to reset the chat state ---
  const startNewChat = () => {
    // Clear data from browser memory
    localStorage.removeItem("datePlannerMessages");
    localStorage.removeItem("datePlannerKnownTerm");
    localStorage.removeItem("datePlannerKnownLocation");
    localStorage.removeItem("datePlannerLastResults"); // 🆕 Clear saved last results

    // Reset component state
    setMessages([
      {
        type: "bot",
        text: "Hi! I’m your AI Date Planner. What kind of date are you thinking of?",
      },
    ]);
    setKnownTerm("");
    setKnownLocation("");
    setLastResults([]); // 🆕 reset last results
    setInput("");
  };

  // --- FEATURE: Event listener for the "New Chat" button ---
  useEffect(() => {
    window.addEventListener("new-chat", startNewChat);

    // Cleanup the event listener when the component unmounts
    return () => {
      window.removeEventListener("new-chat", startNewChat);
    };
  }, []); // Empty dependency array ensures this runs only once

  // Load state from localStorage on initial render
  useEffect(() => {
    try {
      const savedMessages = localStorage.getItem("datePlannerMessages");
      const savedKnownTerm = localStorage.getItem("datePlannerKnownTerm");
      const savedKnownLocation = localStorage.getItem(
        "datePlannerKnownLocation"
      );
      const savedLastResults = localStorage.getItem("datePlannerLastResults"); // 🆕 load last results

      if (savedMessages) {
        setMessages(JSON.parse(savedMessages));
      } else {
        setMessages([
          {
            type: "bot",
            text: "Hi! I’m your AI Date Planner. What kind of date are you thinking of?",
          },
        ]);
      }
      if (savedKnownTerm) setKnownTerm(savedKnownTerm);
      if (savedKnownLocation) setKnownLocation(savedKnownLocation);
      if (savedLastResults) setLastResults(JSON.parse(savedLastResults)); // 🆕 restore last results

      const shuffled = [...dateSuggestions].sort(() => 0.5 - Math.random());
      setSuggestions(shuffled.slice(0, 4));
    } catch (error) {
      console.error("Failed to load state from localStorage:", error);
    }
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    try {
      // Avoid saving the initial message array to prevent overwriting a cleared chat
      if (
        messages.length > 1 ||
        (messages.length === 1 && messages[0].type !== "bot")
      ) {
        localStorage.setItem("datePlannerMessages", JSON.stringify(messages));
      }
      localStorage.setItem("datePlannerKnownTerm", knownTerm);
      localStorage.setItem("datePlannerKnownLocation", knownLocation);
      localStorage.setItem(
        "datePlannerLastResults",
        JSON.stringify(lastResults)
      ); // 🆕 save last results
    } catch (error) {
      console.error("Failed to save state to localStorage:", error);
    }
  }, [messages, knownTerm, knownLocation, lastResults]);

  // Auto-scroll and auto-resize hooks
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = "auto";
      textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
    }
  }, [input]);

  const handleSend = async (messageText: string) => {
    if (!messageText.trim()) return;
    const userMessage = { type: "user" as const, text: messageText.trim() };

    const newMessagesWithUser = [...messages, userMessage];
    setMessages(newMessagesWithUser);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:8000/api/plan-date", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.text,
          known_term: knownTerm,
          known_location: knownLocation,
          last_results: lastResults, // 🆕 pass previous Yelp results here
        }),
      });
      const data: FollowUpResponse | BusinessResponse = await res.json();

      setKnownTerm(data.knownTerm || "");
      setKnownLocation(data.knownLocation || "");

      if (
        "followUp" in data ||
        ("businesses" in data && data.businesses.length > 0)
      ) {
        const botResponse: Message = {
          type: "bot",
          text:
            "followUp" in data
              ? data.followUp
              : "Here are some options you might like:",
          businesses: "businesses" in data ? data.businesses : [],
        };

        const finalMessages = [...newMessagesWithUser, botResponse];
        setMessages(finalMessages);

        // ✅ Only set last results if we have valid businesses
        if (botResponse.businesses?.length) {
          setLastResults(botResponse.businesses);
        }

        // ✅ Save to local history
        const historyItem = {
          timestamp: new Date().toISOString(),
          messages: finalMessages,
        };
        const oldHistory = JSON.parse(
          localStorage.getItem("datePlannerHistory") || "[]"
        );
        localStorage.setItem(
          "datePlannerHistory",
          JSON.stringify([...oldHistory, historyItem])
        );
      } else {
        setMessages((prev) => [
          ...prev,
          {
            type: "bot",
            text: "Sorry, I couldn't find any recommendations for that. Let's try something else.",
          },
        ]);
      }
    } catch (error) {
      console.error("API call failed:", error);
      setMessages((prev) => [
        ...prev,
        {
          type: "bot",
          text: "⚠️ Server error. Please make sure the backend is running and try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(input);
    }
  };

  const termList = React.useMemo(
    () => knownTerm.split(",").filter((t) => t.trim() !== ""),
    [knownTerm]
  );

  return (
    <div className={styles.chatInterfaceWrapper}>
      <div className={styles.messagesArea}>
        {messages.map((msg, idx) => (
          <div key={idx}>
            <div
              className={
                msg.type === "bot" ? styles.botBubble : styles.userBubble
              }
            >
              {msg.text}
            </div>
            {msg.businesses && msg.businesses.length > 0 && (
              <div className={styles.businessCards}>
                {msg.businesses.map((biz) => (
                  <a
                    key={biz.url}
                    href={biz.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.businessCard}
                  >
                    <img
                      src={
                        biz.image_url ||
                        "https://placehold.co/600x400/EEE/31343C?text=No+Image"
                      }
                      alt={biz.name}
                      className={styles.businessImage}
                    />
                    <div className={styles.businessInfo}>
                      <strong className={styles.businessName}>
                        {biz.name}
                      </strong>
                      <div className={styles.businessMeta}>
                        ⭐ {biz.rating} &bull; {biz.category}
                      </div>
                      <div className={styles.businessAddress}>
                        {biz.address}
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className={styles.botBubble}>
            <em>Typing...</em>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className={styles.inputBar}>
        {termList.length === 0 && !isLoading && (
          <div className={styles.suggestionContainer}>
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => handleSend(s)}
                className={styles.suggestionButton}
              >
                {s}
              </button>
            ))}
          </div>
        )}
        {termList.length > 0 && (
          <div className={styles.termTagsContainer}>
            {termList.map((term) => (
              <div key={term} className={styles.termTag}>
                {term}
              </div>
            ))}
          </div>
        )}
        <div className={styles.inputWrapper}>
          <textarea
            ref={textAreaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Tell me about your ideal date..."
            className={styles.inputBox}
            rows={1}
            disabled={isLoading}
          />
          <button
            onClick={() => handleSend(input)}
            className={styles.sendButton}
            disabled={isLoading || !input.trim()}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
