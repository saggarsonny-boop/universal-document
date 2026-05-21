"use client";

import { useEffect, useRef } from "react";

interface Point {
  x: number;
  y: number;
  jx: number; // jagged x
  jy: number; // jagged y
  age: number;
  maxAge: number;
  width: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  age: number;
  maxAge: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
}

export default function KintsugiTrail() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pointsRef = useRef<Point[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0, lastX: 0, lastY: 0, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas dimensions with high DPI support
    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
    };
    
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Track mouse coordinates
    const handleMouseMove = (e: MouseEvent) => {
      const mouse = mouseRef.current;
      mouse.lastX = mouse.x;
      mouse.lastY = mouse.y;
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;

      addPoint(mouse.x, mouse.y);
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 0) return;
      const touch = e.touches[0];
      const mouse = mouseRef.current;
      mouse.x = touch.clientX;
      mouse.y = touch.clientY;
      mouse.lastX = touch.clientX;
      mouse.lastY = touch.clientY;
      mouse.active = true;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 0) return;
      const touch = e.touches[0];
      const mouse = mouseRef.current;
      mouse.lastX = mouse.x;
      mouse.lastY = mouse.y;
      mouse.x = touch.clientX;
      mouse.y = touch.clientY;
      mouse.active = true;

      addPoint(mouse.x, mouse.y);
    };

    const addPoint = (x: number, y: number) => {
      const points = pointsRef.current;
      const lastPoint = points[points.length - 1];

      // Calculate distance moved
      const dx = x - (lastPoint ? lastPoint.x : x);
      const dy = y - (lastPoint ? lastPoint.y : y);
      const dist = Math.hypot(dx, dy);

      // Only add a point if moved significantly
      if (!lastPoint || dist > 6) {
        // Organic crack width variation (pools at junctions, thins elsewhere)
        const baseWidth = 1.0 + Math.random() * 1.5;
        const width = dist < 12 ? baseWidth * 1.5 : baseWidth * 0.7; // thicker when moving slow

        // Static jagged offset generated once so it remains stable
        const jagAngle = Math.random() * Math.PI * 2;
        const jagDist = Math.random() * 4;
        const jx = x + Math.cos(jagAngle) * jagDist;
        const jy = y + Math.sin(jagAngle) * jagDist;

        const isMobile = window.innerWidth < 768;
        const maxPoints = isMobile ? 35 : 60;
        const maxParticles = isMobile ? 25 : 70;

        points.push({
          x,
          y,
          jx,
          jy,
          age: 0,
          maxAge: maxPoints, // shorter trail on mobile for performance
          width,
        });

        // Spawn gold foil dust particles from the crack
        if (Math.random() < 0.45 && particlesRef.current.length < maxParticles) {
          const count = Math.floor(Math.random() * 2) + 1;
          for (let k = 0; k < count; k++) {
            particlesRef.current.push({
              x: jx,
              y: jy,
              vx: (Math.random() - 0.5) * 1.5,
              vy: (Math.random() - 0.2) * 1.0 - 0.5, // drift upward slightly at first
              size: Math.random() * 2.5 + 1.0,
              age: 0,
              maxAge: (isMobile ? 25 : 40) + Math.random() * 30,
              rotation: Math.random() * Math.PI * 2,
              rotationSpeed: (Math.random() - 0.5) * 0.1,
              opacity: Math.random() * 0.7 + 0.3,
            });
          }
        }
      }
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);
    
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleMouseLeave, { passive: true });

    // Canvas animation loop
    let animationId: number;

    const drawTrail = () => {
      // Clear with support for high DPI
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      const points = pointsRef.current;
      const particles = particlesRef.current;

      // 1. Draw the main Kintsugi Cracked Gold Trail
      if (points.length > 1) {
        ctx.lineCap = "round";
        ctx.lineJoin = "miter";
        ctx.miterLimit = 2;

        // Draw multiple overlapping passes to get the gold-leaf lacquer look
        
        // Pass A: Background golden glow
        ctx.beginPath();
        for (let i = 0; i < points.length; i++) {
          const p = points[i];
          if (i === 0) {
            ctx.moveTo(p.jx, p.jy);
          } else {
            ctx.lineTo(p.jx, p.jy);
          }
        }
        ctx.shadowBlur = 15;
        ctx.shadowColor = "rgba(212, 175, 55, 0.7)";
        ctx.strokeStyle = "rgba(212, 175, 55, 0.15)";
        ctx.lineWidth = 4.5;
        ctx.stroke();

        // Pass B: Rich liquid gold core
        ctx.shadowBlur = 0; // turn off shadow blur for the crisp core
        ctx.strokeStyle = "rgba(235, 195, 80, 0.85)"; // bright metallic gold
        
        // We draw individual segments to support fading older parts of the line gracefully
        for (let i = 1; i < points.length; i++) {
          const p1 = points[i - 1];
          const p2 = points[i];
          
          const ageRatio = Math.max(p1.age / p1.maxAge, p2.age / p2.maxAge);
          const opacity = 1 - ageRatio;

          ctx.beginPath();
          ctx.moveTo(p1.jx, p1.jy);
          ctx.lineTo(p2.jx, p2.jy);
          
          ctx.strokeStyle = `rgba(235, 195, 80, ${opacity * 0.9})`;
          ctx.lineWidth = Math.max(0.4, p2.width * (1 - ageRatio * 0.7));
          ctx.stroke();
        }
      }

      // 2. Draw Falling Gold Leaf Foil Particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        
        // Apply physics (gravity + air resistance + horizontal drift sway)
        p.vy += 0.03; // gravity
        p.vx += Math.sin(p.age * 0.08) * 0.05; // soft wave-like sway
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;
        p.age++;

        const lifeRatio = p.age / p.maxAge;
        const currentOpacity = p.opacity * (1 - lifeRatio);

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        
        // Shiny gold gradient
        ctx.fillStyle = `rgba(212, 175, 55, ${currentOpacity})`;
        
        // Draw tiny random rectangular foil flakes
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      }

      // Update ages and prune old points/particles
      pointsRef.current = points
        .map((p) => ({ ...p, age: p.age + 1 }))
        .filter((p) => p.age < p.maxAge);

      particlesRef.current = particles.filter((p) => p.age < p.maxAge);

      animationId = requestAnimationFrame(drawTrail);
    };

    drawTrail();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleMouseLeave);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[99] mix-blend-screen opacity-90 block"
    />
  );
}
