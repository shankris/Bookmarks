"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import styles from "./ThemeToggle.module.css";

export default function ThemeToggle() {
  const [theme, setTheme] = useState("light");

  // On mount, check localStorage or system preference
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved) {
      setTheme(saved);
      document.documentElement.dataset.theme = saved;
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const defaultTheme = prefersDark ? "dark" : "light";
      setTheme(defaultTheme);
      document.documentElement.dataset.theme = defaultTheme;
    }
  }, []);

  const toggleTheme = (event) => {
    const newTheme = theme === "dark" ? "light" : "dark";

    // Get button center coordinates
    const btn = event.currentTarget;
    const rect = btn.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    document.documentElement.style.setProperty("--vt-x", `${x}px`);
    document.documentElement.style.setProperty("--vt-y", `${y}px`);

    // Start view transition
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        document.documentElement.dataset.theme = newTheme;
      });
    } else {
      document.documentElement.dataset.theme = newTheme;
    }

    localStorage.setItem("theme", newTheme);
    setTheme(newTheme);
  };

  return (
    <button
      onClick={toggleTheme}
      className={styles.toggleBtn}
      aria-label='Toggle dark mode'
    >
      <Sun className={theme === "light" ? styles.active : styles.inactive} />
      <Moon className={theme === "dark" ? styles.active : styles.inactive} />
    </button>
  );
}
