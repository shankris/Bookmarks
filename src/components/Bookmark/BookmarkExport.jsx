"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import styles from "./BookmarkExport.module.css";
import { FileBraces, Sheet, NotepadText, ChevronDown } from "lucide-react";

export default function BookmarkExport({ data }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // close if clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function downloadFile(filename, content, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();

    URL.revokeObjectURL(url);
  }

  function exportJSON() {
    const json = JSON.stringify(data, null, 2);
    downloadFile("bookmarks.json", json, "application/json");
    setOpen(false);
  }

  function exportTXT() {
    const lines = data.map(
      (b) => `Title: ${b.title}
URL: ${b.url}
Category: ${b.category || "-"} / ${b.sub_category || "-"}
Tags: ${(b.tags || []).join(", ")}
Rating: ${b.priority || 0}
Visits: ${b.total_visits || 0}
Last Visit: ${b.last_visit || "-"}
Next Visit: ${b.next_visit_at || "-"}
----------------------------------------`,
    );

    downloadFile("bookmarks.txt", lines.join("\n"), "text/plain");
    setOpen(false);
  }

  function exportExcel() {
    const headers = ["Title", "URL", "Category", "Sub Category", "Tags", "Rating", "Visits", "Last Visit", "Next Visit"];

    const rows = data.map((b) => [`"${b.title || ""}"`, `"${b.url || ""}"`, `"${b.category || ""}"`, `"${b.sub_category || ""}"`, `"${(b.tags || []).join(", ")}"`, b.priority || 0, b.total_visits || 0, b.last_visit || "", b.next_visit_at || ""]);

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    downloadFile("bookmarks.csv", csv, "text/csv");
    setOpen(false);
  }

  return (
    <div
      className={styles.wrapper}
      ref={ref}
    >
      <button
        className={styles.trigger}
        onClick={() => setOpen(!open)}
      >
        Download
        <ChevronDown
          size={16}
          className={`${styles.icon} ${open ? styles.rotate : ""}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className={styles.menu}
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
          >
            <button
              onClick={exportJSON}
              className={styles.menuItem}
            >
              <FileBraces size={16} />
              JSON
            </button>

            <button
              onClick={exportExcel}
              className={styles.menuItem}
            >
              <Sheet size={16} />
              Excel
            </button>

            <button
              onClick={exportTXT}
              className={styles.menuItem}
            >
              <NotepadText size={16} />
              Text
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
