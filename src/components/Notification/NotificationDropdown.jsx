"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import NotificationItem from "./NotificationItem";
import styles from "./notification.module.css";

export default function NotificationDropdown({
  notifications = [],
  onItemClick,
  onViewAll,
  onClose,
  triggerRef, // 👈 NEW
}) {
  const ref = useRef(null);

  /* ================================
     Close on ESC key
  ================================ */
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose?.();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  /* ================================
     Close on outside click
  ================================ */
  useEffect(() => {
    const onClickOutside = (e) => {
      const dropdown = ref.current;
      const trigger = triggerRef?.current;

      if (!dropdown) return;

      // Ignore clicks inside dropdown
      if (dropdown.contains(e.target)) return;

      // Ignore clicks on the bell button
      if (trigger && trigger.contains(e.target)) return;

      onClose?.();
    };

    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [onClose, triggerRef]);

  return (
    <motion.div
      ref={ref}
      className={styles.dropdown}
      initial={{ opacity: 0, y: -10, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.96 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      {/* ================================
         Header
      ================================ */}
      <div className={styles.header}>
        <span>Notifications</span>

        <button
          className={styles.closeBtn}
          onClick={onClose}
          aria-label='Close notifications'
        >
          <X size={20} />
        </button>
      </div>

      {/* ================================
         List
      ================================ */}
      <ul className={styles.list}>
        {notifications.length === 0 && <li className={styles.empty}>No notifications</li>}

        {notifications.map((item) => (
          <NotificationItem
            key={item.id}
            item={item}
            onClick={() => onItemClick?.(item)}
          />
        ))}
      </ul>

      {/* ================================
         Footer
      ================================ */}
      {onViewAll && (
        <div
          className={styles.footer}
          onClick={() => {
            onViewAll();
            onClose?.();
          }}
        >
          View All
        </div>
      )}
    </motion.div>
  );
}
