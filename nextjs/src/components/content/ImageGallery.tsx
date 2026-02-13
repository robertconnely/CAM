"use client";

import { useState } from "react";
import { Lightbox } from "./Lightbox";

interface ImageItem {
  src: string;
  alt: string;
  caption?: string;
}

interface ImageGalleryProps {
  images: ImageItem[];
}

export function ImageGallery({ images }: ImageGalleryProps) {
  const [lightbox, setLightbox] = useState<{
    src: string;
    caption: string;
  } | null>(null);

  return (
    <>
      <div className="image-gallery">
        {images.map((image, index) => (
          <div
            key={index}
            className="image-item"
            onClick={() =>
              setLightbox({
                src: image.src,
                caption: image.caption || image.alt,
              })
            }
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image.src} alt={image.alt} />
            {image.caption && <p>{image.caption}</p>}
          </div>
        ))}
      </div>
      {lightbox && (
        <Lightbox
          src={lightbox.src}
          caption={lightbox.caption}
          onClose={() => setLightbox(null)}
        />
      )}
    </>
  );
}
