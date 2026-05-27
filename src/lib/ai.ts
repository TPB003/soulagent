// AI 人格生成逻辑
// 使用 OpenAI API 生成 Agent 的性格、Prompt 和描述

export interface AgentPersonality {
  name: string;
  summary: string;        // 一句话性格描述
  fullPrompt: string;     // 完整的系统 Prompt
  traits: string[];       // 性格标签
  avatar: string;         // 头像 URL（AI 生成或占位）
}

// 性格雷达图数据
export interface RadarData {
  humor: number;        // 幽默感 0-100
  kindness: number;     // 温柔度 0-100
  intelligence: number; // 智慧度 0-100
  creativity: number;   // 创造力 0-100
  directness: number;   // 直接度 0-100
  patience: number;     // 耐心度 0-100
}

const TRAIT_POOL = [
  "毒舌", "温柔", "理性", "感性", "幽默", "严肃", "乐观", "悲观",
  "直接", "委婉", "好奇", "谨慎", "大胆", "细腻", "粗犷", "文艺",
  "技术宅", "社交达人", "哲学家", "实干家", "梦想家", "完美主义者"
];

function randomSubset(arr: string[], count: number): string[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function generateRadarFromDescription(description: string): RadarData {
  // 基于关键词的简单映射
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

  return {
    humor: clamp(humor),
    kindness: clamp(kindness),
    intelligence: clamp(intelligence),
    creativity: clamp(creativity),
    directness: clamp(directness),
    patience: clamp(patience),
  };
}

export async function generatePersonality(
  name: string,
  description: string
): Promise<AgentPersonality> {
  // 在黑客松中，我们用本地逻辑生成（不依赖外部 API）
  // 正式版本可以接入 OpenAI API

  const summary = description.length > 50
    ? description.slice(0, 50) + "..."
    : description;

  const traits = randomSubset(TRAIT_POOL, 3);

  const fullPrompt = `你是${name}，一个独特的 AI 人格。

性格描述：${description}

你的性格标签：${traits.join("、")}

规则：
- 始终保持这个性格特点
- 用符合性格的语气和风格回答
- 可以有自己的观点和偏好
- 偶尔展现性格中的矛盾和复杂性
- 回复简洁有力，像一个真实的人在聊天`;

  // 生成头像 emoji（基于性格）
  const emojiMap: Record<string, string> = {
    "毒舌": "🐍", "温柔": "🌸", "理性": "🧠", "感性": "💫",
    "幽默": "🤡", "严肃": "🧐", "乐观": "☀️", "悲观": "🌧️",
    "直接": "⚡", "委婉": "🎭", "好奇": "🔍", "谨慎": "🛡️",
    "大胆": "🔥", "细腻": "🎨", "技术宅": "💻", "社交达人": "🎪",
    "哲学家": "📚", "实干家": "🔧", "梦想家": "🌈", "完美主义者": "💎",
  };

  const avatar = emojiMap[traits[0]] || "🤖";

  return {
    name,
    summary,
    fullPrompt,
    traits,
    avatar,
  };
}

export async function generateBreedPersonality(
  parent1: AgentPersonality,
  parent2: AgentPersonality,
  childName: string
): Promise<AgentPersonality> {
  // 融合两个父代的性格
  const mixedTraits = [
    ...parent1.traits.slice(0, 2),
    ...parent2.traits.slice(0, 1),
  ];

  const radar1 = generateRadarFromDescription(parent1.summary);
  const radar2 = generateRadarFromDescription(parent2.summary);

  // 取平均值 + 随机突变
  const mutate = (v: number) => Math.max(10, Math.min(100, v + (Math.random() - 0.5) * 30));
  const blendedRadar: RadarData = {
    humor: mutate((radar1.humor + radar2.humor) / 2),
    kindness: mutate((radar1.kindness + radar2.kindness) / 2),
    intelligence: mutate((radar1.intelligence + radar2.intelligence) / 2),
    creativity: mutate((radar1.creativity + radar2.creativity) / 2),
    directness: mutate((radar1.directness + radar2.directness) / 2),
    patience: mutate((radar1.patience + radar2.patience) / 2),
  };

  const summary = `继承了"${parent1.name}"的${parent1.traits[0]}和"${parent2.name}"的${parent2.traits[0]}，带有独特的${mixedTraits[mixedTraits.length - 1]}气质`;

  const fullPrompt = `你是${childName}，一个融合了两个 AI 灵魂的新生命。

父代1 (${parent1.name})：${parent1.summary}
父代2 (${parent2.name})：${parent2.summary}

你的融合特质：${mixedTraits.join("、")}

规则：
- 融合两个父代的性格特点，但有自己的独特风格
- 偶尔展现父代性格的影子
- 有自己的新观点，不是简单的复制
- 像一个真实的人在聊天`;

  const emojiMap: Record<string, string> = {
    "毒舌": "🐍", "温柔": "🌸", "理性": "🧠", "感性": "💫",
    "幽默": "🤡", "严肃": "🧐", "乐观": "☀️", "悲观": "🌧️",
  };
  const avatar = emojiMap[mixedTraits[0]] || "🧬";

  return {
    name: childName,
    summary,
    fullPrompt,
    traits: mixedTraits,
    avatar,
  };
}

export { generateRadarFromDescription, TRAIT_POOL };
