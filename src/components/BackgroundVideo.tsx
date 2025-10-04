// src/components/ui/BackgroundVideo.tsx
import React, { useEffect, useRef, useState } from 'react';

type Props = {
  opacity?: number;
  fallbackVideoUrl?: string;
  fallbackImageUrl?: string;
};

const BackgroundVideo: React.FC<Props> = ({
  opacity = 0.22,
  fallbackVideoUrl = '/backgroud.mp4',      // <-- use your file name
  fallbackImageUrl = '/placeholder.svg',
}) => {
  const [localVideoUrl, setLocalVideoUrl] = useState<string | null>(null);

  useEffect(() => {
    // Check if backgroud.mp4 exists
    (async () => {
      try {
        const res = await fetch(fallbackVideoUrl, { method: 'HEAD' });
        if (res.ok) setLocalVideoUrl(fallbackVideoUrl);
      } catch {}
    })();
  }, [fallbackVideoUrl]);

  if (localVideoUrl) {
    return (
      <div style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', zIndex: -1, overflow: 'hidden', pointerEvents: 'none' }} aria-hidden>
        <video
          autoPlay
          muted
          loop
          playsInline
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '177.7777778vh',
            height: '100vh',
            transform: 'translate(-50%, -50%)',
            objectFit: 'cover',
            opacity: opacity,
            filter: 'brightness(0.55) contrast(0.95) saturate(0.95)'
          }}
        >
          <source src={localVideoUrl} type="video/mp4" />
        </video>
      </div>
    );
  }
  // fallback image if video not found
  return (
    <div style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', zIndex: -1, overflow: 'hidden', pointerEvents: 'none' }} aria-hidden>
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `url(${fallbackImageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        opacity: opacity,
        filter: 'brightness(0.72)'
      }} />
    </div>
  );
};

export default BackgroundVideo;
