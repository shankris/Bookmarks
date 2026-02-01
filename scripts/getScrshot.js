// scripts/getScrshot.js

import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import puppeteer from "puppeteer";
import sharp from "sharp";
import { createClient } from "@supabase/supabase-js";

// ---------------- CONFIG ----------------
const OUTPUT_DIR = path.join(process.cwd(), "public", "screenshots");
const WIDTH = 640; // width of screenshot in pixels
const CONCURRENCY = 2; // safer on Windows
const RETRIES = 1; // retry failed screenshots

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

// ---------------- LOAD ENV ----------------
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

// ---------------- SUPABASE ----------------
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment variables!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// ---------------- CLI FLAGS ----------------
const args = process.argv.slice(2);
const mode = args.includes("--fill") ? "fill" : "all";
console.log(`Mode: ${mode === "fill" ? "Add missing screenshots only" : "Full update (overwrite all)"}`);

// ---------------- HELPERS ----------------
function getDomain(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "").split(".")[0];
  } catch {
    return "unknown";
  }
}

function getHash(uuid) {
  return crypto.createHash("md5").update(uuid).digest("hex").slice(0, 3);
}

function getYouTubeId(url) {
  const match = url.match(/[?&]v=([^&]+)/);
  return match ? match[1] : null;
}

// ---------------- TAKE SCREENSHOT ----------------
async function takeScreenshot(url, filePath) {
  for (let attempt = 0; attempt <= RETRIES; attempt++) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    try {
      console.log(`🌐 Capturing: ${url} (Attempt ${attempt + 1})`);
      await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });
      const tempPath = filePath + ".tmp.png";
      await page.screenshot({ path: tempPath, fullPage: false });

      await sharp(tempPath).resize(WIDTH).png({ quality: 80 }).toFile(filePath);

      try {
        fs.unlinkSync(tempPath);
      } catch {}
      console.log(`✅ Saved screenshot: ${path.basename(filePath)}`);
      await browser.close();
      return true;
    } catch (err) {
      console.error(`❌ Failed to capture ${url}: ${err.message}`);
      await browser.close();
      if (attempt === RETRIES) return false;
    }
  }
}

// ---------------- SAVE YOUTUBE THUMBNAIL ----------------
async function saveYouTubeThumbnail(url, filePath) {
  const videoId = getYouTubeId(url);
  if (!videoId) {
    console.warn(`⚠ Cannot extract YouTube ID from URL: ${url}`);
    return false;
  }

  // Try high-res first, fallback to HQ
  const urls = [`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`, `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`];

  for (const thumbnailUrl of urls) {
    try {
      const res = await fetch(thumbnailUrl);
      if (!res.ok) continue; // try next
      const buffer = await res.arrayBuffer();
      await sharp(Buffer.from(buffer)).resize(WIDTH).png({ quality: 80 }).toFile(filePath);
      console.log(`✅ Saved YouTube thumbnail: ${path.basename(filePath)}`);
      return true;
    } catch {}
  }

  console.error(`❌ Failed to fetch YouTube thumbnail for ${url}`);
  return false;
}

// ---------------- MAIN ----------------
async function main() {
  try {
    console.log("Fetching bookmarks from Supabase...");
    const { data: bookmarks, error } = await supabase.from("bookmarks").select("id, url, title");

    if (error) {
      console.error("Supabase fetch error:", error.message);
      process.exit(1);
    }

    if (!bookmarks || bookmarks.length === 0) {
      console.log("No bookmarks found!");
      return;
    }

    console.log(`Number of bookmarks fetched: ${bookmarks.length}`);
    console.log("Starting screenshot capture...");

    const queue = [...bookmarks];

    async function worker() {
      while (queue.length > 0) {
        const bm = queue.shift();
        if (!bm.url) {
          console.log(`Skipping bookmark with missing URL: ${bm.title || bm.id}`);
          continue;
        }

        const domain = getDomain(bm.url);
        const hash = getHash(bm.id);
        const filename = `${domain}-${hash}.png`;
        const filePath = path.join(OUTPUT_DIR, filename);

        if (mode === "fill" && fs.existsSync(filePath)) {
          console.log(`⏭ Skipping existing screenshot: ${filename}`);
          continue;
        }

        if (bm.url.includes("youtube.com/watch")) {
          await saveYouTubeThumbnail(bm.url, filePath);
        } else {
          await takeScreenshot(bm.url, filePath);
        }
      }
    }

    const workers = Array.from({ length: CONCURRENCY }, () => worker());
    await Promise.all(workers);

    console.log("🎉 All done!");
  } catch (err) {
    console.error("Unexpected error:", err.message);
    process.exit(1);
  }
}

main();
