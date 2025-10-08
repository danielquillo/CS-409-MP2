import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useApods } from "../store/ApodStore";
import { fetchApodByDate } from "../api/nasa";
import { Apod } from "../types";

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
  const mediaSrc = isImage ? (apod.hdurl || apod.url) : apod.url;

  return (
    <main className="container">
      <nav className="crumbs">
        <Link to="/search">← Back to Search</Link> · <Link to="/gallery">Gallery</Link>
      </nav>

      <h1>{apod.title}</h1>
      <div className="meta">{apod.date}{apod.copyright ? ` • © ${apod.copyright}` : ""}</div>

      <div className="media">
        {isImage ? (
          <img src={mediaSrc} alt={apod.title} />
        ) : (
          <iframe
            title={apod.title}
            src={mediaSrc}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
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
