import React from "react";
import BookmarkCard from "./BookmarkCard";
import DataTablePagination from "@/components/common/DataTablePagination";
import styles from "./BookmarkGrid.module.css";

export default function BookmarkGrid({ table, onVisit, onEdit, onView }) {
  const rows = table.getRowModel().rows; // includes pagination

  if (!rows.length) return <p>No bookmarks found!</p>;

  return (
    <>
      <div className={styles.grid}>
        {rows.map((row) => (
          <BookmarkCard
            key={row.id}
            bookmark={row.original}
            onVisit={onVisit}
            onEdit={onEdit}
            onView={onView}
          />
        ))}
      </div>

      <DataTablePagination table={table} />
    </>
  );
}
