"use client";

import { useState } from "react";
import styles from "./AddBookmarkForm.module.css";

export default function TagsInput({ value = [], onChange }) {
  const [input, setInput] = useState("");

  function addTag(tag) {
    const clean = tag.trim().toLowerCase();
    if (!clean) return;
    if (value.includes(clean)) return;

    onChange([...value, clean]);
  }

  function removeTag(tag) {
    onChange(value.filter((t) => t !== tag));
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(input);
      setInput("");
    }

    if (e.key === "Backspace" && !input && value.length) {
      removeTag(value[value.length - 1]);
    }
  }

  return (
    <div className={styles.tagsContainer}>
      {value.map((tag) => (
        <span
          key={tag}
          className={styles.tag}
        >
          {tag}
          <button
            type='button'
            onClick={() => removeTag(tag)}
            aria-label={`Remove ${tag}`}
          >
            ✕
          </button>
        </span>
      ))}

      <input
        className={styles.tagsInput}
        value={input}
        placeholder='Add tags…'
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
}
