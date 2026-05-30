"use client";

import { useMemo } from "react";

// 根据性格参数生成独一无二的 SVG 头像
export function GenerativeAvatar({
  traits,
  name,
  size = 200,
}: {
  traits: string[];
  name: string;
  size?: number;
}) {
  // 从名字和特质生成确定性随机数
  const seed = useMemo(() => {
    let hash = 0;
    const str = name + traits.join("");
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
    }
    return Math.abs(hash);
  }, [name, traits]);

  const rand = (i: number) => {
    const x = Math.sin(seed + i * 127.1) * 43758.5453;
    return x - Math.floor(x);
  };

  // 根据特质选配色
  const palettes: Record<string, string[]> = {
    "毒舌": ["#ef4444", "#dc2626", "#b91c1c"],
    "温柔": ["#f472b6", "#ec4899", "#db2777"],
    "理性": ["#3b82f6", "#2563eb", "#1d4ed8"],
    "感性": ["#a78bfa", "#8b5cf6", "#7c3aed"],
    "幽默": ["#fbbf24", "#f59e0b", "#d97706"],
    "严肃": ["#6b7280", "#4b5563", "#374151"],
    "乐观": ["#34d399", "#10b981", "#059669"],
    "技术宅": ["#06b6d4", "#0891b2", "#0e7490"],
    "哲学家": ["#8b5cf6", "#7c3aed", "#6d28d9"],
    "梦想家": ["#f97316", "#ea580c", "#c2410c"],
    "完美主义者": ["#14b8a6", "#0d9488", "#0f766e"],
    "文艺": ["#e879f9", "#d946ef", "#c026d3"],
  };

  const getColors = () => {
    const colors: string[] = [];
    traits.forEach((t) => {
      if (palettes[t]) colors.push(...palettes[t]);
    });
    if (colors.length === 0) colors.push("#7170ff", "#5e6ad2", "#4f46e5");
    return colors;
  };

  const colors = getColors();
  const c1 = colors[0] || "#7170ff";
  const c2 = colors[1] || "#5e6ad2";
  const c3 = colors[2] || "#4f46e5";

  // 生成形状
  const shapes = useMemo(() => {
    const result = [];
    const cx = size / 2;
    const cy = size / 2;

    // 中心核心
    const coreR = size * 0.15 + rand(1) * size * 0.05;
    result.push(
      `<circle cx="${cx}" cy="${cy}" r="${coreR}" fill="${c1}" opacity="0.8"/>`
    );

    // 环绕粒子
    const count = 8 + Math.floor(rand(2) * 8);
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + rand(3 + i) * 0.5;
      const dist = size * 0.2 + rand(4 + i) * size * 0.2;
      const r = size * 0.02 + rand(5 + i) * size * 0.04;
      const x = cx + Math.cos(angle) * dist;
      const y = cy + Math.sin(angle) * dist;
      const opacity = 0.3 + rand(6 + i) * 0.5;
      const color = [c1, c2, c3][Math.floor(rand(7 + i) * 3)];
      result.push(`<circle cx="${x}" cy="${y}" r="${r}" fill="${color}" opacity="${opacity}"/>`);
    }

    // 连线
    const lines = 3 + Math.floor(rand(20) * 4);
    for (let i = 0; i < lines; i++) {
      const a1 = rand(21 + i) * Math.PI * 2;
      const a2 = rand(22 + i) * Math.PI * 2;
      const d1 = size * 0.15 + rand(23 + i) * size * 0.25;
      const d2 = size * 0.15 + rand(24 + i) * size * 0.25;
      const x1 = cx + Math.cos(a1) * d1;
      const y1 = cy + Math.sin(a1) * d1;
      const x2 = cx + Math.cos(a2) * d2;
      const y2 = cy + Math.sin(a2) * d2;
      result.push(
        `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c2}" stroke-width="0.5" opacity="0.2"/>`
      );
    }

    // 外环
    const ringR = size * 0.35 + rand(30) * size * 0.05;
    result.push(
      `<circle cx="${cx}" cy="${cy}" r="${ringR}" fill="none" stroke="${c3}" stroke-width="0.5" opacity="0.15" stroke-dasharray="4 4"/>`
    );

    // 外圈装饰点
    const dots = 12 + Math.floor(rand(31) * 8);
    for (let i = 0; i < dots; i++) {
      const angle = (i / dots) * Math.PI * 2;
      const x = cx + Math.cos(angle) * ringR;
      const y = cy + Math.sin(angle) * ringR;
      const r = 1 + rand(32 + i) * 2;
      result.push(`<circle cx="${x}" cy="${y}" r="${r}" fill="${c1}" opacity="0.4"/>`);
    }

    // 特质对应的形状
    if (traits.includes("理性") || traits.includes("技术宅")) {
      // 六边形
      const hexR = size * 0.25;
      const points = Array.from({ length: 6 }, (_, i) => {
        const a = (i / 6) * Math.PI * 2 - Math.PI / 6;
        return `${cx + Math.cos(a) * hexR},${cy + Math.sin(a) * hexR}`;
      }).join(" ");
      result.push(`<polygon points="${points}" fill="none" stroke="${c2}" stroke-width="1" opacity="0.2"/>`);
    }

    if (traits.includes("温柔") || traits.includes("感性")) {
      // 柔和的椭圆
      result.push(
        `<ellipse cx="${cx}" cy="${cy}" rx="${size * 0.3}" ry="${size * 0.22}" fill="none" stroke="${c1}" stroke-width="0.5" opacity="0.15" transform="rotate(${rand(40) * 30} ${cx} ${cy})"/>`
      );
    }

    return result.join("\n");
  }, [traits, name, size, c1, c2, c3]);

  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: 16,
      overflow: "hidden",
      background: `linear-gradient(135deg, ${c1}15, ${c3}08)`,
      border: `1px solid ${c1}30`,
    }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <radialGradient id={`glow-${name}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={c1} stopOpacity="0.15" />
            <stop offset="100%" stopColor={c1} stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx={size/2} cy={size/2} r={size*0.4} fill={`url(#glow-${name})`} />
        <g dangerouslySetInnerHTML={{ __html: shapes }} />
      </svg>
    </div>
  );
}
