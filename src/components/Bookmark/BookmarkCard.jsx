// src/components/bookmarks/BookmarkCard.jsx
import React from "react";
import styles from "./BookmarkCard.module.css";

export default function BookmarkCard({ bookmark, onVisit }) {
  const handleVisit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onVisit) onVisit(bookmark, e);
    window.open(bookmark.url, "_blank", "noopener,noreferrer");
  };

  const screenshotSrc = bookmark.screenshot_file ? `/screenshots/${bookmark.screenshot_file}` : "/screenshots/placeholder.png";

  // ✅ Safe domain extraction
  let domain = "";
  try {
    if (bookmark.url) {
      domain = new URL(bookmark.url).hostname.replace(/^www\./, "");
    }
  } catch {
    domain = "";
  }

  return (
    <div
      className={styles.card}
      onClick={handleVisit}
      role='button'
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && handleVisit(e)}
    >
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

          {/* ❌ No link here anymore */}
          <span className={styles.cardTitle}>{bookmark.title}</span>
        </div>
      </div>
    </div>
  );
}
