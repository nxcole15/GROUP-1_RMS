"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function LoadingScreen({ onDone }: { onDone: () => void }) {
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut]   = useState(false);

  useEffect(() => {
    const steps    = 44;
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) { clearInterval(interval); return 100; }
        return prev + 100 / steps;
      });
    }, 50);
    const fadeTimer = setTimeout(() => setFadeOut(true), 0);
    const doneTimer = setTimeout(() => onDone(), 0);
    return () => { clearInterval(interval); clearTimeout(fadeTimer); clearTimeout(doneTimer); };
  }, [onDone]);

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center"
      style={{
        zIndex: 9999,
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
        opacity: fadeOut ? 0 : 0,
        transition: "opacity 0.5s",
        pointerEvents: fadeOut ? "none" : "auto",
      }}
    >
      <div className="d-flex flex-column align-items-center gap-4 animate-fade-in">
        {/* Spinning ring + logo */}
        <div style={{ position: "relative", width: 220, height: 220, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {/* Glow layers - absolutely positioned behind logo */}
          <div style={{
            position: "absolute", width: 220, height: 220, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(251,191,36,0.5) 0%, rgba(245,158,11,0.3) 40%, rgba(220,38,38,0.15) 65%, transparent 80%)",
            filter: "blur(12px)",
            animation: "sunGlowPulse 2s ease-in-out infinite",
          }} />

          {/* Logo with direct glow */}
          <div style={{
            width: 150, height: 150, borderRadius: "50%",
            background: "white",
            display: "flex", alignItems: "center", justifyContent: "center",
            overflow: "hidden",
            boxShadow: "0 0 25px #fbbf24, 0 0 50px #f59e0b, 0 0 75px #dc2626, 0 0 100px rgba(251,191,36,0.5)",
            animation: "sunGlowPulse 2s ease-in-out infinite",
            position: "relative", zIndex: 1,
          }}>
            <Image src="/cfei-logo.jpg" alt="Cebu Far East Institute" width={140} height={140} priority style={{ borderRadius: "50%", objectFit: "cover" }} />
          </div>
        </div>

        {/* School name */}
        <div className="text-center">
          <h1
            className="fw-black fs-3 mb-2"
            style={{
              background: "linear-gradient(90deg, #fbbf24 0%, #ffffff 40%, #fbbf24 60%, #f59e0b 80%, #ffffff 100%)",
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              animation: "schoolNameReveal 1s cubic-bezier(0.22, 1, 0.36, 1) 0.3s both, shimmerText 3s linear 1.3s infinite",
              letterSpacing: "0.04em",
              fontSize: "2rem",
            }}
          >
            Cebu Far East Institute
          </h1>
          <p
            className="fst-italic small mb-0"
            style={{
              animation: "fadeInUp 0.8s ease-out 1s both",
              color: "rgba(251,191,36,0.7)",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              fontSize: "0.7rem",
            }}
          >
            Excellence in Education
          </p>
        </div>

        {/* System badge */}
        <div className="d-flex align-items-center gap-2 rounded-pill px-5 py-3 shadow" style={{ background: "linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(225, 29, 72, 0.1))", border: "1px solid rgba(255, 255, 255, 0.2)", animation: "fadeInUp 0.8s ease-out 0.2s both" }}>
          <span className="text-white fw-black" style={{ letterSpacing: "0.2em", fontSize: "0.95rem" }}>INFORM</span>
          <span className="text-white-50 small">Student Information System</span>
        </div>

        {/* Progress bar */}
        <div className="d-flex flex-column align-items-center gap-2" style={{ width: 300 }}>

          {/* Thin elegant progress track */}
          <div style={{
            width: "100%", height: 2,
            background: "rgba(255,255,255,0.1)",
            borderRadius: 2,
            overflow: "hidden",
          }}>
            <div style={{
              height: "100%",
              width: `${Math.min(progress, 100)}%`,
              background: "linear-gradient(90deg, #fbbf24, #f59e0b, #dc2626)",
              borderRadius: 2,
              transition: "width 0.075s linear",
              boxShadow: "0 0 6px rgba(251,191,36,0.6)",
            }} />
          </div>

          {/* Status text */}
          <p style={{
            color: "rgba(255,255,255,0.35)",
            fontSize: "0.7rem",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            margin: 0,
          }}>
            {progress < 30 ? "Initializing system" : progress < 65 ? "Loading resources" : progress < 95 ? "Almost ready" : "Starting"}
          </p>

        </div>
      </div>
    </div>
  );
}
