// src/components/bookmarks/BookmarkCard.jsx
import React from "react";
import styles from "./BookmarkCard.module.css";

export default function BookmarkCard({ bookmark }) {
  const domain = bookmark.url?.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const hash = bookmark.id?.slice(0, 3); // or match your screenshot hash
  const screenshotFile = `/screenshots/${domain}-${hash}.png`;

  return (
    <div className={styles.card}>
      <img
        src={screenshotFile}
        alt={bookmark.title}
        className={styles.screenshot}
        onError={(e) => {
          e.currentTarget.src = "/placeholder.png";
        }}
      />
      <div className={styles.info}>
        <a
          href={bookmark.url}
          target='_blank'
          rel='noopener noreferrer'
          className={styles.title}
        >
          {bookmark.title}
        </a>
        <div className={styles.url}>{bookmark.url}</div>
        <div className={styles.tags}>
          {(bookmark.tags || []).map((tag) => (
            <span
              key={tag}
              className={styles.tag}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
