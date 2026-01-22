"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import styles from "./BookmarkForm.module.css";

export default function BookmarkForm({ initialData, onSuccess }) {
  const [loading, setLoading] = useState(false);

  // Dropdowns
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [subSubCategories, setSubSubCategories] = useState([]);

  // Inline add category
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const [form, setForm] = useState({
    title: initialData?.title || "",
    url: initialData?.url || "",
    category_id: initialData?.category_id || "",
    sub_category_id: initialData?.sub_category_id || "",
    sub_sub_category_id: initialData?.sub_sub_category_id || "",
  });

  /* ---------- Load categories ---------- */
  useEffect(() => {
    supabase
      .from("categories")
      .select("*")
      .order("name")
      .then(({ data }) => setCategories(data || []));
  }, []);

  /* ---------- Load sub-categories ---------- */
  useEffect(() => {
    if (!form.category_id) {
      setSubCategories([]);
      setForm((f) => ({ ...f, sub_category_id: "", sub_sub_category_id: "" }));
      return;
    }

    supabase
      .from("sub_categories")
      .select("*")
      .eq("category_id", form.category_id)
      .order("name")
      .then(({ data }) => setSubCategories(data || []));
  }, [form.category_id]);

  /* ---------- Load sub-sub-categories ---------- */
  useEffect(() => {
    if (!form.sub_category_id) {
      setSubSubCategories([]);
      setForm((f) => ({ ...f, sub_sub_category_id: "" }));
      return;
    }

    supabase
      .from("sub_sub_categories")
      .select("*")
      .eq("sub_category_id", form.sub_category_id)
      .order("name")
      .then(({ data }) => setSubSubCategories(data || []));
  }, [form.sub_category_id]);

  /* ---------- Handlers ---------- */
  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function createCategory() {
    if (!newCategoryName.trim()) return;

    const slug = newCategoryName
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

    const { data, error } = await supabase.from("categories").insert({ name: newCategoryName, slug }).select().single();

    if (!error && data) {
      setCategories((prev) => [...prev, data]);
      setForm((f) => ({ ...f, category_id: data.id }));
      setNewCategoryName("");
      setIsAddingCategory(false);
    } else {
      console.error(error);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    const payload = {
      title: form.title,
      url: form.url,
      category_id: form.category_id || null,
      sub_category_id: form.sub_category_id || null,
      sub_sub_category_id: form.sub_sub_category_id || null,
      saved_on: new Date().toISOString(),
    };

    let error;

    if (initialData?.id) {
      ({ error } = await supabase.from("bookmarks").update(payload).eq("id", initialData.id));
    } else {
      ({ error } = await supabase.from("bookmarks").insert(payload));
    }

    setLoading(false);

    if (!error) {
      onSuccess?.();
      setForm({
        title: "",
        url: "",
        category_id: "",
        sub_category_id: "",
        sub_sub_category_id: "",
      });
    } else {
      console.error(error);
    }
  }

  /* ---------- UI ---------- */
  return (
    <form
      className={styles.form}
      onSubmit={handleSubmit}
    >
      <h3 className={styles.title}>{initialData ? "Edit Bookmark" : "Add Bookmark"}</h3>

      <input
        className={styles.input}
        placeholder='Title'
        value={form.title}
        onChange={(e) => updateField("title", e.target.value)}
        required
      />

      <input
        className={styles.input}
        placeholder='URL'
        value={form.url}
        onChange={(e) => updateField("url", e.target.value)}
        required
      />

      {/* Category */}
      <select
        className={styles.select}
        value={form.category_id}
        onChange={(e) => {
          if (e.target.value === "__add__") {
            setIsAddingCategory(true);
            updateField("category_id", "");
          } else {
            updateField("category_id", e.target.value);
          }
        }}
      >
        <option value=''>Select category</option>
        {categories.map((c) => (
          <option
            key={c.id}
            value={c.id}
          >
            {c.name}
          </option>
        ))}
        <option value='__add__'>+ Add new category</option>
      </select>

      {/* Inline new category input */}
      {isAddingCategory && (
        <div className={styles.inlineAdd}>
          <input
            className={styles.input}
            placeholder='New category name'
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
          />
          <button
            type='button'
            className={styles.inlineButton}
            onClick={createCategory}
          >
            Add
          </button>
        </div>
      )}

      {/* Sub-category */}
      <select
        className={styles.select}
        value={form.sub_category_id}
        disabled={!form.category_id}
        onChange={(e) => updateField("sub_category_id", e.target.value)}
      >
        <option value=''>Select sub-category</option>
        {subCategories.map((sc) => (
          <option
            key={sc.id}
            value={sc.id}
          >
            {sc.name}
          </option>
        ))}
      </select>

      {/* Sub-sub-category */}
      <select
        className={styles.select}
        value={form.sub_sub_category_id}
        disabled={!form.sub_category_id}
        onChange={(e) => updateField("sub_sub_category_id", e.target.value)}
      >
        <option value=''>Select sub-sub-category</option>
        {subSubCategories.map((ssc) => (
          <option
            key={ssc.id}
            value={ssc.id}
          >
            {ssc.name}
          </option>
        ))}
      </select>

      <button
        className={styles.submit}
        disabled={loading}
      >
        {loading ? "Saving..." : "Save"}
      </button>
    </form>
  );
}
