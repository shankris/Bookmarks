"use client";

import { useRef, useState, useEffect } from "react";
import styles from "./Sidebar.module.css";
import { menuItems } from "./menuItems";
import { ChevronDown, Menu } from "lucide-react";

/* ===============================
   Helpers
================================ */

const Icon = ({ icon: IconComponent }) => (IconComponent ? <IconComponent size={22} /> : null);

/* ===============================
   Header
================================ */

const NavHeader = ({ onToggle }) => (
  <header className={styles.sidebarHeader}>
    <button
      onClick={onToggle}
      className={styles.menuBtn}
      aria-label='Toggle sidebar'
    >
      <Menu size={22} />
    </button>
    <span>Admin</span>
  </header>
);

/* ===============================
   Navigation Button
================================ */

const NavButton = ({ onClick, name, icon, isActive, hasSubNav, isSubOpen }) => (
  <div
    onClick={() => onClick(name)}
    className={`${styles.navButton} ${isActive ? styles.active : ""}`}
  >
    {icon && <Icon icon={icon} />}
    <span>{name}</span>

    {hasSubNav && (
      <ChevronDown
        size={18}
        style={{
          rotate: isSubOpen ? "-180deg" : "0deg",
          transition: "0.3s",
        }}
      />
    )}
  </div>
);

/* ===============================
   Sub Menu
================================ */

const SubMenu = ({ item, activeItem, handleClick }) => {
  const navRef = useRef(null);

  const isOpen = item.name === activeItem || item.items?.some((i) => i === activeItem);

  return (
    <div
      className={styles.subNav}
      style={{
        height: !isOpen ? 0 : navRef.current?.clientHeight,
      }}
    >
      <div
        ref={navRef}
        className={styles.subNavInner}
      >
        {item.items?.map((subItem) => (
          <div
            key={subItem}
            onClick={() => handleClick(subItem)}
            className={`${styles.subNavItem} ${activeItem === subItem ? styles.active : ""}`}
          >
            <span>{subItem}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ===============================
   Sidebar
================================ */

export default function Sidebar() {
  const [activeItem, setActiveItem] = useState("");
  const [isOpen, setIsOpen] = useState(true);

  const handleClick = (item) => setActiveItem(item !== activeItem ? item : "");

  /* Keyboard shortcut: Ctrl / Cmd + B */
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "b") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <>
      {/* Sidebar */}
      <aside className={`${styles.sidebar1} ${!isOpen ? styles.hidden : ""}`}>
        <NavHeader onToggle={() => setIsOpen((v) => !v)} />

        {menuItems.map((item) => (
          <div key={item.name}>
            {!item.items && (
              <NavButton
                onClick={handleClick}
                name={item.name}
                icon={item.icon}
                isActive={activeItem === item.name}
              />
            )}

            {item.items && (
              <>
                <NavButton
                  onClick={handleClick}
                  name={item.name}
                  icon={item.icon}
                  isActive={activeItem === item.name}
                  hasSubNav
                  isSubOpen={activeItem === item.name}
                />
                <SubMenu
                  item={item}
                  activeItem={activeItem}
                  handleClick={handleClick}
                />
              </>
            )}
          </div>
        ))}
      </aside>

      {/* Edge toggle button (VISIBLE when sidebar is hidden) */}
      {!isOpen && (
        <button
          className={styles.edgeToggle}
          onClick={() => setIsOpen(true)}
          aria-label='Open sidebar'
        >
          <Menu size={20} />
        </button>
      )}
    </>
  );
}
