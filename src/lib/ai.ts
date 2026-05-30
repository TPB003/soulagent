// AI 人格生成逻辑
// 通过 /api/generate 调用小米 MiMo API

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
  try {
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description, mode: "create" }),
    });

    if (!res.ok) {
      throw new Error(`API returned ${res.status}`);
    }

    const data = await res.json();

    if (data.error) {
      throw new Error(data.error);
    }

    const traits = data.traits || [];
    const radar: RadarData = data.radar || generateRadarFromDescription(description);

    return {
      name,
      summary: data.summary || description.slice(0, 50),
      fullPrompt: data.fullPrompt || `你是${name}，${description}`,
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
      name,
      summary: description.length > 50 ? description.slice(0, 50) + "..." : description,
      fullPrompt: `你是${name}，一个独特的 AI 人格。性格描述：${description}。你的性格标签：${traits.join("、")}。始终保持这个性格特点，用符合性格的语气和风格回答。`,
      traits,
      avatar: pickAvatar(traits),
      radar: generateRadarFromDescription(description),
    };
  }
}

// 融合两个父代的性格
export async function generateBreedPersonality(
  parent1: AgentPersonality,
  parent2: AgentPersonality,
  childName: string
): Promise<AgentPersonality & { radar: RadarData }> {
  try {
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: childName,
        mode: "breed",
        parent1: { name: parent1.name, summary: parent1.summary, traits: parent1.traits },
        parent2: { name: parent2.name, summary: parent2.summary, traits: parent2.traits },
      }),
    });

    if (!res.ok) throw new Error(`API returned ${res.status}`);

    const data = await res.json();
    if (data.error) throw new Error(data.error);

    const traits = data.traits || [];
    const radar: RadarData = data.radar || {
      humor: 50, kindness: 50, intelligence: 50,
      creativity: 50, directness: 50, patience: 50,
    };

    return {
      name: childName,
      summary: data.summary || `继承了${parent1.name}和${parent2.name}的融合灵魂`,
      fullPrompt: data.fullPrompt || `你是${childName}，融合了${parent1.name}和${parent2.name}的灵魂。`,
      traits,
      avatar: pickAvatar(traits),
      radar,
    };
  } catch (err) {
    console.error("AI breed failed, using fallback:", err);
    const mixedTraits = [...parent1.traits.slice(0, 2), ...parent2.traits.slice(0, 1)];
    return {
      name: childName,
      summary: `继承了"${parent1.name}"的${parent1.traits[0]}和"${parent2.name}"的${parent2.traits[0]}`,
      fullPrompt: `你是${childName}，融合了两个AI灵魂的新生命。`,
      traits: mixedTraits,
      avatar: pickAvatar(mixedTraits),
      radar: { humor: 50, kindness: 50, intelligence: 50, creativity: 50, directness: 50, patience: 50 },
    };
  }
}

export { generateRadarFromDescription, EMOJI_MAP };
