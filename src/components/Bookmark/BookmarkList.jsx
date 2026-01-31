"use client";

import { useMemo, useState, useEffect } from "react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel, // ⭐ ADD THIS
  useReactTable,
} from "@tanstack/react-table";

import { Plus, Star, ChevronUp, ChevronDown, SquarePen } from "lucide-react";
import { supabase } from "@/lib/supabase";
import TruncatedUrl from "@/components/common/TruncatedUrl";
import TableSearch from "@/components/common/TableSearch";
import DataTablePagination from "@/components/common/DataTablePagination";

import BookmarkModal from "./BookmarkModal";
import AddBookmarkForm from "./AddBookmarkForm";
import BookmarkCategoryTags from "./BookmarkCategoryTags";
import EditBookmarkForm from "./EditBookmarkForm";

import useOnlineStatus from "@/hooks/useOnlineStatus";
import OfflineBanner from "@/components/common/OfflineBanner";

import styles from "./BookmarkList.module.css";

export default function BookmarkList({ initialBookmarks = [] }) {
  const [sorting, setSorting] = useState([
    {
      id: "next_visit_at",
      desc: false, // false = ascending = oldest date first = most due first ✅
    },
  ]);

  const [editingBookmark, setEditingBookmark] = useState(null); // ⭐ holds row being edited
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bookmarks, setBookmarks] = useState(initialBookmarks);
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

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
      // ---------- Category / Sub-category column ----------
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

      // ---------- Tags column ----------
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
      {
        id: "edit",
        header: "", // no header label
        enableSorting: false,
        cell: ({ row }) => {
          const bookmark = row.original;

          return (
            <button
              className={styles.editBtn}
              onClick={(e) => {
                e.stopPropagation();
                setEditingBookmark(bookmark); // ⭐ opens panel
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
        meta: {
          cellClassName: styles.editCell,
        },
      },
    ],
    [currentTime],
  );

  const filteredBookmarks = useMemo(() => {
    if (!search.trim()) return bookmarks; // ✅ use state, not initialBookmarks

    const term = search.toLowerCase();

    return bookmarks.filter((b) => {
      return b.title?.toLowerCase().includes(term) || b.url?.toLowerCase().includes(term) || b.category?.toLowerCase().includes(term) || b.sub_category?.toLowerCase().includes(term) || (b.tags || []).some((tag) => tag.toLowerCase().includes(term));
    });
  }, [search, bookmarks]); // ✅ dependency updated

  const table = useReactTable({
    data: filteredBookmarks,
    columns,

    state: { sorting, pagination }, // ⭐ include pagination
    onSortingChange: setSorting,
    onPaginationChange: setPagination, // ⭐ required

    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(), // ⭐ THIS ACTIVATES PAGINATION
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
                {hg.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const sortState = header.column.getIsSorted(); // false | 'asc' | 'desc'

                  return (
                    <th
                      key={header.id}
                      className={`${styles.th} ${canSort ? styles.sortable : ""}`}
                      onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                    >
                      <div className={styles.thContent}>
                        <span className={styles.headerText}>{flexRender(header.column.columnDef.header, header.getContext())}</span>

                        {sortState === "asc" && (
                          <ChevronUp
                            size={16}
                            className={styles.sortIcon}
                          />
                        )}
                        {sortState === "desc" && (
                          <ChevronDown
                            size={16}
                            className={styles.sortIcon}
                          />
                        )}
                      </div>
                    </th>
                  );
                })}
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

      <DataTablePagination table={table} />

      <BookmarkModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      >
        <AddBookmarkForm onClose={() => setIsModalOpen(false)} />
      </BookmarkModal>

      <BookmarkModal
        isOpen={!!editingBookmark}
        onClose={() => setEditingBookmark(null)}
      >
        {editingBookmark && (
          <EditBookmarkForm
            bookmark={editingBookmark}
            onClose={() => setEditingBookmark(null)}
            onSave={(updated) => {
              // update table instantly
              setBookmarks((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
            }}
          />
        )}
      </BookmarkModal>
    </>
  );
}
