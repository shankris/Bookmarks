"use client";

import { flexRender, getCoreRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import styles from "./BookmarkList.module.css";

export default function BookmarkList({ initialBookmarks = [] }) {
  const [sorting, setSorting] = useState([]);
  const [expandedRowId, setExpandedRowId] = useState(null);

  async function handleVisit(bookmark, e) {
    // Prevent row click
    e.stopPropagation();

    // Update visit stats
    await supabase
      .from("bookmarks")
      .update({
        last_visit: new Date().toISOString(),
        total_visits: (bookmark.total_visits || 0) + 1,
      })
      .eq("id", bookmark.id);

    // Open link
    window.open(bookmark.url, "_blank", "noopener,noreferrer");
  }

  function formatUrlForDisplay(url) {
    if (!url) return "";
    return url.replace(/^https?:\/\//, "");
  }

  const columns = useMemo(
    () => [
      {
        accessorKey: "title",
        header: "Title",
      },
      {
        accessorKey: "url",
        header: "URL",
        cell: ({ row }) => {
          const bookmark = row.original;

          return (
            <button
              className={styles.link}
              onClick={(e) => handleVisit(bookmark, e)}
              title={bookmark.url} // optional tooltip
            >
              {formatUrlForDisplay(bookmark.url)}
            </button>
          );
        },
      },

      {
        id: "category_path",
        header: "Category",
        cell: ({ row }) => {
          const { category, sub_category, sub_sub_category } = row.original;

          const parts = [category, sub_category, sub_sub_category].filter(Boolean);

          return (
            <span className={styles.breadcrumb}>
              {parts.map((part, index) => (
                <span key={index}>
                  {part}
                  {index < parts.length - 1 && <span className={styles.separator}> / </span>}
                </span>
              ))}
            </span>
          );
        },
      },
      {
        accessorKey: "priority",
        header: "Priority",
      },
      {
        accessorKey: "total_visits",
        header: "Visits",
        cell: (info) => info.getValue() ?? 0,
      },
      {
        accessorKey: "saved_on",
        header: "Saved On",
        cell: (info) => {
          const value = info.getValue();
          if (!value) return "-";

          return new Date(value).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          });
        },
      },
      {
        accessorKey: "last_visit",
        header: "Last Visit",
        cell: (info) => {
          const value = info.getValue();
          if (!value) return "—";

          const now = new Date();
          const then = new Date(value);
          const diffMs = now - then;

          const minutes = Math.floor(diffMs / (1000 * 60));
          const hours = Math.floor(diffMs / (1000 * 60 * 60));
          const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

          if (minutes < 60) return `${minutes}m ago`;
          if (hours < 24) return `${hours}h ago`;
          return `${days}d ago`;
        },
      },
    ],
    [],
  );

  async function handleVisit(bookmark, e) {
    e.stopPropagation();

    const { error } = await supabase
      .from("bookmarks")
      .update({
        last_visit: new Date().toISOString(),
        total_visits: (bookmark.total_visits || 0) + 1,
      })
      .eq("id", bookmark.id);

    if (error) {
      console.error("Visit update failed:", error);
      return;
    }

    window.open(bookmark.url, "_blank", "noopener,noreferrer");
  }

  const table = useReactTable({
    data: initialBookmarks,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  onClick={header.column.getToggleSortingHandler()}
                  className={styles.th}
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                  {{
                    asc: " ▲",
                    desc: " ▼",
                  }[header.column.getIsSorted()] ?? null}
                </th>
              ))}
            </tr>
          ))}
        </thead>

        <tbody>
          {table.getRowModel().rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className={styles.empty}
              >
                No bookmarks found
              </td>
            </tr>
          ) : (
            table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className={styles.tr}
                onClick={() => {
                  // Later → open slide-in details panel
                  console.log("Selected bookmark:", row.original);
                }}
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className={styles.td}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
