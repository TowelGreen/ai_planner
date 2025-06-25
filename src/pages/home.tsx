import React, { useRef, useState, useEffect } from "react";
import styles from "../styles/Home.module.css";

const Home: React.FC = () => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<
    { text: string; from: "user" | "bot" }[]
  >([]);
  const [isTyping, setIsTyping] = useState(false);

  const handleInput = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  const handleSend = () => {
    const text = textareaRef.current?.value.trim();
    if (!text) return;

    setMessages((prev) => [...prev, { text, from: "user" }]);
    textareaRef.current!.value = "";
    handleInput();

    // Fake bot response
    setIsTyping(true);
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { text, from: "user" },
        { text: "Thanks! I’ll find some ideas for you. 💡", from: "bot" },
      ]);
      setIsTyping(false);
    }, 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Auto-scroll to bottom
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  return (
    <div className={styles.chatContainer}>
      <div className={styles.messagesArea}>
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={
              msg.from === "user" ? styles.userBubble : styles.botBubble
            }
          >
            {msg.text}
          </div>
        ))}

        {isTyping && (
          <div className={styles.botBubble}>
            <span className={styles.typing}>...</span>
          </div>
        )}

        <div ref={scrollRef} />
      </div>

      <div className={styles.inputBar}>
        <div className={styles.inputWrapper}>
          <textarea
            ref={textareaRef}
            onInput={handleInput}
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
