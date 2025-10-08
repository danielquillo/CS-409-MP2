import React, { useEffect, useMemo, useState, useRef } from "react";
import { fetchApods } from "../api/nasa";
import { useApods } from "../store/ApodStore";
import { Link, useSearchParams } from "react-router-dom";
import { Apod } from "../types";

function isoDaysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

type SortKey = "title" | "date";
type SortDir = "asc" | "desc";

export default function ListView() {
  const { items, setItems } = useApods();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [params, setParams] = useSearchParams();
  const query = params.get("q") ?? "";
  const sortKey = (params.get("sort") as SortKey) || "date";
  const sortDir = (params.get("dir") as SortDir) || "desc";
  const didFetchRef = useRef(false);

  useEffect(() => {
    if (items.length || didFetchRef.current) return; // keep cache
    didFetchRef.current = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const end = isoDaysAgo(0);
        const start = isoDaysAgo(120); // last ~4 months
        const apods = await fetchApods(start, end);
        setItems(apods);
      } catch (e: any) {
        if (e?.response?.status === 429) {
            setError("Rate limit exceeded. Please try again later.");
        } else {
            setError(e?.message || "Failed to load APODs");
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [items.length, setItems]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    const base = items.filter(
      (i) =>
        i.title.toLowerCase().includes(q) ||
        i.explanation.toLowerCase().includes(q)
    );
    const sorted = [...base].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "title") cmp = a.title.localeCompare(b.title);
      else cmp = a.date.localeCompare(b.date); // string YYYY-MM-DD works
      return sortDir === "asc" ? cmp : -cmp;
    });
    return sorted;
  }, [items, query, sortKey, sortDir]);

  function updateParam(key: string, val: string) {
    const next = new URLSearchParams(params);
    if (val) next.set(key, val);
    else next.delete(key);
    setParams(next, { replace: true });
  }

  return (
    <main className="container">
      <h1>NASA APOD – Search</h1>

      <div className="controls">
        <input
          placeholder="Filter as you type…"
          value={query}
          onChange={(e) => updateParam("q", e.target.value)}
        />
        <select
          value={sortKey}
          onChange={(e) => updateParam("sort", e.target.value)}
        >
          <option value="date">Sort by Date</option>
          <option value="title">Sort by Title</option>
        </select>
        <select
          value={sortDir}
          onChange={(e) => updateParam("dir", e.target.value)}
        >
          <option value="desc">Desc</option>
          <option value="asc">Asc</option>
        </select>
      </div>

      {loading && <p>Loading…</p>}
      {error && <p role="alert">Error: {error}</p>}

      <ul className="list">
        {filtered.map((apod: Apod) => (
          <li key={apod.date} className="list-item">
            <Link to={`/apod/${apod.date}`}>
              <strong>{apod.title}</strong>
              <div className="meta">{apod.date}</div>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
