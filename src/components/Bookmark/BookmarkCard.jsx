import React from "react";
import styles from "./BookmarkCard.module.css";
import { Pencil, Eye } from "lucide-react";

export default function BookmarkCard({ bookmark, onVisit, onEdit, onView }) {
  const handleVisit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onVisit) onVisit(bookmark, e);
    window.open(bookmark.url, "_blank", "noopener,noreferrer");
  };

  const stop = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const screenshotSrc = bookmark.screenshot_file ? `/screenshots/${bookmark.screenshot_file}` : "/screenshots/placeholder.png";

  let domain = "";
  try {
    if (bookmark.url) {
      domain = new URL(bookmark.url).hostname.replace(/^www\./, "");
    }
  } catch {}

  return (
    <div
      className={styles.card}
      onClick={handleVisit}
      role='button'
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && handleVisit(e)}
    >
      {/* 🔹 Top Right Actions */}
      <div className={styles.actions}>
        <button
          className={styles.iconBtn}
          onClick={(e) => {
            stop(e);
            onEdit?.(bookmark);
          }}
          aria-label='Edit bookmark'
        >
          <Pencil size={16} />
        </button>

        <button
          className={styles.iconBtn}
          onClick={(e) => {
            stop(e);
            onView?.(bookmark);
          }}
          aria-label='View details'
        >
          <Eye size={16} />
        </button>
      </div>

      {/* 🔹 Image (no link behavior now) */}
      <img
        src={screenshotSrc}
        alt={bookmark.title}
        className={styles.screenshot}
        loading='lazy'
        onError={(e) => (e.currentTarget.src = "/screenshots/placeholder.png")}
      />

      <div className={styles.content}>
        <div className={styles.titleWrapper}>
          {domain && (
            <img
              src={`https://www.google.com/s2/favicons?domain=${domain}`}
              alt=''
              className={styles.favicon}
              loading='lazy'
              width={18}
              height={18}
            />
          )}
          <span className={styles.cardTitle}>{bookmark.title}</span>
        </div>
      </div>
    </div>
  );
}
