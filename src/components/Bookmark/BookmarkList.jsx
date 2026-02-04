"use client";

import { useMemo, useState, useEffect } from "react";
import { getCoreRowModel, getSortedRowModel, getPaginationRowModel, useReactTable } from "@tanstack/react-table";
import { motion, AnimatePresence } from "framer-motion";

import { CirclePlus } from "lucide-react";
import { supabase } from "@/lib/supabase";
import TableSearch from "@/components/common/TableSearch";
import BookmarkExport from "@/components/Bookmark/BookmarkExport";
import BookmarkTableView from "@/components/Bookmark/BookmarkTableView";
import BookmarkColumns from "@/components/Bookmark/BookmarkColumns";
import VisitFormatter from "./VisitFormatter";
import { handleBookmarkVisit } from "./BookmarkActions";
import BookmarkGrid from "@/components/Bookmark/BookmarkGrid";
import ViewModeToggle from "@/components/common/ViewModeToggle";

import BookmarkModal from "./BookmarkModal";
import AddBookmarkForm from "./AddBookmarkForm";
import EditBookmarkForm from "./EditBookmarkForm";

import useOnlineStatus from "@/hooks/useOnlineStatus";
import OfflineBanner from "@/components/common/OfflineBanner";

import styles from "./BookmarkList.module.css";

export default function BookmarkList({ initialBookmarks = [] }) {
  const [sorting, setSorting] = useState([{ id: "next_visit_at", desc: false }]);

  // ✅ SSR-safe view mode
  const [viewMode, setViewMode] = useState("table");
  const [mounted, setMounted] = useState(false);

  const [editingBookmark, setEditingBookmark] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const { formatLastVisit, formatNextVisit } = VisitFormatter(currentTime);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bookmarks, setBookmarks] = useState(initialBookmarks);
  const [search, setSearch] = useState("");

  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  const isOnline = useOnlineStatus();

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  // ✅ Load saved view after mount
  useEffect(() => {
    const saved = localStorage.getItem("bookmarkViewMode");
    if (saved) setViewMode(saved);
    setMounted(true);
  }, []);

  // ✅ Save when changed (after mount)
  useEffect(() => {
    if (mounted) {
      localStorage.setItem("bookmarkViewMode", viewMode);
    }
  }, [viewMode, mounted]);

  // Change page size based on view
  useEffect(() => {
    setPagination({
      pageIndex: 0,
      pageSize: viewMode === "table" ? 10 : 20,
    });
  }, [viewMode]);

  const columns = BookmarkColumns({
    currentTime,
    handleVisit: (bookmark, e) => {
      e.preventDefault();
      e.stopPropagation();
      handleBookmarkVisit({ bookmark, setBookmarks });
    },
    setSearch,
    setEditingBookmark,
    formatLastVisit,
    formatNextVisit,
  });

  const filteredBookmarks = useMemo(() => {
    if (!search.trim()) return bookmarks;
    const term = search.toLowerCase();

    return bookmarks.filter((b) => b.title?.toLowerCase().includes(term) || b.url?.toLowerCase().includes(term) || b.category?.toLowerCase().includes(term) || b.sub_category?.toLowerCase().includes(term) || (b.tags || []).some((tag) => tag.toLowerCase().includes(term)));
  }, [search, bookmarks]);

  const table = useReactTable({
    data: filteredBookmarks,
    columns,
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <>
      <OfflineBanner isOnline={isOnline} />

      <div className={styles.header}>
        <div className={styles.leftControls}>
          <TableSearch
            value={search}
            onChange={setSearch}
          />
        </div>

        <div className={styles.rightControls}>
          <BookmarkExport data={filteredBookmarks} />

          {/* ✅ Prevent hydration mismatch */}
          {mounted && (
            <ViewModeToggle
              value={viewMode}
              onChange={setViewMode}
            />
          )}

          <button
            className={styles.addButton}
            onClick={() => setIsModalOpen(true)}
          >
            <CirclePlus
              size={24}
              strokeWidth={1}
              absoluteStrokeWidth
            />
            <span className={styles.addText}>Add Bookmark</span>
          </button>
        </div>
      </div>

      <AnimatePresence mode='wait'>
        {viewMode === "table" ? (
          <motion.div
            key='table'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          >
            <BookmarkTableView table={table} />
          </motion.div>
        ) : (
          <motion.div
            key='card'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          >
            <BookmarkGrid
              table={table}
              onVisit={(bookmark, e) => {
                e.preventDefault();
                e.stopPropagation();
                handleBookmarkVisit({ bookmark, setBookmarks });
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

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
              setBookmarks((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
            }}
          />
        )}
      </BookmarkModal>
    </>
  );
}
