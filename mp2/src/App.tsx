import React from "react";
import "./App.css";
import { Routes, Route, Link, Navigate } from "react-router-dom";
import ListView from "./pages/ListView";
import GalleryView from "./pages/GalleryView";
import DetailView from "./pages/DetailView";
import { ApodProvider } from "./store/ApodStore";

export default function App() {
  return (
    <ApodProvider>
      <header className="topbar">
        <nav className="nav">
          <Link to="/search">Search</Link>
          <Link to="/gallery">Gallery</Link>
        </nav>
      </header>
      <Routes>
        <Route path="/" element={<Navigate to="/search" replace />} />
        <Route path="/search" element={<ListView />} />
        <Route path="/gallery" element={<GalleryView />} />
        <Route path="/apod/:date" element={<DetailView />} />
        <Route path="*" element={<div className="notfound">Not found</div>} />
      </Routes>
    </ApodProvider>
  );
}
