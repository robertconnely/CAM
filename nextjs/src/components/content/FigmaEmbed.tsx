"use client";

import { useState } from "react";
import { Lightbox } from "./Lightbox";

interface FigmaEmbedProps {
  title: string;
  embedUrl?: string;
  imageUrl?: string;
  figmaUrl?: string;
  note?: string;
}

export function FigmaEmbed({
  title,
  embedUrl,
  imageUrl,
  figmaUrl,
  note,
}: FigmaEmbedProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);

  return (
    <div className="figma-embed-section">
      <h3>{title}</h3>
      {note && <p className="figma-embed-note">{note}</p>}
      <div className="figma-embed-wrapper">
        {embedUrl ? (
          <div
            style={{
              position: "relative",
              paddingBottom: "56.25%",
              height: 0,
              overflow: "hidden",
            }}
          >
            <iframe
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                border: "none",
              }}
              src={embedUrl}
              allowFullScreen
            />
          </div>
        ) : imageUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={title}
              className="inline-preview-img"
              onClick={() => setLightboxOpen(true)}
            />
            {lightboxOpen && (
              <Lightbox
                src={imageUrl}
                caption={title}
                onClose={() => setLightboxOpen(false)}
              />
            )}
          </>
        ) : null}
      </div>
      {figmaUrl && (
        <div className="figma-link-row">
          <a
            href={figmaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="figma-btn"
          >
            Open Interactive FigJam Board &rarr;
          </a>
        </div>
      )}
    </div>
  );
}
