// components/Footer/Footer.jsx
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <p className={styles.copy}>© {new Date().getFullYear()} Bookmarker</p>

        <nav aria-label='Footer navigation'>
          <ul className={styles.links}>
            <li>
              <a href='/about'>About</a>
            </li>
            <li>
              <a href='/privacy'>Privacy</a>
            </li>
            <li>
              <a href='/terms'>Terms</a>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}
