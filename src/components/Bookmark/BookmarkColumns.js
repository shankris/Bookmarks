"use client";

import { useMemo } from "react";
import { Star, SquarePen } from "lucide-react";
import TruncatedUrl from "@/components/common/TruncatedUrl";
import styles from "./BookmarkList.module.css";

export default function BookmarkColumns({ currentTime, handleVisit, setSearch, setEditingBookmark, formatLastVisit, formatNextVisit }) {
  return useMemo(
    () => [
      // 🌐 WEBSITE
      {
        accessorKey: "title",
        header: "Website",
        enableSorting: true,
        cell: ({ row }) => {
          const bookmark = row.original;
          const domain = bookmark.url?.replace(/^https?:\/\//, "").replace(/\/$/, "");
          const faviconUrl = domain ? `https://www.google.com/s2/favicons?sz=64&domain_url=${domain}` : null;

          return (
            <a
              href={bookmark.url}
              target='_blank'
              rel='noopener noreferrer'
              className={styles.websiteCell}
              onClick={(e) => handleVisit(bookmark, e)}
            >
              {faviconUrl && (
                <img
                  src={faviconUrl}
                  alt=''
                  className={styles.favicon}
                />
              )}

              <div className={styles.websiteText}>
                <div className={styles.title}>{bookmark.title}</div>
                <div className={styles.url}>
                  <TruncatedUrl url={bookmark.url} />
                </div>
              </div>
            </a>
          );
        },
      },

      // 📂 CATEGORY
      {
        accessorKey: "category",
        header: "Category",
        enableSorting: true,
        cell: ({ row }) => {
          const bookmark = row.original;

          return (
            <div className={styles.categoryCell}>
              {bookmark.category && (
                <span
                  className={styles.categoryLink}
                  onClick={() => setSearch(bookmark.category)}
                >
                  {bookmark.category}
                </span>
              )}

              {bookmark.category && bookmark.sub_category && <span className={styles.separator}> / </span>}

              {bookmark.sub_category && (
                <span
                  className={styles.categoryLink}
                  onClick={() => setSearch(bookmark.sub_category)}
                >
                  {bookmark.sub_category}
                </span>
              )}
            </div>
          );
        },
      },

      // 🏷 TAGS
      {
        accessorKey: "tags",
        header: "Tags",
        enableSorting: false,
        cell: ({ getValue }) => {
          const tags = getValue() || [];
          return (
            <div className={styles.tagsCell}>
              {tags.map((tag, i) => (
                <span
                  key={i}
                  className={styles.tagLink}
                  onClick={() => setSearch(tag)}
                >
                  {tag}
                </span>
              ))}
            </div>
          );
        },
      },

      // ⭐ RATING
      {
        accessorKey: "priority",
        header: "Rating",
        cell: ({ getValue }) => {
          const rating = Number(getValue()) || 0;
          const MAX_STARS = 5;

          if (rating === 0) return <span className={styles.noRating}>—</span>;

          return (
            <div className={styles.stars}>
              {Array.from({ length: MAX_STARS }).map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  className={i < rating ? styles.starFilled : styles.starEmpty}
                />
              ))}
            </div>
          );
        },
        meta: { cellClassName: styles.ratingCell },
      },

      { accessorKey: "total_visits", header: "Visits" },

      // 🕒 LAST VISIT
      {
        accessorKey: "last_visit",
        header: "Last Visit",
        cell: (info) => formatLastVisit(info.getValue()),
      },

      // ⏭ NEXT VISIT
      {
        accessorKey: "next_visit_at",
        header: "Next Visit",

        sortingFn: (rowA, rowB) => {
          const a = rowA.original.next_visit_at ? new Date(rowA.original.next_visit_at).getTime() : Infinity;
          const b = rowB.original.next_visit_at ? new Date(rowB.original.next_visit_at).getTime() : Infinity;
          return a - b;
        },

        cell: (info) => {
          const val = info.getValue();
          if (!val) return "—";

          const today = new Date();
          const currentDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

          const visitDate = new Date(val);
          const nextDate = new Date(visitDate.getFullYear(), visitDate.getMonth(), visitDate.getDate());

          const diffDays = Math.round((nextDate - currentDate) / 86400000);

          let className = "";
          if (diffDays < 0) className = styles.overdue;
          else if (diffDays === 0) className = styles.today;
          else if (diffDays === 1) className = styles.tomorrow;

          return <span className={className}>{formatNextVisit(val)}</span>;
        },
      },

      // ✏️ EDIT
      {
        id: "edit",
        header: "",
        enableSorting: false,
        cell: ({ row }) => {
          const bookmark = row.original;

          return (
            <button
              className={styles.editBtn}
              onClick={(e) => {
                e.stopPropagation();
                setEditingBookmark(bookmark);
              }}
              title='Edit Bookmark'
            >
              <SquarePen
                size={16}
                className={styles.editIcon}
              />
            </button>
          );
        },
        meta: { cellClassName: styles.editCell },
      },
    ],
    [currentTime],
  );
}
