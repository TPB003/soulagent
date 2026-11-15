// AI 人格生成逻辑
// 通过 /api/generate 调用小米 MiMo API

import { API_DESCRIPTION_MAX, API_NAME_MAX, API_PARENT_SUMMARY_MAX, API_PROMPT_MAX, API_SUMMARY_MAX, API_TRAITS_MAX, TRAIT_SET } from "./api-limits";

function clip(value: string, max: number): string {
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").trim().slice(0, max);
}

function clipName(value: string): string {
  return value.replace(/[\u0000-\u001F]/g, "").trim().slice(0, API_NAME_MAX);
}

export interface AgentPersonality {
  name: string;
  summary: string;        // 一句话性格描述
  fullPrompt: string;     // 完整的系统 Prompt
  traits: string[];       // 性格标签
  avatar: string;         // 头像 emoji
}

// 性格雷达图数据
export interface RadarData {
  humor: number;
  kindness: number;
  intelligence: number;
  creativity: number;
  directness: number;
  patience: number;
}

// emoji 映射
const EMOJI_MAP: Record<string, string> = {
  "毒舌": "🐍", "温柔": "🌸", "理性": "🧠", "感性": "💫",
  "幽默": "🤡", "严肃": "🧐", "乐观": "☀️", "悲观": "🌧️",
  "直接": "⚡", "委婉": "🎭", "好奇": "🔍", "谨慎": "🛡️",
  "大胆": "🔥", "细腻": "🎨", "粗犷": "🪨", "文艺": "🖋️",
  "技术宅": "💻", "社交达人": "🎪", "哲学家": "📚", "实干家": "🔧",
  "梦想家": "🌈", "完美主义者": "💎",
};

// 关键词 → 雷达数据（AI 未返回 radar 时的 fallback）
function generateRadarFromDescription(description: string): RadarData {
  const lower = description.toLowerCase();
  let humor = 50, kindness = 50, intelligence = 50, creativity = 50, directness = 50, patience = 50;

  if (lower.includes("幽默") || lower.includes("搞笑")) humor += 30;
  if (lower.includes("毒舌") || lower.includes("犀利")) { humor += 10; directness += 30; kindness -= 20; }
  if (lower.includes("温柔") || lower.includes("温暖")) { kindness += 30; patience += 20; }
  if (lower.includes("理性") || lower.includes("逻辑")) { intelligence += 20; directness += 10; }
  if (lower.includes("感性") || lower.includes("浪漫")) { creativity += 20; kindness += 10; }
  if (lower.includes("暴躁") || lower.includes("急躁")) { patience -= 30; directness += 20; }
  if (lower.includes("聪明") || lower.includes("天才")) intelligence += 30;
  if (lower.includes("创意") || lower.includes("天马行空")) creativity += 30;
  if (lower.includes("耐心") || lower.includes("细心")) patience += 30;
  if (lower.includes("直接") || lower.includes("直率")) directness += 25;

  const clamp = (v: number) => Math.max(10, Math.min(100, v));
  return { humor: clamp(humor), kindness: clamp(kindness), intelligence: clamp(intelligence), creativity: clamp(creativity), directness: clamp(directness), patience: clamp(patience) };
}

// 从 traits 选 emoji
function pickAvatar(traits: string[]): string {
  for (const t of traits) {
    if (EMOJI_MAP[t]) return EMOJI_MAP[t];
  }
  return "🤖";
}

