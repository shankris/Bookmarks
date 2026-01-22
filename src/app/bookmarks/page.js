import BookmarkList from "@/components/Bookmark/BookmarkList";
import { supabase } from "@/lib/supabase";
import styles from "./BookmarksPage.module.css";

export default async function BookmarksPage() {
  const { data: bookmarks } = await supabase.from("bookmarks").select("*").order("saved_on", { ascending: false });

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>My Bookmarks</h1>
      <BookmarkList initialBookmarks={bookmarks} />
    </div>
  );
}
