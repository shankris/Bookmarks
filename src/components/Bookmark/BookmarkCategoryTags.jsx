"use client";

import styles from "./BookmarkCategoryTags.module.css";

export default function BookmarkCategoryTags({ category, sub_category, tags = [], onFilter }) {
  return (
    <div className={styles.categoryTagsCell}>
      {/* Category / Sub-category */}
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

      {/* Tags */}
      {tags.length > 0 && (
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
      )}
    </div>
  );
}
