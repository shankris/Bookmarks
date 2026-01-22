"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import styles from "./BookmarkModal.module.css";

export default function BookmarkModal({ isOpen, onClose, onSuccess, initialData }) {
  if (!isOpen) return null;

  const [form, setForm] = useState({
    title: initialData?.title || "",
    url: initialData?.url || "",
    notes: initialData?.notes || "",
    category: initialData?.category || "",
    sub_category: initialData?.sub_category || "",
    sub_sub_category: initialData?.sub_sub_category || "",
    priority: initialData?.priority ?? 3,
    revisit_after_days: initialData?.revisit_after_days || "",
    is_pinned: initialData?.is_pinned || false,
  });

  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...form,
      saved_on: new Date().toISOString(),
    };

    let error;
    if (initialData?.id) {
      // Update existing bookmark
      ({ error } = await supabase.from("bookmarks").update(payload).eq("id", initialData.id));
    } else {
      // Insert new bookmark
      ({ error } = await supabase.from("bookmarks").insert(payload));
    }

    setLoading(false);
    if (error) {
      console.error(error);
      alert("Failed to save bookmark");
      return;
    }

    onSuccess?.();
    onClose();
  }

  return (
    <div
      className={styles.overlay}
      onClick={onClose}
    >
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className={styles.close}
          onClick={onClose}
        >
          ×
        </button>

        <h2>{initialData ? "Edit Bookmark" : "Add Bookmark"}</h2>

        <form
          className={styles.form}
          onSubmit={handleSubmit}
        >
          <label>
            Title
            <input
              type='text'
              name='title'
              value={form.title}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            URL
            <input
              type='url'
              name='url'
              value={form.url}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Notes
            <textarea
              name='notes'
              value={form.notes}
              onChange={handleChange}
            />
          </label>

          <label>
            Category
            <input
              type='text'
              name='category'
              value={form.category}
              onChange={handleChange}
            />
          </label>

          <label>
            Sub-category
            <input
              type='text'
              name='sub_category'
              value={form.sub_category}
              onChange={handleChange}
            />
          </label>

          <label>
            Sub-sub-category
            <input
              type='text'
              name='sub_sub_category'
              value={form.sub_sub_category}
              onChange={handleChange}
            />
          </label>

          <label>
            Priority
            <input
              type='number'
              name='priority'
              value={form.priority}
              min={1}
              max={5}
              onChange={handleChange}
            />
          </label>

          <label>
            Revisit after (days)
            <input
              type='number'
              name='revisit_after_days'
              value={form.revisit_after_days}
              onChange={handleChange}
            />
          </label>

          <label>
            <input
              type='checkbox'
              name='is_pinned'
              checked={form.is_pinned}
              onChange={handleChange}
            />
            Pin this bookmark
          </label>

          <button
            type='submit'
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Bookmark"}
          </button>
        </form>
      </div>
    </div>
  );
}
