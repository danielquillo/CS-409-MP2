import React, { useMemo, useState } from "react";
import { useApods } from "../store/ApodStore";
import { Link } from "react-router-dom";
import { Apod } from "../types";

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
          const thumb = apod.media_type === "image" ? apod.url : (apod.thumbnail_url || apod.url);
          return (
            <Link to={`/apod/${apod.date}`} key={apod.date} className="card">
              <img src={thumb} alt={apod.title} loading="lazy" />
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
