"use client";

import { motion } from "framer-motion";
import styles from "./ViewModeToggle.module.css";

export default function ViewModeToggle({ value, onChange }) {
  return (
    <div className={styles.group}>
      {["table", "card"].map((mode) => (
        <button
          key={mode}
          className={`${styles.link} ${value === mode ? styles.active : ""}`}
          onClick={() => onChange(mode)}
        >
          {value === mode && (
            <motion.div
              layoutId='viewTogglePill'
              className={styles.pill}
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 35,
              }}
            />
          )}
          <span>{mode === "table" ? "Table" : "Card"}</span>
        </button>
      ))}
    </div>
  );
}
