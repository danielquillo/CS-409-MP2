import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useApods } from "../store/ApodStore";
import { fetchApodByDate } from "../api/nasa";
import { Apod } from "../types";

function vimeoEmbedFromUrl(url: string): string | null {
    try {
        const u = new URL(url);
        if (u.hostname.includes("vimeo.com")) {
            const m = u.pathname.match(/\/(\d+)/);
            const id = m?.[1];
            return id ? `https://player.vimeo.com/video/${id}` : null;
        }
        if (u.hostname === "player.vimeo.com" && u.pathname.startsWith("/video/")) {
            return u.toString();
        }
    } catch {}
    return null;
}

function youtubeEmbedFromUrl(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com")) {
      const id = u.pathname.startsWith("/embed/") 
      ? u.pathname.split("/").pop() 
      : u.pathname === "/watch" 
      ? u.searchParams.get("v") 
      : null;
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (u.hostname === "youtu.be") {
      const id = u.pathname.slice(1);
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
  } catch {}
  return null;
}

export default function DetailView() {
  const { date = "" } = useParams();
  const { items, setItems } = useApods();
  const [apod, setApod] = useState<Apod | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Ensure we have the current item (works even if you deep link)
  useEffect(() => {
  (async () => {
    setLoading(true);
    try {
      let row = items.find((x) => x.date === date) || null;
      if (!row) {
        const fetched = await fetchApodByDate(date!);
        if (!items.find((i) => i.date === fetched.date)) {
          const next = [...items, fetched].sort((a, b) => (a.date < b.date ? 1 : -1));
          setItems(next);
        }
        row = fetched; // now definitely an Apod
      }
      setApod(row);
    } finally {
      setLoading(false);
    }
  })();
}, [date, items, setItems]);

  const idx = useMemo(() => items.findIndex(i => i.date === date), [items, date]);
  const prev = idx > 0 ? items[idx - 1] : null;
  const next = idx >= 0 && idx < items.length - 1 ? items[idx + 1] : null;

  if (loading || !apod) return <main className="container"><p>Loading…</p></main>;

  const isImage = apod.media_type === "image";
  const isVideo = apod.media_type === "video";
  const isMp4 = isVideo && /\.mp4($|\?)/i.test(apod.url);
  const yt = isVideo ? youtubeEmbedFromUrl(apod.url) : null;
  const vimeo = isVideo ? vimeoEmbedFromUrl(apod.url) : null;
  const mediaSrc =
  isImage ? (apod.hdurl || apod.url)
  : isMp4 ? apod.url
  : yt ? yt
  : vimeo ? vimeo
  : null;

  return (
    <main className="container">
      <nav className="crumbs">
        <Link to="/search">← Back to Search</Link> · <Link to="/gallery">Gallery</Link>
      </nav>

      <h1>{apod.title}</h1>
      <div className="meta">{apod.date}{apod.copyright ? ` • © ${apod.copyright}` : ""}</div>

      <div className={`media ${isImage ? "media--image" : "media--video"}`}>
        {isImage ? (
            <img src={mediaSrc!} alt={apod.title} />
        ) : isMp4 ? (
            <video src={mediaSrc!} controls playsInline />
        ) : mediaSrc ? (
            <iframe
            title={apod.title}
            src={mediaSrc}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            />
        ) : (
            // Fallback: open the original APOD link in a new tab
            <div>
            <a
                className="btn"
                href={apod.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Open video on APOD (opens in a new tab)"
            >
                Open video on APOD ↗
            </a>
            <div className="meta">This video host doesn’t allow embedding.</div>
            </div>
        )}
        </div>


      <p className="explanation">{apod.explanation}</p>

      <div className="pager">
        <button disabled={!prev} onClick={() => prev && navigate(`/apod/${prev.date}`)}>← Previous</button>
        <button disabled={!next} onClick={() => next && navigate(`/apod/${next.date}`)}>Next →</button>
      </div>
    </main>
  );
}
