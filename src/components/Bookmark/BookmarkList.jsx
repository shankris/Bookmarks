"use client";

import { flexRender, getCoreRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import { useMemo, useState, useEffect } from "react";
import { Plus, Star } from "lucide-react";
import { supabase } from "@/lib/supabase";
import TruncatedUrl from "@/components/common/TruncatedUrl";
import TableSearch from "@/components/common/TableSearch";

import BookmarkModal from "./BookmarkModal";
import AddBookmarkForm from "./AddBookmarkForm";
import BookmarkCategoryTags from "./BookmarkCategoryTags";

import useOnlineStatus from "@/hooks/useOnlineStatus";
import OfflineBanner from "@/components/common/OfflineBanner";

import styles from "./BookmarkList.module.css";

export default function BookmarkList({ initialBookmarks = [] }) {
  const [sorting, setSorting] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bookmarks, setBookmarks] = useState(initialBookmarks);
  const [search, setSearch] = useState("");

  const isOnline = useOnlineStatus();

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
    const totalMinutes = Math.floor(diffMs / (1000 * 60));

    if (totalMinutes < 1) return "Now";

    const days = Math.floor(totalMinutes / (60 * 24));

    // Months
    if (days >= 30) {
      const months = Math.floor(days / 30);
      return `${months}m ago`;
    }

    // Days
    if (days >= 1) return `${days}d ago`;

    // Hours
    const hours = Math.floor(totalMinutes / 60);
    if (hours >= 1) return `${hours}h ago`;

    return `${totalMinutes}m ago`;
  }

  function formatNextVisit(value) {
    if (!value) return "—";

    const today = new Date();
    const currentDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    const visitDate = new Date(value);
    const nextDate = new Date(visitDate.getFullYear(), visitDate.getMonth(), visitDate.getDate());

    const diffDays = Math.round((nextDate - currentDate) / 86400000);

    if (diffDays < 0) return "Due";
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";

    // Months
    if (diffDays >= 30) {
      const months = Math.floor(diffDays / 30);
      return `${months}m`;
    }

    return `${diffDays}d`;
  }

  /* ---------- visit handler ---------- */

  async function handleVisit(bookmark, e) {
    e.preventDefault();
    e.stopPropagation();

    const cycleDays = Number(bookmark.revisit_cycle_days) || 1;

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const nextVisit = new Date(startOfToday);
    nextVisit.setDate(startOfToday.getDate() + cycleDays);

    // Optimistic UI update
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

    try {
      // 1️⃣ Insert visit log
      const { error: visitError } = await supabase.from("bookmark_visits").insert([
        {
          bookmark_id: bookmark.id,
          visit_source: "bookmark-table",
          visited_at: now.toISOString(),
        },
      ]);

      if (visitError) throw visitError;

      // 2️⃣ Update bookmark
      const { error: updateError } = await supabase
        .from("bookmarks")
        .update({
          last_visit: now.toISOString(),
          total_visits: (bookmark.total_visits || 0) + 1,
          next_visit_at: nextVisit.toISOString(),
        })
        .eq("id", bookmark.id);

      if (updateError) throw updateError;

      console.log("✅ Supabase updated successfully");
    } catch (err) {
      console.error("❌ Supabase update failed:", err.message);
    }

    // Open AFTER db work starts
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
                <div className={styles.url}>
                  <TruncatedUrl url={bookmark.url} />
                </div>
              </div>
            </a>
          );
        },
      },
      // ---------- Category / Sub-category column ----------
      {
        accessorKey: "category",
        header: "Category / Sub-category",
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

      // ---------- Tags column ----------
      {
        accessorKey: "tags",
        header: "Tags",
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

      {
        accessorKey: "priority",
        header: "Rating",
        cell: ({ getValue }) => {
          const rating = Number(getValue()) || 0;

          if (rating === 0) return <span className={styles.noRating}>—</span>;

          return (
            <div className={styles.stars}>
              {Array.from({ length: rating }).map((_, i) => (
                <Star
                  key={i}
                  size={22}
                  className={styles.starFilled}
                  fill='currentColor'
                />
              ))}
            </div>
          );
        },
        meta: {
          cellClassName: styles.ratingCell,
        },
      },

      { accessorKey: "total_visits", header: "Visits" },
      {
        accessorKey: "last_visit",
        header: "Last Visit",
        cell: (info) => formatLastVisit(info.getValue()),
      },
      {
        accessorKey: "next_visit_at",
        header: "Next Visit",
        cell: (info) => {
          const val = info.getValue();
          if (!val) return "—";

          const today = new Date();
          const currentDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

          const visitDate = new Date(val);
          const nextDate = new Date(visitDate.getFullYear(), visitDate.getMonth(), visitDate.getDate());

          const diffDays = Math.round((nextDate - currentDate) / 86400000);

          let className = "";
          if (diffDays < 0)
            className = styles.overdue; // 🔥 RED
          else if (diffDays === 0)
            className = styles.today; // optional
          else if (diffDays === 1) className = styles.tomorrow;

          return <span className={className}>{formatNextVisit(val)}</span>;
        },
      },
    ],
    [currentTime],
  );

  const filteredBookmarks = useMemo(() => {
    if (!search.trim()) return initialBookmarks;

    const term = search.toLowerCase();

    return initialBookmarks.filter((b) => {
      return b.title?.toLowerCase().includes(term) || b.url?.toLowerCase().includes(term) || b.category?.toLowerCase().includes(term) || b.sub_category?.toLowerCase().includes(term) || (b.tags || []).some((tag) => tag.toLowerCase().includes(term));
    });
  }, [search, initialBookmarks]);

  const table = useReactTable({
    data: filteredBookmarks,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <>
      <OfflineBanner isOnline={isOnline} />

      <div className={styles.header}>
        <h1 className={styles.heading}>Bookmarks</h1>

        <button
          className={styles.addButton}
          onClick={() => setIsModalOpen(true)}
        >
          <Plus size={16} /> Add Bookmark
        </button>
      </div>

      <div className={styles.tableWrapper}>
        <div className={styles.headerRight}>
          <TableSearch
            value={search}
            onChange={setSearch}
          />
        </div>

        <table className={styles.table}>
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => (
                  <th
                    key={header.id}
                    className={styles.th}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className={styles.tr}
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className={`${styles.td} ${cell.column.columnDef.meta?.cellClassName || ""}`}
                    data-label={flexRender(cell.column.columnDef.header, cell.getContext())} // ✅ use column header
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <BookmarkModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      >
        <AddBookmarkForm onClose={() => setIsModalOpen(false)} />
      </BookmarkModal>
    </>
  );
}
