"use client";

import styles from "./BookmarkModal.module.css";
import { X } from "lucide-react";

export default function BookmarkModal({ isOpen, onClose, children }) {
  if (!isOpen) return null;

  return (
    <div
      className={styles.overlay}
      onClick={onClose}
    >
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className={styles.close}
          onClick={onClose}
          aria-label='Close'
        >
          <X size={24} />
        </button>

        {children}
      </div>
    </div>
  );
}
