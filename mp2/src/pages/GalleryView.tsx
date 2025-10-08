import React, { useMemo, useState } from "react";
import { useApods } from "../store/ApodStore";
import { Link } from "react-router-dom";
import { Apod } from "../types";

const FALLBACK_THUMB = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='600' height='400'>
     <rect width='100%' height='100%' fill='#0c1226'/>
     <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle'
           fill='#a8b3cf' font-family='sans-serif' font-size='24'>Video</text>
   </svg>`
)}`;

function youtubeIdFromUrl(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com")) {
      if (u.pathname.startsWith("/embed/")) return u.pathname.split("/").pop() || null;
      if (u.pathname === "/watch") return u.searchParams.get("v");
    }
    if (u.hostname === "youtu.be") return u.pathname.slice(1);
  } catch {}
  return null;
}

function thumbFor(apod: Apod): string {
  if (apod.media_type === "image") return apod.url;
  if (apod.thumbnail_url) return apod.thumbnail_url;

  const yt = youtubeIdFromUrl(apod.url);
  if (yt) return `https://img.youtube.com/vi/${yt}/hqdefault.jpg`;

  return FALLBACK_THUMB; // last-resort placeholder
}

export default function GalleryView() {
  const { items } = useApods();
  const [media, setMedia] = useState<"all" | "image" | "video">("all");
  const [year, setYear] = useState<string>("all");

  const years = useMemo(() => {
    const ys = Array.from(new Set(items.map(i => i.date.slice(0, 4))));
    return ys.sort().reverse();
  }, [items]);

  const filtered = useMemo(() => {
    return items.filter(i => {
      const okMedia = media === "all" || i.media_type === media;
      const okYear = year === "all" || i.date.startsWith(year);
      return okMedia && okYear;
    });
  }, [items, media, year]);

  return (
    <main className="container">
      <h1>Gallery</h1>
      <div className="controls">
        <label>
          Media:
          <select value={media} onChange={(e) => setMedia(e.target.value as any)}>
            <option value="all">All</option>
            <option value="image">Images</option>
            <option value="video">Videos</option>
          </select>
        </label>
        <label>
          Year:
          <select value={year} onChange={(e) => setYear(e.target.value)}>
            <option value="all">All</option>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </label>
      </div>

      <div className="grid">
        {filtered.map((apod: Apod) => {
            const thumb = thumbFor(apod);
            return (
            <Link to={`/apod/${apod.date}`} key={apod.date} className="card">
                <img
                src={thumb}
                alt={apod.title}
                loading="lazy"
                onError={(e) => {
                    if (e.currentTarget.src !== FALLBACK_THUMB) e.currentTarget.src = FALLBACK_THUMB;
                }}
                />
                {apod.media_type === "video" && <span className="badge">▶ video</span>}
                <div className="card-meta">
                <div>{apod.title}</div>
                <div className="meta">{apod.date}</div>
                </div>
            </Link>
            );
        })}
        </div>
    </main>
  );
}