// 生成人格（调用 /api/generate）
export async function generatePersonality(
  name: string,
  description: string
): Promise<AgentPersonality & { radar: RadarData }> {
  const safeName = clipName(name);
  const safeDescription = clip(description, API_DESCRIPTION_MAX);
  try {
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: safeName, description: safeDescription, mode: "create" }),
    });

    if (!res.ok) {
      throw new Error(`API returned ${res.status}`);
    }

    const data = await res.json();

    if (data.error) {
      throw new Error(typeof data.error === "string" ? data.error : "generate_failed");
    }

    const traits = Array.isArray(data.traits) ? data.traits.filter((t: unknown) => typeof t === "string").slice(0, API_TRAITS_MAX) : [];
    const radar: RadarData = data.radar || generateRadarFromDescription(safeDescription);
    const summary = typeof data.summary === "string" && data.summary.trim() ? data.summary.slice(0, API_SUMMARY_MAX) : safeDescription.slice(0, API_SUMMARY_MAX);
    const fullPrompt = typeof data.fullPrompt === "string" && data.fullPrompt.trim()
      ? data.fullPrompt.slice(0, API_PROMPT_MAX)
      : `你是${safeName}，${safeDescription}`.slice(0, API_PROMPT_MAX);

    return {
      name: safeName,
      summary,
      fullPrompt,
      traits,
      avatar: pickAvatar(traits),
      radar,
    };
  } catch (err) {
    console.error("AI generation failed, using fallback:", err);
    // Fallback 到本地逻辑
    const TRAIT_POOL = ["毒舌", "温柔", "理性", "感性", "幽默", "严肃", "乐观", "直接", "好奇", "大胆", "技术宅", "哲学家", "梦想家", "完美主义者"];
    const shuffled = [...TRAIT_POOL].sort(() => Math.random() - 0.5);
    const traits = shuffled.slice(0, 3);

    return {
      name: safeName,
      summary: safeDescription.length > 50 ? safeDescription.slice(0, 50) + "..." : safeDescription,
      fullPrompt: `你是${safeName}，一个独特的 AI 人格。性格描述：${safeDescription}。你的性格标签：${traits.join("、")}。始终保持这个性格特点，用符合性格的语气和风格回答。`.slice(0, API_PROMPT_MAX),
      traits,
      avatar: pickAvatar(traits),
      radar: generateRadarFromDescription(safeDescription),
    };
  }
}

// 融合两个父代的性格
export async function generateBreedPersonality(
  parent1: AgentPersonality,
  parent2: AgentPersonality,
  childName: string
): Promise<AgentPersonality & { radar: RadarData }> {
  const safeChild = clipName(childName);
  const safeParent = (parent: AgentPersonality) => ({
    name: clipName(parent.name),
    summary: clip(parent.summary, API_PARENT_SUMMARY_MAX),
    traits: parent.traits.filter((trait) => TRAIT_SET.has(trait)).slice(0, API_TRAITS_MAX),
  });
  const p1 = safeParent(parent1);
  const p2 = safeParent(parent2);
  try {
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: safeChild,
        mode: "breed",
        parent1: p1,
        parent2: p2,
      }),
    });

    if (!res.ok) throw new Error(`API returned ${res.status}`);

    const data = await res.json();
    if (data.error) throw new Error(typeof data.error === "string" ? data.error : "generate_failed");

    const traits = Array.isArray(data.traits) ? data.traits.filter((t: unknown) => typeof t === "string").slice(0, API_TRAITS_MAX) : [];
    const radar: RadarData = data.radar || {
      humor: 50, kindness: 50, intelligence: 50,
      creativity: 50, directness: 50, patience: 50,
    };

    return {
      name: safeChild,
      summary: typeof data.summary === "string" && data.summary.trim() ? data.summary.slice(0, API_SUMMARY_MAX) : `继承了${p1.name}和${p2.name}的融合灵魂`.slice(0, API_SUMMARY_MAX),
      fullPrompt: typeof data.fullPrompt === "string" && data.fullPrompt.trim() ? data.fullPrompt.slice(0, API_PROMPT_MAX) : `你是${safeChild}，融合了${p1.name}和${p2.name}的灵魂。`.slice(0, API_PROMPT_MAX),
      traits,
      avatar: pickAvatar(traits),
      radar,
    };
  } catch (err) {
    console.error("AI breed failed, using fallback:", err);
    const mixedTraits = [...p1.traits.slice(0, 2), ...p2.traits.slice(0, 1)];
    return {
      name: safeChild,
      summary: `继承了"${p1.name}"的${p1.traits[0] || "特质"}和"${p2.name}"的${p2.traits[0] || "特质"}`.slice(0, API_SUMMARY_MAX),
      fullPrompt: `你是${safeChild}，融合了两个AI灵魂的新生命。`,
      traits: mixedTraits,
      avatar: pickAvatar(mixedTraits),
      radar: { humor: 50, kindness: 50, intelligence: 50, creativity: 50, directness: 50, patience: 50 },
    };
  }
}

export { generateRadarFromDescription, EMOJI_MAP };
