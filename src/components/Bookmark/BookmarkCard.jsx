"use client";

import styles from "./BookmarkCard.module.css";

export default function BookmarkCard({ bookmark, onEdit, onDelete }) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>{bookmark.title}</h3>
        <div className={styles.actions}>
          <button onClick={() => onEdit(bookmark)}>Edit</button>
          <button onClick={() => onDelete(bookmark.id)}>Delete</button>
        </div>
      </div>

      <a
        href={bookmark.url}
        target='_blank'
        rel='noopener noreferrer'
        className={styles.url}
      >
        {bookmark.url}
      </a>

      {bookmark.notes && <p className={styles.notes}>{bookmark.notes}</p>}

      <div className={styles.meta}>
        {bookmark.category && <span>{bookmark.category}</span>}
        {bookmark.sub_category && <span>{bookmark.sub_category}</span>}
        {bookmark.sub_sub_category && <span>{bookmark.sub_sub_category}</span>}
        {bookmark.is_pinned && <span>📌 Pinned</span>}
      </div>
    </div>
  );
}
