import React from "react";
import BookmarkCard from "./BookmarkCard";
import styles from "./BookmarkGrid.module.css";

export default function BookmarkGrid({ bookmarks }) {
  if (!bookmarks || bookmarks.length === 0) return <p>No bookmarks found!</p>;

  return (
    <div className={styles.grid}>
      {bookmarks.map((bm) => (
        <BookmarkCard
          key={bm.id}
          bookmark={bm}
        />
      ))}
    </div>
  );
}
