'use client';

import React, { useState } from 'react';

interface EtfPosterProps {
  src: string;
  alt: string;
}

export default function EtfPoster({ src, alt }: EtfPosterProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  return (
    <div className="relative max-w-md w-full rounded-2xl overflow-hidden border border-white/10 shadow-lg bg-black/40">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imgSrc}
        alt={alt}
        className="w-full h-auto object-contain hover:scale-[1.02] transition-transform duration-300"
        onError={() => {
          if (!hasError) {
            setHasError(true);
            setImgSrc('https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=600&auto=format&fit=crop');
          }
        }}
      />
    </div>
  );
}
