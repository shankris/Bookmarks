"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./CommandPalette.module.css";
import { COMMANDS } from "./commands";

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  /* ================================
     Keyboard Shortcuts
  ================================ */
  useEffect(() => {
    const onKeyDown = (e) => {
      const isMac = navigator.platform.toUpperCase().includes("MAC");

      const isCmdPalette = e.shiftKey && e.key.toLowerCase() === "p" && (isMac ? e.metaKey : e.ctrlKey);

      if (isCmdPalette) {
        e.preventDefault();
        setOpen((v) => !v);
      }

      if (e.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  /* ================================
     Auto Focus
  ================================ */
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 0);
      setQuery("");
      setActiveIndex(0);
    }
  }, [open]);

  /* ================================
     Filter Results
  ================================ */
  const results = COMMANDS.filter((cmd) => cmd.label.toLowerCase().includes(query.toLowerCase())).slice(0, 30);

  /* ================================
     Arrow Navigation
  ================================ */
  const onKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    }

    if (e.key === "Enter") {
      results[activeIndex]?.action();
      setOpen(false);
    }
  };

  /* ================================
     Scroll Into View
  ================================ */
  useEffect(() => {
    const item = listRef.current?.children[activeIndex];
    item?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  if (!open) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.palette}>
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder='Type a command...'
          className={styles.input}
        />

        <ul
          className={styles.list}
          ref={listRef}
        >
          {results.length === 0 && <li className={styles.empty}>No results</li>}

          {results.map((cmd, i) => (
            <li
              key={cmd.id}
              className={`${styles.item} ${i === activeIndex ? styles.active : ""}`}
            >
              <span>{cmd.label}</span>
              {cmd.shortcut && <kbd className={styles.kbd}>{cmd.shortcut}</kbd>}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
