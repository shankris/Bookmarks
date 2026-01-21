import styles from "./notification.module.css";

export default function NotificationItem({ item, onClick }) {
  return (
    <li
      className={`${styles.item} ${!item.read ? styles.unread : ""}`}
      onClick={onClick}
      role='button'
      tabIndex={0}
    >
      <div className={styles.itemContent}>
        <div className={styles.notificationTitle}>{item.title}</div>

        {item.description && <div className={styles.notificationTxt}>{item.description}</div>}

        {item.time && <span className={styles.time}>{item.time}</span>}
      </div>
    </li>
  );
}
