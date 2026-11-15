// Shared request/response bounds for /api/chat and /api/generate.
// Client call sites import these so the UI stays inside what the routes reject.

export const API_NAME_MAX = 32;
export const API_DESCRIPTION_MAX = 500;
export const API_PARENT_SUMMARY_MAX = 500;
export const API_CHAT_MESSAGE_MAX = 1000;
export const API_CHAT_MESSAGES_MAX = 10;
export const API_SUMMARY_MAX = 40;
export const API_PROMPT_MAX = 200;
export const API_TRAITS_MAX = 3;
export const API_BODY_MAX_CHARS = 24_000;
export const API_REPLY_MAX = 4_000;
export const API_TOKEN_ID_MAX = 1_000_000_000;

export const TRAIT_VOCAB = [
  "毒舌", "温柔", "理性", "感性", "幽默", "严肃", "乐观", "悲观",
  "直接", "委婉", "好奇", "谨慎", "大胆", "细腻", "粗犷", "文艺",
  "技术宅", "社交达人", "哲学家", "实干家", "梦想家", "完美主义者",
] as const;

export const TRAIT_SET: ReadonlySet<string> = new Set(TRAIT_VOCAB);

export const RADAR_KEYS = [
  "humor", "kindness", "intelligence", "creativity", "directness", "patience",
] as const;

export type RadarKey = (typeof RADAR_KEYS)[number];
export type Radar = Record<RadarKey, number>;
