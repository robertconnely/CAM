"use client";

import { useEffect, useCallback } from "react";

interface LightboxProps {
  src: string;
  caption?: string;
  onClose: () => void;
}

export function Lightbox({ src, caption, onClose }: LightboxProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [handleKeyDown]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).classList.contains("lightbox-overlay")) {
      onClose();
    }
  };

  return (
    <div
      className="lightbox-overlay active"
      onClick={handleOverlayClick}
    >
      <button className="lightbox-close" onClick={onClose}>
        &times;
      </button>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={caption || ""} className="lightbox-img" />
      {caption && <div className="lightbox-caption">{caption}</div>}
    </div>
  );
}
