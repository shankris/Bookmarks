export default function TruncatedUrl({ url, max = 24 }) {
  if (!url) return "—";

  let clean = url
    .replace(/^https?:\/\//, "") // remove http/https
    .replace(/^www\./, "") // remove www.
    .replace(/\/$/, ""); // remove trailing slash

  const display = clean.length > max ? clean.slice(0, max) + "..." : clean;

  return <span title={url}>{display}</span>;
}
