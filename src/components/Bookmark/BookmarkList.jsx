"use client";

import { flexRender, getCoreRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import { useMemo, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import styles from "./BookmarkList.module.css";

export default function BookmarkList({ initialBookmarks = [] }) {
  const [sorting, setSorting] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Real-time last visit update
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // every 1 minute
    return () => clearInterval(interval);
  }, []);

  // Handle visiting a link
  async function handleVisit(bookmark, e) {
    e.stopPropagation();

    await supabase
      .from("bookmarks")
      .update({
        last_visit: new Date().toISOString(),
        total_visits: (bookmark.total_visits || 0) + 1,
      })
      .eq("id", bookmark.id);

    window.open(bookmark.url, "_blank", "noopener,noreferrer");
  }

  // Helpers
  function formatUrlForDisplay(url) {
    if (!url) return "";
    return url.replace(/^https?:\/\//, "");
  }

  function formatDate(dateStr) {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function formatLastVisit(value) {
    if (!value) return "—";

    const now = currentTime;
    const then = new Date(value);
    const diffMs = now - then;

    const minutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (minutes < 1) return "Now";
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hr${hours > 1 ? "s" : ""} ago`;
    if (days < 30) return `${days} day${days > 1 ? "s" : ""} ago`;
    if (months < 12) return `${months} month${months > 1 ? "s" : ""} ago`;
    return `${years} year${years > 1 ? "s" : ""} ago`;
  }

  // Columns
  const columns = useMemo(
    () => [
      {
        accessorKey: "title",
        header: "Title",
        cell: ({ row }) => {
          const bookmark = row.original;
          const domain = bookmark.url ? bookmark.url.replace(/^https?:\/\//, "").split("/")[0] : "";
          const faviconUrl = `https://www.google.com/s2/favicons?sz=32&domain_url=${domain}`;

          return (
            <span style={{ display: "flex", alignItems: "center" }}>
              {domain && (
                <img
                  src={faviconUrl}
                  alt=''
                  style={{ width: 24, height: 24, marginRight: 6 }}
                />
              )}
              {bookmark.title}
            </span>
          );
        },
      },
      {
        accessorKey: "url",
        header: "URL",
        cell: ({ row }) => {
          const bookmark = row.original;
          const displayUrl = formatUrlForDisplay(bookmark.url);
          return (
            <button
              className={styles.link}
              onClick={(e) => handleVisit(bookmark, e)}
              title={bookmark.url}
            >
              {displayUrl}
            </button>
          );
        },
      },
      {
        id: "category_path",
        header: "Category",
        cell: ({ row }) => {
          const { category, sub_category, sub_sub_category } = row.original;
          return [category, sub_category, sub_sub_category].filter(Boolean).join(" / ");
        },
      },
      {
        accessorKey: "priority",
        header: "Priority",
        cell: (info) => info.getValue(),
        meta: { className: styles.numericCell },
      },
      {
        accessorKey: "total_visits",
        header: "Visits",
        cell: (info) => info.getValue() ?? 0,
        meta: { className: styles.numericCell },
      },
      {
        accessorKey: "saved_on",
        header: "Saved On",
        cell: (info) => formatDate(info.getValue()),
      },
      {
        accessorKey: "last_visit",
        header: "Last Visit",
        cell: (info) => formatLastVisit(info.getValue()),
      },
    ],
    [currentTime],
  );

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
                  className={`${styles.th} ${header.column.columnDef.meta?.className || ""}`}
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
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className={`${styles.td} ${cell.column.columnDef.meta?.className || ""}`}
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
