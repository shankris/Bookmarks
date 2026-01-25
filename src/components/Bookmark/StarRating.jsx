"use client";

import { Star } from "lucide-react";
import styles from "./StarRating.module.css";

export default function StarRating({ value, onChange }) {
  return (
    <div className={styles.starGroup}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type='button'
          className={`${styles.star} ${star <= value ? styles.active : ""}`}
          onClick={() => onChange(star)}
          title={`${star} priority`}
          aria-label={`${star} star`}
        >
          <Star
            size={24}
            fill={star <= value ? "currentColor" : "none"}
          />
        </button>
      ))}
    </div>
  );
}
