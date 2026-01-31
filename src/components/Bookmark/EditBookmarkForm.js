"use client";

import { useState } from "react";
import { SquarePen } from "lucide-react";
import StarRating from "./StarRating";
import TagsInput from "./TagsInput";
import { supabase } from "@/lib/supabase";
import styles from "./AddBookmarkForm.module.css";
import { CATEGORY_MAP } from "@/components/common/categories";

export default function EditBookmarkForm({ bookmark, onClose, onSave }) {
  const [priority, setPriority] = useState(bookmark.priority || 3);
  const [category, setCategory] = useState(bookmark.category || "");
  const [subCategory, setSubCategory] = useState(bookmark.sub_category || "");
  const [tags, setTags] = useState(bookmark.tags || []);
  const [revisitEvery, setRevisitEvery] = useState(mapDaysToRevisit(bookmark.revisit_cycle_days));
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("idle");

  function parseRevisit(revisit) {
    switch (revisit) {
      case "1d":
        return 1;
      case "1w":
        return 7;
      case "2w":
        return 14;
      case "3w":
        return 21;
      case "1m":
        return 30;
      case "2m":
        return 60;
      case "3m":
        return 90;
      case "1y":
        return 365;
      default:
        return null;
    }
  }

  function mapDaysToRevisit(days) {
    switch (days) {
      case 1:
        return "1d";
      case 7:
        return "1w";
      case 14:
        return "2w";
      case 21:
        return "3w";
      case 30:
        return "1m";
      case 60:
        return "2m";
      case 90:
        return "3m";
      default:
        return "1w"; // fallback
    }
  }

  const handleDelete = async () => {
    if (!confirm("Delete this bookmark?")) return;

    const { error } = await supabase.from("bookmarks").delete().eq("id", bookmark.id);
    if (error) return console.error(error);

    onSave({ id: bookmark.id, deleted: true });
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const form = e.target;

    const revisitDays = parseRevisit(revisitEvery);

    const nextVisitAt = new Date();
    nextVisitAt.setDate(nextVisitAt.getDate() + revisitDays);

    const updatedData = {
      title: form.title.value,
      url: form.url.value,
      category,
      sub_category: subCategory,
      tags,
      priority,
      revisit_cycle_days: revisitDays,
      next_visit_at: nextVisitAt.toISOString(),
    };

    const { data, error } = await supabase.from("bookmarks").update(updatedData).eq("id", bookmark.id).select().single();

    setLoading(false);

    if (error) {
      console.error(error);
      setStatus("error");
      return;
    }

    onSave(data); // ⭐ update table
    onClose();
  };

  return (
    <form
      className={styles.form}
      onSubmit={handleSubmit}
    >
      <h2 className={styles.heading}>
        <SquarePen size={22} /> Edit Bookmark
      </h2>

      <div className={styles.row}>
        <label>Title</label>
        <input
          name='title'
          defaultValue={bookmark.title}
          className={styles.txtBox}
          required
        />
      </div>

      <div className={styles.row}>
        <label>URL</label>
        <input
          name='url'
          defaultValue={bookmark.url}
          className={styles.txtBox}
          required
        />
      </div>

      {/* Category */}
      <div className={styles.row}>
        <label>Category</label>
        <div className={styles.cardGroup}>
          {Object.keys(CATEGORY_MAP).map((cat) => (
            <button
              type='button'
              key={cat}
              className={`${styles.card} ${category === cat ? styles.activeCard : ""}`}
              onClick={() => {
                setCategory(cat);
                setSubCategory("");
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Sub-category */}
      <div className={styles.row}>
        <label>Sub-category</label>
        <div className={styles.cardGroup}>
          {category ? (
            CATEGORY_MAP[category].map((sub) => (
              <button
                type='button'
                key={sub}
                className={`${styles.card} ${subCategory === sub ? styles.activeCard : ""}`}
                onClick={() => setSubCategory(sub)}
              >
                {sub}
              </button>
            ))
          ) : (
            <div className={styles.placeholder}>Select category first</div>
          )}
        </div>
      </div>

      <div className={styles.row}>
        <label>Tags</label>
        <TagsInput
          value={tags}
          onChange={setTags}
        />
      </div>

      <div className={styles.row}>
        <label>Rating</label>
        <StarRating
          value={priority}
          onChange={setPriority}
        />
      </div>

      <div className={styles.row}>
        <label>Revisit Cycle</label>
        <div className={styles.radioGroup}>
          {[
            { val: "1d", label: "Daily" },
            { val: "1w", label: "Weekly" },
            { val: "2w", label: "2 weeks" },
            { val: "3w", label: "3 weeks" },
            { val: "1m", label: "1 month" },
            { val: "2m", label: "2 months" },
            { val: "3m", label: "3 months" },
            { val: "1y", label: "1 Year" },
          ].map((r) => (
            <label key={r.val}>
              <input
                type='radio'
                name='revisit_every'
                value={r.val}
                checked={revisitEvery === r.val}
                onChange={() => setRevisitEvery(r.val)}
              />
              {r.label}
            </label>
          ))}
        </div>
      </div>

      <div className={styles.actions}>
        <button
          className={styles.addBtn}
          disabled={loading}
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>

        <button
          type='button'
          className={styles.secondaryBtn}
          onClick={onClose}
        >
          Cancel
        </button>

        <button
          type='button'
          className={styles.deleteBtn}
          onClick={handleDelete}
        >
          Delete
        </button>
      </div>
    </form>
  );
}
