"use client";

import { useEffect, useRef } from "react";

export default function MagneticCard({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty("--mouse-x", `${x}px`);
      card.style.setProperty("--mouse-y", `${y}px`);
    };

    card.addEventListener("mousemove", handleMouseMove);
    return () => card.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div 
      ref={cardRef} 
      className={`relative overflow-hidden group ${className}`}
    >
      <div 
        className="absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          background: "radial-gradient(circle 250px at var(--mouse-x) var(--mouse-y), rgba(212, 175, 55, 0.15), transparent 80%)"
        }}
      ></div>
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
}
