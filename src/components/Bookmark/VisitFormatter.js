"use client";

export default function VisitFormatter(currentTime) {
  function formatLastVisit(value) {
    if (!value) return "—";

    const diffMs = currentTime - new Date(value);
    const totalMinutes = Math.floor(diffMs / (1000 * 60));

    if (totalMinutes < 1) return "Now";

    const days = Math.floor(totalMinutes / (60 * 24));

    if (days >= 30) {
      const months = Math.floor(days / 30);
      return `${months}m ago`;
    }

    if (days >= 1) return `${days}d ago`;

    const hours = Math.floor(totalMinutes / 60);
    if (hours >= 1) return `${hours}h ago`;

    return `${totalMinutes}m ago`;
  }

  function formatNextVisit(value) {
    if (!value) return "—";

    const today = new Date();
    const currentDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    const visitDate = new Date(value);
    const nextDate = new Date(visitDate.getFullYear(), visitDate.getMonth(), visitDate.getDate());

    const diffDays = Math.round((nextDate - currentDate) / 86400000);

    if (diffDays < 0) return "Due";
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";

    if (diffDays >= 30) {
      const months = Math.floor(diffDays / 30);
      return `${months}m`;
    }

    return `${diffDays}d`;
  }

  return { formatLastVisit, formatNextVisit };
}
