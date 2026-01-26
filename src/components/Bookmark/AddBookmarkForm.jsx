"use client";

import { useState } from "react";
import { BookmarkPlus } from "lucide-react";
import StarRating from "./StarRating";
import TagsInput from "./TagsInput";
import { supabase } from "@/lib/supabase";
import styles from "./AddBookmarkForm.module.css";
import { CATEGORY_MAP } from "@/components/common/categories";

export default function AddBookmarkForm({ onClose }) {
  const [priority, setPriority] = useState(3);
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [revisitEvery, setRevisitEvery] = useState("1w");
  const [urlPreview, setUrlPreview] = useState("");
  const [status, setStatus] = useState("idle"); // idle | saving | success | error

  function truncateUrl(url, maxLength = 43) {
    if (!url) return "";
    if (url.length <= maxLength) return url;
    return url.slice(0, maxLength - 1) + "…";
  }

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

  function resetForm() {
    setCategory("");
    setSubCategory("");
    setTags([]);
    setPriority(3);
    setRevisitEvery("1w");
    setUrlPreview("");
    setStatus("idle");
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!navigator.onLine) {
      alert("You are offline. Please reconnect to save bookmarks.");
      return;
    }

    setLoading(true);
    setStatus("saving");

    const form = e.target;

    const revisitDays = parseRevisit(revisitEvery);
    const nextVisitAt = new Date();
    nextVisitAt.setDate(nextVisitAt.getDate() + revisitDays);

    const formData = {
      title: form.title.value,
      url: form.url.value,
      category,
      sub_category: subCategory,
      tags,
      priority,
      revisit_cycle_days: revisitDays,
      next_visit_at: nextVisitAt.toISOString(),
      total_visits: 0,
    };

    try {
      const { error } = await supabase.from("bookmarks").insert([formData]);

      if (error) {
        console.error("Supabase insert failed:", error);
        setStatus("error");
        setLoading(false);
        return;
      }

      // SUCCESS
      setStatus("success");
      setLoading(false);
    } catch (err) {
      console.error("Unexpected error:", err);
      setStatus("error");
      setLoading(false);
    }
  };

  function SuccessCheck() {
    return (
      <div className={styles.successWrap}>
        <svg
          viewBox='0 0 52 52'
          className={styles.checkmark}
        >
          <circle
            cx='26'
            cy='26'
            r='25'
            fill='none'
          />
          <path
            fill='none'
            d='M14 27l7 7 16-16'
          />
        </svg>

        <p className={styles.successText}>Bookmark Saved!</p>

        <div className={styles.successActions}>
          <button
            className={styles.primaryBtn}
            onClick={resetForm}
          >
            Add Another Bookmark
          </button>

          <button
            className={styles.secondaryBtn}
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  if (status === "success") {
    return <SuccessCheck />;
  }

  return (
    <form
      className={styles.form}
      onSubmit={handleSubmit}
    >
      <h2 className={styles.heading}>
        <BookmarkPlus size={24} /> Add Bookmark
      </h2>

      {status === "error" && <div className={styles.errorBox}>Failed to save. Please try again.</div>}

      <div className={styles.row}>
        <label>Title</label>
        <input
          className={styles.txtBox}
          name='title'
          required
        />
      </div>

      <div className={styles.row}>
        <label>URL</label>
        <input
          className={styles.txtBox}
          type='url'
          name='url'
          required
          onChange={(e) => setUrlPreview(e.target.value)}
        />
        {urlPreview && (
          <div
            className={styles.urlPreview}
            title={urlPreview}
          >
            {truncateUrl(urlPreview)}
          </div>
        )}
      </div>

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
          type='submit'
          disabled={loading}
        >
          {loading ? "Saving..." : "Add Bookmark"}
        </button>
      </div>
    </form>
  );
}
