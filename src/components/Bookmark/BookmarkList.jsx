"use client";

import { flexRender, getCoreRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import { useMemo, useState, useEffect } from "react";
import { Plus, Star } from "lucide-react";
import { supabase } from "@/lib/supabase";

import BookmarkModal from "./BookmarkModal";
import AddBookmarkForm from "./AddBookmarkForm";

import styles from "./BookmarkList.module.css";

export default function BookmarkList({ initialBookmarks = [] }) {
  const [sorting, setSorting] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bookmarks, setBookmarks] = useState(initialBookmarks);

  /* ---------- live "Last visit" refresh ---------- */
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  /* ---------- helpers ---------- */

  function formatLastVisit(value) {
    if (!value) return "—";

    const diffMs = currentTime - new Date(value);
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

  function formatNextVisitIn(nextVisitAt) {
    if (!nextVisitAt) return "—";

    const now = new Date();
    const target = new Date(nextVisitAt);

    const diffMs = target - now;
    if (diffMs <= 0) return "Due";

    const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (days < 30) return `${days}d`;

    return `${Math.ceil(days / 30)}m`;
  }

  /* ---------- visit handler ---------- */

  async function handleVisit(bookmark, e) {
    e.preventDefault();
    e.stopPropagation();

    const now = new Date();
    const nextVisit = new Date(now.getTime() + bookmark.revisit_cycle_days * 24 * 60 * 60 * 1000);

    // 1️⃣ Optimistic UI update
    setBookmarks((prev) =>
      prev.map((b) =>
        b.id === bookmark.id
          ? {
              ...b,
              last_visit: now.toISOString(),
              total_visits: (b.total_visits || 0) + 1,
              next_visit_at: nextVisit.toISOString(),
            }
          : b,
      ),
    );

    // 2️⃣ Background DB update
    supabase
      .from("bookmarks")
      .update({
        last_visit: now.toISOString(),
        total_visits: (bookmark.total_visits || 0) + 1,
        next_visit_at: nextVisit.toISOString(),
      })
      .eq("id", bookmark.id)
      .then(({ error }) => {
        if (error) console.error("Supabase sync failed", error);
      });

    // 3️⃣ Navigate
    window.open(bookmark.url, "_blank", "noopener,noreferrer");
  }

  /* ---------- table columns ---------- */

  const columns = useMemo(
    () => [
      {
        accessorKey: "title",
        header: "Website",
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
                <div className={styles.url}>{domain}</div>
              </div>
            </a>
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
        header: "Rating",
        cell: ({ getValue }) => {
          const rating = getValue() || 0;

          return (
            <div className={styles.stars}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={22}
                  className={i < rating ? styles.starFilled : styles.starEmpty}
                  fill={i < rating ? "currentColor" : "none"}
                />
              ))}
            </div>
          );
        },
        meta: { className: styles.numericCell },
      },
      {
        accessorKey: "total_visits",
        header: "Visits",
        meta: { className: styles.numericCell },
      },
      {
        accessorKey: "last_visit",
        header: "Last Visit",
        cell: (info) => formatLastVisit(info.getValue()),
      },
      {
        accessorKey: "next_visit_at",
        header: "Revisit in",
        cell: ({ getValue }) => {
          const nextVisit = getValue();
          if (!nextVisit) return "—";

          const today = new Date();
          const target = new Date(nextVisit);

          // Normalize both to start of day
          today.setHours(0, 0, 0, 0);
          target.setHours(0, 0, 0, 0);

          const diffDays = Math.round((target - today) / (1000 * 60 * 60 * 24));

          if (diffDays <= 0) return "Due";
          if (diffDays < 30) return `${diffDays}d`;

          return `${Math.ceil(diffDays / 30)}m`;
        },
        meta: { className: styles.numericCell },
      },
    ],
    [currentTime],
  );

  const table = useReactTable({
    data: bookmarks,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  /* ---------- render ---------- */

  return (
    <>
      <div className={styles.header}>
        <h1 className={styles.heading}>Bookmarks</h1>

        <button
          className={styles.addButton}
          onClick={() => setIsModalOpen(true)}
        >
          <Plus size={16} />
          Add Bookmark
        </button>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => (
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

      <BookmarkModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      >
        <AddBookmarkForm />
      </BookmarkModal>
    </>
  );
}
