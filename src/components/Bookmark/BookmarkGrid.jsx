import React from "react";
import BookmarkCard from "./BookmarkCard";
import DataTablePagination from "@/components/common/DataTablePagination";
import styles from "./BookmarkGrid.module.css";

export default function BookmarkGrid({ table, onVisit }) {
  const rows = table.getRowModel().rows; // 🔥 THIS includes pagination

  if (!rows.length) return <p>No bookmarks found!</p>;

  return (
    <>
      <div className={styles.grid}>
        {rows.map((row) => (
          <BookmarkCard
            key={row.id}
            bookmark={row.original}
            onVisit={onVisit}
          />
        ))}
      </div>

      {/* Same pagination as table view */}
      <DataTablePagination table={table} />
    </>
  );
}
