"use client";

import styles from "./BookmarkModal.module.css";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function BookmarkModal({ isOpen, onClose, children }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={styles.overlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className={styles.modal}
            onClick={(e) => e.stopPropagation()}
            initial={{ x: "100%", opacity: 0 }} // start off-screen right
            animate={{ x: 0, opacity: 1 }} // slide in to center
            exit={{ x: "100%", opacity: 0 }} // slide out to right
            transition={{ type: "spring", stiffness: 300, damping: 30 }} // simple bounce
          >
            <button
              className={styles.close}
              onClick={onClose}
              aria-label='Close'
            >
              <X size={24} />
            </button>

            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
