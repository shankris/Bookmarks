import { supabase } from "@/lib/supabase";

export async function handleBookmarkVisit({ bookmark, setBookmarks }) {
  const cycleDays = Number(bookmark.revisit_cycle_days) || 1;

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const nextVisit = new Date(startOfToday);
  nextVisit.setDate(startOfToday.getDate() + cycleDays);

  // ✅ Optimistic UI update
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
    await supabase.from("bookmark_visits").insert([
      {
        bookmark_id: bookmark.id,
        visit_source: "bookmark-table",
        visited_at: now.toISOString(),
      },
    ]);

    await supabase
      .from("bookmarks")
      .update({
        last_visit: now.toISOString(),
        total_visits: (bookmark.total_visits || 0) + 1,
        next_visit_at: nextVisit.toISOString(),
      })
      .eq("id", bookmark.id);

    console.log("✅ Visit logged");
  } catch (err) {
    console.error("❌ Visit logging failed:", err.message);
  }

  window.open(bookmark.url, "_blank", "noopener,noreferrer");
}
