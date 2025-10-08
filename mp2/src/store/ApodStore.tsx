import React, { createContext, useContext, useEffect, useState } from "react";
import { Apod } from "../types";

type Ctx = { items: Apod[]; setItems: (x: Apod[]) => void; };
const ApodContext = createContext<Ctx | null>(null);

export const ApodProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<Apod[]>(() => {
    try {
      const raw = localStorage.getItem("apod-cache");
      return raw ? (JSON.parse(raw) as Apod[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("apod-cache", JSON.stringify(items));
    } catch {}
  }, [items]);

  return <ApodContext.Provider value={{ items, setItems }}>{children}</ApodContext.Provider>;
};

export function useApods() {
  const ctx = useContext(ApodContext);
  if (!ctx) throw new Error("useApods must be used within ApodProvider");
  return ctx;
}
