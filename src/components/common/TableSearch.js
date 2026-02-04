import { useEffect, useRef, useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import styles from "./TableSearch.module.css";

export default function TableSearch({ value, onChange }) {
  const inputRef = useRef(null);
  const [focused, setFocused] = useState(false);

  const { isAppleMobile, isMacDesktop } = useMemo(() => {
    if (typeof navigator === "undefined") {
      return { isAppleMobile: false, isMacDesktop: false };
    }

    const ua = navigator.userAgent;
    const isIOS = /iPhone|iPad|iPod/.test(ua);
    const isMacLike = /Macintosh/.test(ua);
    const hasTouch = navigator.maxTouchPoints > 1;

    return {
      isAppleMobile: isIOS || (isMacLike && hasTouch),
      isMacDesktop: isMacLike && !hasTouch,
    };
  }, []);

  const shortcutHint = isAppleMobile ? "" : isMacDesktop ? "⌘ J" : "Ctrl + J";

  useEffect(() => {
    function handleKeyDown(e) {
      if (isAppleMobile) return;

      const activeTag = document.activeElement?.tagName;
      const typingInField = activeTag === "INPUT" || activeTag === "TEXTAREA";

      if (typingInField) return;

      const isJ = e.key.toLowerCase() === "j";
      const modifierPressed = isMacDesktop ? e.metaKey : e.ctrlKey;

      if (modifierPressed && isJ) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMacDesktop, isAppleMobile]);

  return (
    <div className={styles.wrapper}>
      <Search
        size={20}
        className={styles.iconLeft}
      />

      <input
        ref={inputRef}
        type='text'
        placeholder='Search bookmarks ...'
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={styles.input}
      />

      {/* Shortcut badge */}
      {!value && !focused && shortcutHint && <span className={styles.shortcut}>{shortcutHint}</span>}

      {value && (
        <X
          size={20}
          className={styles.iconRight}
          onClick={() => onChange("")}
        />
      )}
    </div>
  );
}
