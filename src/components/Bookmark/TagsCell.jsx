"use client";
import styles from "./TagsCell.module.css";

export default function TagsCell({ tags = [], onFilter }) {
  if (!tags.length) return null;

  return (
    <div className={styles.tagsCell}>
      {tags.map((tag, i) => (
        <span
          key={i}
          className={styles.tagLink}
          onClick={() => onFilter(tag)}
        >
          {tag}
        </span>
      ))}
    </div>
  );
}
