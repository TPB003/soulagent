"use client";

import { CSSProperties, useEffect, useRef, useState, ReactNode } from "react";

// ===== 1. 渐变文字 (Shimmer Text) =====
export function ShimmerText({
  children,
  style,
}: {
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <span
      style={{
        background: "linear-gradient(120deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.6) 40%, rgba(255,255,255,1) 50%, rgba(255,255,255,0.6) 60%, rgba(255,255,255,0.1) 100%)",
        backgroundSize: "200% 100%",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
        animation: "shimmer 3s ease-in-out infinite",
        ...style,
      }}
    >
      {children}
    </span>
  );
}

// ===== 2. 渐变背景光晕 (Gradient Background) =====
export function GradientBackground() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      {/* 主光晕 */}
      <div
        style={{
          position: "absolute",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(94,106,210,0.15) 0%, transparent 70%)",
          top: "-20%",
          left: "10%",
          filter: "blur(80px)",
          animation: "float1 20s ease-in-out infinite",
        }}
      />
      {/* 辅助光晕 */}
      <div
        style={{
          position: "absolute",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(168,85,247,0.1) 0%, transparent 70%)",
          bottom: "10%",
          right: "5%",
          filter: "blur(60px)",
          animation: "float2 25s ease-in-out infinite",
        }}
      />
      {/* 网格 */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
          maskImage: "radial-gradient(ellipse at 50% 30%, black 20%, transparent 70%)",
          WebkitMaskImage: "radial-gradient(ellipse at 50% 30%, black 20%, transparent 70%)",
        }}
      />
    </div>
  );
}

// ===== 3. 发光边框卡片 (Glow Card) =====
export function GlowCard({
  children,
  glowColor = "rgba(113,112,255,0.4)",
  style,
}: {
  children: ReactNode;
  glowColor?: string;
  style?: CSSProperties;
}) {
  const [hover, setHover] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div
      ref={cardRef}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onMouseMove={handleMouseMove}
      style={{
        position: "relative",
        borderRadius: 12,
        overflow: "hidden",
        background: "rgba(255,255,255,0.02)",
        border: "1px solid " + (hover ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.06)"),
        transition: "all 0.3s",
        transform: hover ? "translateY(-2px)" : "none",
        ...style,
      }}
    >
      {/* 跟随鼠标的光晕 */}
      {hover && (
        <div
          style={{
            position: "absolute",
            width: 300,
            height: 300,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`,
            left: mousePos.x - 150,
            top: mousePos.y - 150,
            opacity: 0.15,
            pointerEvents: "none",
            transition: "opacity 0.3s",
            filter: "blur(40px)",
          }}
        />
      )}
      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
    </div>
  );
}

// ===== 4. 打字机效果 (Typewriter) =====
export function Typewriter({
  text,
  speed = 50,
  style,
}: {
  text: string;
  speed?: number;
  style?: CSSProperties;
}) {
  const [displayed, setDisplayed] = useState("");
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
        setTimeout(() => setShowCursor(false), 2000);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);

  return (
    <span style={style}>
      {displayed}
      {showCursor && (
        <span
          style={{
            display: "inline-block",
            width: 2,
            height: "1em",
            background: "rgba(255,255,255,0.6)",
            marginLeft: 2,
            verticalAlign: "text-bottom",
            animation: "blink 1s step-end infinite",
          }}
        />
      )}
    </span>
  );
}

// ===== 5. 数字滚动 (Number Ticker) =====
export function NumberTicker({
  value,
  duration = 1000,
  style,
}: {
  value: number;
  duration?: number;
  style?: CSSProperties;
}) {
  const [displayed, setDisplayed] = useState(0);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    const animate = (timestamp: number) => {
      if (!startRef.current) startRef.current = timestamp;
      const progress = Math.min((timestamp - startRef.current) / duration, 1);
      setDisplayed(Math.floor(progress * value));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
    return () => { startRef.current = null; };
  }, [value, duration]);

  return <span style={{ fontFamily: "'JetBrains Mono', monospace", ...style }}>{displayed}</span>;
}

// ===== 6. 粒子效果 (Particles) =====
export function ParticleField({ count = 30 }: { count?: number }) {
  const particles = useRef(
    Array.from({ length: count }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      duration: Math.random() * 20 + 15,
      delay: Math.random() * 10,
      opacity: Math.random() * 0.3 + 0.05,
    }))
  ).current;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
      {particles.map((p, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: p.size,
            height: p.size,
            borderRadius: "50%",
            background: "rgba(255,255,255," + p.opacity + ")",
            left: p.x + "%",
            top: p.y + "%",
            animation: `particleFloat ${p.duration}s ease-in-out ${p.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

// ===== 7. 统计数字卡片 (Stat Card) =====
export function StatCard({
  label,
  value,
  suffix = "",
  icon,
}: {
  label: string;
  value: number;
  suffix?: string;
  icon?: ReactNode;
}) {
  return (
    <GlowCard style={{ padding: "20px 24px", minWidth: 160 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        {icon && <span style={{ color: "rgba(255,255,255,0.4)" }}>{icon}</span>}
        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", fontWeight: 500 }}>{label}</span>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
        <NumberTicker value={value} style={{ fontSize: 28, fontWeight: 700, color: "#fff", letterSpacing: "-1px" }} />
        {suffix && <span style={{ fontSize: 14, color: "rgba(255,255,255,0.35)" }}>{suffix}</span>}
      </div>
    </GlowCard>
  );
}
