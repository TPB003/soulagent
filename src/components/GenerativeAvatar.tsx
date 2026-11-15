"use client";

import { useMemo } from "react";

const TRAIT_PALETTES: Record<string, string[]> = {
  "毒舌": ["#ef4444", "#fb7185", "#b91c1c"],
  "温柔": ["#f472b6", "#fda4af", "#db2777"],
  "理性": ["#60a5fa", "#38bdf8", "#2563eb"],
  "感性": ["#c4b5fd", "#a78bfa", "#7c3aed"],
  "幽默": ["#fbbf24", "#f59e0b", "#d97706"],
  "严肃": ["#a1a1aa", "#71717a", "#3f3f46"],
  "乐观": ["#34d399", "#6ee7b7", "#059669"],
  "技术宅": ["#22d3ee", "#67e8f9", "#0e7490"],
  "哲学家": ["#a78bfa", "#818cf8", "#6d28d9"],
  "梦想家": ["#fb923c", "#fdba74", "#c2410c"],
  "完美主义者": ["#2dd4bf", "#5eead4", "#0f766e"],
  "文艺": ["#e879f9", "#f0abfc", "#c026d3"],
  "细腻": ["#f9a8d4", "#fbcfe8", "#be185d"],
  "好奇": ["#93c5fd", "#bfdbfe", "#1d4ed8"],
};

function paletteFromSeed(seed: number) {
  const hue = seed % 360;
  return [
    `hsl(${hue} 58% 64%)`,
    `hsl(${(hue + 32) % 360} 48% 56%)`,
    `hsl(${(hue + 300) % 360} 42% 46%)`,
  ];
}

export function GenerativeAvatar({
  traits,
  name,
  size = 320,
  fluid = false,
  className,
}: {
  traits: string[];
  name: string;
  size?: number;
  fluid?: boolean;
  className?: string;
}) {
  const seed = useMemo(() => {
    let hash = 0;
    const str = name + traits.join("");
    for (let i = 0; i < str.length; i++) hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
    return Math.abs(hash);
  }, [name, traits]);

  const colors = useMemo(() => {
    const picked: string[] = [];
    traits.forEach((trait) => {
      const palette = TRAIT_PALETTES[trait];
      if (palette) picked.push(palette[0]);
    });
    if (picked.length === 0) return paletteFromSeed(seed);
    while (picked.length < 3) picked.push(picked[picked.length % Math.max(picked.length, 1)] ?? "#8b7cf6");
    return picked.slice(0, 3);
  }, [traits, seed]);

  const [c1, c2, c3] = colors;

  const shapes = useMemo(() => {
    const rand = (i: number) => {
      const x = Math.sin(seed + i * 127.1) * 43758.5453;
      return x - Math.floor(x);
    };
    const result: string[] = [];
    const cx = size / 2;
    const cy = size / 2;
    const coreR = size * 0.18 + rand(1) * size * 0.04;
    result.push(`<circle cx="${cx}" cy="${cy}" r="${coreR}" fill="${c1}" opacity="0.9"/>`);

    const count = 7 + Math.floor(rand(2) * 6);
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + rand(3 + i) * 0.4;
      const dist = size * 0.18 + rand(4 + i) * size * 0.18;
      const r = size * 0.025 + rand(5 + i) * size * 0.035;
      const x = cx + Math.cos(angle) * dist;
      const y = cy + Math.sin(angle) * dist;
      const opacity = 0.35 + rand(6 + i) * 0.5;
      const color = [c1, c2, c3][Math.floor(rand(7 + i) * 3)];
      result.push(`<circle cx="${x}" cy="${y}" r="${r}" fill="${color}" opacity="${opacity}"/>`);
    }

    const lines = 3 + Math.floor(rand(20) * 3);
    for (let i = 0; i < lines; i++) {
      const a1 = rand(21 + i) * Math.PI * 2;
      const a2 = rand(22 + i) * Math.PI * 2;
      const d1 = size * 0.12 + rand(23 + i) * size * 0.22;
      const d2 = size * 0.12 + rand(24 + i) * size * 0.22;
      result.push(
        `<line x1="${cx + Math.cos(a1) * d1}" y1="${cy + Math.sin(a1) * d1}" x2="${cx + Math.cos(a2) * d2}" y2="${cy + Math.sin(a2) * d2}" stroke="${c2}" stroke-width="1" opacity="0.28"/>`,
      );
    }

    const ringR = size * 0.36 + rand(30) * size * 0.04;
    result.push(
      `<circle cx="${cx}" cy="${cy}" r="${ringR}" fill="none" stroke="${c3}" stroke-width="1.25" opacity="0.45"/>`,
    );

    const dots = 10 + Math.floor(rand(31) * 6);
    for (let i = 0; i < dots; i++) {
      const angle = (i / dots) * Math.PI * 2;
      const r = 1.4 + rand(32 + i) * 1.8;
      result.push(
        `<circle cx="${cx + Math.cos(angle) * ringR}" cy="${cy + Math.sin(angle) * ringR}" r="${r}" fill="${c1}" opacity="0.7"/>`,
      );
    }

    if (traits.includes("理性") || traits.includes("技术宅")) {
      const hexR = size * 0.26;
      const points = Array.from({ length: 6 }, (_, i) => {
        const a = (i / 6) * Math.PI * 2 - Math.PI / 6;
        return `${cx + Math.cos(a) * hexR},${cy + Math.sin(a) * hexR}`;
      }).join(" ");
      result.push(`<polygon points="${points}" fill="none" stroke="${c2}" stroke-width="1.2" opacity="0.35"/>`);
    }

    if (traits.includes("温柔") || traits.includes("感性") || traits.includes("细腻")) {
      result.push(
        `<ellipse cx="${cx}" cy="${cy}" rx="${size * 0.3}" ry="${size * 0.2}" fill="none" stroke="${c1}" stroke-width="1" opacity="0.3" transform="rotate(${rand(40) * 28} ${cx} ${cy})"/>`,
      );
    }

    return result.join("");
  }, [traits, size, seed, c1, c2, c3]);

  return (
    <div
      className={`avatar ${className ?? ""}`}
      style={fluid
        ? { width: "100%", height: "100%", background: `radial-gradient(120% 90% at 50% 38%, ${c1}55, #0c0d10 68%)` }
        : { width: "100%", maxWidth: size, aspectRatio: "1", background: `radial-gradient(120% 90% at 50% 38%, ${c1}55, #0c0d10 68%)` }}
    >
      <svg viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`${name} 的生成头像`}>
        <defs>
          <radialGradient id={`glow-${seed}`} cx="50%" cy="46%" r="52%">
            <stop offset="0%" stopColor={c1} stopOpacity="0.28" />
            <stop offset="100%" stopColor={c1} stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={size * 0.46} fill={`url(#glow-${seed})`} />
        <g dangerouslySetInnerHTML={{ __html: shapes }} />
      </svg>
    </div>
  );
}
