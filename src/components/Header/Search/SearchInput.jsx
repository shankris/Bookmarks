"use client";

import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";

import "./search.theme.css";
import styles from "./searchInput.module.css";
import data from "./searchData.json";

export default function SearchInput() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const [isMac, setIsMac] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const inputRef = useRef(null);
  const wrapperRef = useRef(null);
  const dropdownRef = useRef(null);

  /* ================================
     Detect clicks outside
  ================================ */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!wrapperRef.current?.contains(e.target)) {
        setIsFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ================================
     Detect macOS
  ================================ */
  useEffect(() => {
    if (typeof window === "undefined") return;
    setIsMac(navigator.platform.toUpperCase().includes("MAC") || navigator.userAgent.includes("Mac"));
  }, []);

  /* ================================
     Keyboard shortcuts: focus & clear
  ================================ */
  useEffect(() => {
    const handleKeyDown = (e) => {
      const isMacPlatform = navigator.platform.toUpperCase().includes("MAC");

      // Focus search
      if ((!isMacPlatform && e.altKey && e.key.toLowerCase() === "d") || (isMacPlatform && e.metaKey && e.key.toLowerCase() === "d")) {
        e.preventDefault();
        inputRef.current?.focus();
      }

      // Clear search
      if (e.key === "Escape") {
        setQuery("");
        setHighlightedIndex(-1);
        inputRef.current?.blur();
      }

      // Arrow navigation
      if (isFocused && results.length > 0) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setHighlightedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        } else if (e.key === "Enter") {
          e.preventDefault();
          if (highlightedIndex >= 0 && highlightedIndex < results.length) {
            const selected = results[highlightedIndex];
            console.log("Selected:", selected);
            // TODO: Navigate to selected page
            setQuery(selected.title);
            setIsFocused(false);
            setHighlightedIndex(-1);
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFocused, results, highlightedIndex]);

  /* ================================
     Search filter (limit 30)
  ================================ */
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setHighlightedIndex(-1);
      return;
    }

    const filtered = data.filter((item) => item.title.toLowerCase().includes(query.toLowerCase())).slice(0, 30); // limit results

    setResults(filtered);
    setHighlightedIndex(-1);
  }, [query]);

  /* ================================
     Scroll dropdown to highlighted item
  ================================ */
  useEffect(() => {
    if (highlightedIndex < 0 || !dropdownRef.current) return;

    const list = dropdownRef.current;
    const item = list.children[highlightedIndex];

    if (item) {
      const itemTop = item.offsetTop;
      const itemBottom = itemTop + item.offsetHeight;
      const scrollTop = list.scrollTop;
      const listHeight = list.clientHeight;

      if (itemBottom > scrollTop + listHeight) {
        list.scrollTop = itemBottom - listHeight;
      } else if (itemTop < scrollTop) {
        list.scrollTop = itemTop;
      }
    }
  }, [highlightedIndex]);

  const handleClear = () => {
    setQuery("");
    inputRef.current?.focus();
    setHighlightedIndex(-1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    console.log("Search submitted:", query);
    // TODO: navigate to search results page with query
  };

  return (
    <div
      className={styles.searchWrapper}
      ref={wrapperRef}
      role='search'
    >
      <form
        className={styles.searchBar}
        onSubmit={handleSubmit}
      >
        <Search
          className={styles.searchIcon}
          aria-hidden='true'
          onClick={() => inputRef.current?.focus()}
        />

        <input
          ref={inputRef}
          type='text'
          className={styles.searchInput}
          placeholder='Search…'
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          aria-label='Search'
        />

        {/* Shortcut hint */}
        <kbd
          className={styles.shortcutHint}
          aria-hidden='true'
        >
          {isMac ? "⌘ D" : "Alt + D"}
        </kbd>

        {query && (
          <button
            type='button'
            className={styles.clearButton}
            onClick={handleClear}
            aria-label='Clear search'
          >
            <X size={16} />
          </button>
        )}

        <button
          type='submit'
          className={styles.goButton}
          disabled={!query.trim()}
        >
          Go
        </button>
      </form>

      {isFocused && results.length > 0 && (
        <div
          className={styles.dropdown}
          ref={dropdownRef}
        >
          {results.map((item, index) => (
            <div
              key={item.id}
              className={`${styles.resultItem} ${highlightedIndex === index ? styles.highlighted : ""}`}
            >
              <span className={styles.resultTitle}>{item.title}</span>
              <span className={styles.resultMeta}>{item.category}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
