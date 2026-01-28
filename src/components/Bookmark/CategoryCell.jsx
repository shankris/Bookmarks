"use client";
import styles from "./CategoryCell.module.css";

export default function CategoryCell({ category, sub_category, onFilter }) {
  if (!category && !sub_category) return null;

  return (
    <div className={styles.categoryCell}>
      {category && (
        <span
          className={styles.categoryLink}
          onClick={() => onFilter(category)}
        >
          {category}
        </span>
      )}
      {category && sub_category && <span className={styles.separator}> / </span>}
      {sub_category && (
        <span
          className={styles.categoryLink}
          onClick={() => onFilter(sub_category)}
        >
          {sub_category}
        </span>
      )}
    </div>
  );
}
