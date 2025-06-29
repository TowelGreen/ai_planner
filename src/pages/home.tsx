import React, { useState, useEffect, useRef } from "react";
import styles from "../styles/Home.module.css";

interface Message {
  type: "user" | "bot";
  text: string;
}

const Home: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { type: "bot", text: "🤖 Hi! I’m your AI Date Planner." },
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-grow textarea height
  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = "auto";
      textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
    }
  }, [input]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages((prev) => [...prev, { type: "user", text: userMessage }]);
    setInput("");

    try {
      const res = await fetch("http://localhost:8000/api/plan-date", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await res.json();

      if (data.followUp) {
        setMessages((prev) => [...prev, { type: "bot", text: data.followUp }]);
      } else if (data.summary) {
        setMessages((prev) => [...prev, { type: "bot", text: data.summary }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { type: "bot", text: "Sorry, I couldn't find any recommendations." },
        ]);
      }
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        { type: "bot", text: "⚠️ Server error. Please try again later." },
      ]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={styles.homeWrapper}>
      <div className={styles.chatContainer}>
        <div className={styles.messagesArea}>
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={
                msg.type === "bot" ? styles.botBubble : styles.userBubble
              }
            >
              {msg.text}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className={styles.inputBar}>
        <div className={styles.inputWrapper}>
          <textarea
            ref={textAreaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything..."
            className={styles.inputBox}
            rows={1}
          />
          <button onClick={handleSend} className={styles.sendButton}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
