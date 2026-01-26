"use client";

import styles from "./OfflineBanner.module.css";

export default function OfflineBanner({ isOnline }) {
  if (isOnline) return null;

  return <div className={styles.banner}>⚠ You are offline. Changes may not be saved.</div>;
}
