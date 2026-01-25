"use client";

import { useState } from "react";
import { BookmarkPlus } from "lucide-react";
import StarRating from "./StarRating";
import TagsInput from "./TagsInput";
import { supabase } from "@/lib/supabase";
import styles from "./AddBookmarkForm.module.css";

/* ---------- Static category data ---------- */
const CATEGORY_MAP = {
  Dev: ["Frontend", "Backend", "DevOps"],
  Design: ["UI", "UX", "Illustration"],
  Finance: ["Investing", "Trading", "Tax"],
  Learning: ["Courses", "Docs", "Tutorials"],
  News: ["Tech", "World", "Local"],
  Sports: ["Cricket", "Tennis"],
  Writing: ["Blogs", "Articles", "Stories"],
};

export default function AddBookmarkForm() {
  const [priority, setPriority] = useState(3);
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [revisitEvery, setRevisitEvery] = useState("1w");

  /* Convert revisit cycle to days */
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
      default:
        return null;
    }
  }

  /* Submit directly to Supabase */
  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const revisit = formData.get("revisit_every");

    const payload = {
      title: formData.get("title"),
      url: formData.get("url"),
      category: category || null,
      sub_category: subCategory || null,
      tags, // store array of tags
      priority,
      revisit_after_days: parseRevisit(revisit),
      saved_on: new Date().toISOString(),
      total_visits: 0,
      status: "active",
    };

    const { data, error } = await supabase.from("bookmarks").insert(payload).select().single();

    setLoading(false);

    if (error) {
      console.error("Error saving bookmark:", error);
      alert("Failed to save bookmark");
      return;
    }

    alert("Bookmark saved successfully!");
    e.currentTarget.reset();
    setCategory("");
    setSubCategory("");
    setTags([]);
    setPriority(3);
    setRevisitEvery("1w");
  }

  return (
    <form
      className={styles.form}
      onSubmit={handleSubmit}
    >
      <h2 className={styles.heading}>
        <BookmarkPlus size={24} /> Add Bookmark
      </h2>

      {/* Title */}
      <div className={styles.row}>
        <label>Title</label>
        <input
          className={styles.txtBox}
          name='title'
          required
        />
      </div>

      {/* URL */}
      <div className={styles.row}>
        <label>URL</label>
        <input
          className={styles.txtBox}
          type='url'
          name='url'
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
            <div className={styles.placeholder}>Please select a category first</div>
          )}
        </div>
      </div>

      {/* Tags */}
      <div className={styles.row}>
        <label>Tags</label>
        <TagsInput
          value={tags}
          onChange={setTags}
        />
      </div>

      {/* Priority */}
      <div className={styles.row}>
        <label>Rating</label>
        <StarRating
          value={priority}
          onChange={setPriority}
        />
      </div>

      {/* Revisit Cycle */}
      <div className={styles.row}>
        <label>Revisit Cycle</label>
        <div className={styles.radioGroup}>
          {[
            { val: "1d", label: "Daily" },
            { val: "1w", label: "Weekly" },
            { val: "2w", label: "2 weeks" },
            { val: "1m", label: "1 month" },
            { val: "2m", label: "2 months" },
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

      {/* Submit */}
      <div className={styles.actions}>
        <button
          className={styles.addBtn}
          type='submit'
          disabled={loading}
        >
          {loading ? "Saving..." : "Add Bookmark"}
        </button>
      </div>
    </form>
  );
}
