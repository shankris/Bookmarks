import BookmarkList from "@/components/Bookmark/BookmarkList";
import { supabase } from "@/lib/supabase";
import styles from "./page.module.css";

export default async function Home() {
  const { data: bookmarks } = await supabase.from("bookmarks").select("*").order("saved_on", { ascending: false });

  return (
    <div className={styles.page}>
      <BookmarkList initialBookmarks={bookmarks} />
    </div>
  );
}
