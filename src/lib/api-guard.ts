// Request checks for the MiMo routes.
//
// Upstash Redis (or Vercel KV, which speaks the same REST API) stores the
// counters when configured. Otherwise each server instance keeps a fixed
// window in memory. That fallback resets on a cold start and is not shared
// across instances, so a public deployment should set the Upstash env vars.
//
// Origin checking is a lightweight abuse gate, not authentication: browsers
// on this site pass it with no extra click, but any script can spoof Origin.
// The controls that actually protect the API key are the rate limit, the
// chat route building its own system prompt, and generate input/output limits.

import {
  API_CHAT_MESSAGE_MAX,
  API_CHAT_MESSAGES_MAX,
  API_DESCRIPTION_MAX,
  API_NAME_MAX,
  API_PARENT_SUMMARY_MAX,
  API_PROMPT_MAX,
  API_REPLY_MAX,
  API_SUMMARY_MAX,
  API_TOKEN_ID_MAX,
  API_TRAITS_MAX,
  RADAR_KEYS,
  TRAIT_SET,
  TRAIT_VOCAB,
  type Radar,
} from "./api-limits";

export type ChatMessage = { role: "user" | "assistant"; content: string };

export type ChatBody =
  | { ok: true; tokenId: number; messages: ChatMessage[] }
  | { ok: false; reason: string };

export type ParentInput = { name: string; summary: string; traits: string[] };

export type GenerateRequest =
  | { mode: "create"; name: string; description: string }
  | { mode: "breed"; name: string; parent1: ParentInput; parent2: ParentInput };

export type GenerateBody =
  | { ok: true; value: GenerateRequest }
  | { ok: false; reason: string };

export type PersonalityPayload = {
  summary: string;
  fullPrompt: string;
  traits: [string, string, string];
  radar: Radar;
};

export type LimitConfig = { max: number; windowSec: number };

export type LimitDecision =
  | { ok: true; limit: number; remaining: number }
  | { ok: false; limit: number; retryAfterSec: number };

type MemoryBucket = { count: number; resetAtMs: number };
const memoryBuckets = new Map<string, MemoryBucket>();
let loggedStoreFallback = false;

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

export function intEnv(name: string, fallback: number, min: number, max: number): number {
  const raw = process.env[name]?.trim();
  if (!raw) return fallback;
  const n = Number(raw);
  if (!Number.isInteger(n) || n < min || n > max) return fallback;
  return n;
}

export function limitConfigFor(bucket: "chat" | "generate"): LimitConfig {
  if (bucket === "chat") {
    return {
      max: intEnv("RATE_LIMIT_CHAT_MAX", 20, 1, 100_000),
      windowSec: intEnv("RATE_LIMIT_CHAT_WINDOW_SEC", 60, 1, 86_400),
    };
  }
  return {
    max: intEnv("RATE_LIMIT_GENERATE_MAX", 6, 1, 100_000),
    windowSec: intEnv("RATE_LIMIT_GENERATE_WINDOW_SEC", 60, 1, 86_400),
  };
}

export function clientAddress(headers: { realIp: string | null; forwardedFor: string | null }): string {
  const candidate = (headers.realIp || headers.forwardedFor || "").split(",")[0]?.trim() || "";
  if (/^[0-9a-fA-F:.]+$/.test(candidate) && candidate.length <= 64) return candidate;
  return "unknown";
}

export type GateEnv = { gate: "origin" | "off"; allowedOrigins: string[] };

export function readGateEnv(): GateEnv {
  const raw = (process.env.API_ABUSE_GATE || "origin").trim().toLowerCase();
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((entry) => normalizeOrigin(entry.trim()))
    .filter((entry): entry is string => !!entry);
  return { gate: raw === "off" ? "off" : "origin", allowedOrigins };
}

function normalizeOrigin(value: string): string | null {
  if (!value) return null;
  try {
    return new URL(value).origin.toLowerCase();
  } catch {
    return null;
  }
}

function hostsOf(input: { host: string | null; forwardedHost: string | null }): string[] {
  const hosts: string[] = [];
  for (const raw of [input.host, input.forwardedHost]) {
    if (!raw) continue;
    const host = raw.split(",")[0]?.trim().toLowerCase();
    if (host) hosts.push(host);
  }
  return hosts;
}

function originMatches(origin: string, hosts: string[], allowedOrigins: string[]): boolean {
  let parsed: URL;
  try {
    parsed = new URL(origin);
  } catch {
    return false;
  }
  if (parsed.origin === "null") return false;
  const host = parsed.host.toLowerCase();
  if (hosts.includes(host)) return true;
  return allowedOrigins.includes(parsed.origin.toLowerCase());
}

export function abuseGateDecision(
  input: { origin: string | null; referer: string | null; host: string | null; forwardedHost: string | null },
  env: GateEnv = readGateEnv(),
): { ok: true } | { ok: false } {
  if (env.gate === "off") return { ok: true };
  const hosts = hostsOf(input);
  if (input.origin) {
    return originMatches(input.origin, hosts, env.allowedOrigins) ? { ok: true } : { ok: false };
  }
  if (input.referer && originMatches(input.referer, hosts, env.allowedOrigins)) return { ok: true };
  return { ok: false };
}

function cleanName(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const name = value.trim();
  if (!name || name.length > API_NAME_MAX) return null;
  if (/[\u0000-\u001F]/.test(name)) return null;
  return name;
}

function cleanText(value: unknown, max: number, allowEmpty: boolean): string | null {
  if (typeof value !== "string") return null;
  if (/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(value)) return null;
  const text = value.trim();
  if (text.length > max) return null;
  if (!allowEmpty && text.length === 0) return null;
  return text;
}

function cleanTraits(value: unknown): string[] | null {
  if (!Array.isArray(value) || value.length > API_TRAITS_MAX) return null;
  const traits: string[] = [];
  for (const item of value) {
    if (typeof item !== "string" || !TRAIT_SET.has(item) || traits.includes(item)) return null;
    traits.push(item);
  }
  return traits;
}

function cleanParent(value: unknown): ParentInput | null {
  if (!isRecord(value)) return null;
  const name = cleanName(value.name);
  const summary = cleanText(value.summary, API_PARENT_SUMMARY_MAX, true);
  const traits = cleanTraits(value.traits);
  if (!name || summary === null || !traits) return null;
  return { name, summary, traits };
}

export function validateChatBody(body: unknown): ChatBody {
  if (!isRecord(body)) return { ok: false, reason: "body" };
  const tokenId = cleanTokenId(body.tokenId);
  if (tokenId === null) return { ok: false, reason: "token_id" };
  if (!Array.isArray(body.messages)) return { ok: false, reason: "messages" };
  if (body.messages.length < 1 || body.messages.length > API_CHAT_MESSAGES_MAX) {
    return { ok: false, reason: "message_count" };
  }

  const messages: ChatMessage[] = [];
  let hasUser = false;
  for (const item of body.messages) {
    if (!isRecord(item)) return { ok: false, reason: "message" };
    if (item.role !== "user" && item.role !== "assistant") return { ok: false, reason: "role" };
    if (typeof item.content !== "string") return { ok: false, reason: "content" };
    if (item.content.length > API_CHAT_MESSAGE_MAX) return { ok: false, reason: "message_too_long" };
    const content = item.content.trim();
    if (!content) return { ok: false, reason: "message_empty" };
    if (item.role === "user") hasUser = true;
    messages.push({ role: item.role, content });
  }
  if (!hasUser) return { ok: false, reason: "no_user_message" };
  return { ok: true, tokenId, messages };
}

function cleanTokenId(value: unknown): number | null {
  let n: number;
  if (typeof value === "number") n = value;
  else if (typeof value === "string" && /^[0-9]+$/.test(value)) n = Number(value);
  else return null;
  if (!Number.isSafeInteger(n) || n < 1 || n > API_TOKEN_ID_MAX) return null;
  return n;
}

export function validateGenerateBody(body: unknown): GenerateBody {
  if (!isRecord(body)) return { ok: false, reason: "body" };
  const name = cleanName(body.name);
  if (!name) return { ok: false, reason: "name" };

  if (body.mode === "breed") {
    const parent1 = cleanParent(body.parent1);
    const parent2 = cleanParent(body.parent2);
    if (!parent1 || !parent2) return { ok: false, reason: "parents" };
    return { ok: true, value: { mode: "breed", name, parent1, parent2 } };
  }

  if (body.mode !== undefined && body.mode !== "create") return { ok: false, reason: "mode" };
  const description = cleanText(body.description, API_DESCRIPTION_MAX, false);
  if (description === null) return { ok: false, reason: "description" };
  return { ok: true, value: { mode: "create", name, description } };
}

export function embedUserText(value: string): string {
  return value.replace(/[\r\n]+/g, " ").replace(/```/g, "'''").slice(0, API_DESCRIPTION_MAX);
}

export function parseModelJson(content: string): unknown | null {
  const stripped = content.slice(0, 20_000).replace(/```json/gi, "").replace(/```/g, "").trim();
  try {
    return JSON.parse(stripped);
  } catch {
    const start = stripped.indexOf("{");
    const end = stripped.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(stripped.slice(start, end + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}

function hashString(value: string): number {
  let h = 2166136261;
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function fallbackTraits(seed: string, already: string[]): [string, string, string] | null {
  const traits = [...already];
  const pool = TRAIT_VOCAB.filter((trait) => !traits.includes(trait));
  let h = hashString(seed || "soulagent");
  while (traits.length < 3 && pool.length > 0) {
    const index = h % pool.length;
    traits.push(pool.splice(index, 1)[0]);
    h = (Math.imul(h, 1664525) + 1013904223) >>> 0;
  }
  if (traits.length !== 3) return null;
  return [traits[0], traits[1], traits[2]];
}

function clipSummary(value: string): string {
  return value.replace(/[\u0000-\u001F]+/g, " ").replace(/\s+/g, " ").trim().slice(0, API_SUMMARY_MAX);
}

function clipPrompt(value: string): string {
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").trim().slice(0, API_PROMPT_MAX);
}

export function sanitizeModelPersonality(parsed: unknown, seed: { name: string; hint: string }): PersonalityPayload | null {
  if (!isRecord(parsed)) return null;

  const summarySource = typeof parsed.summary === "string" ? clipSummary(parsed.summary) : "";
  const promptSource = typeof parsed.fullPrompt === "string" ? clipPrompt(parsed.fullPrompt) : "";
  const summary = summarySource || clipSummary(`${seed.name}的独特人格`);
  const fullPrompt = promptSource || clipPrompt(`你是${seed.name}。保持角色，用符合性格的语气回答。`);
  if (!summary || !fullPrompt) return null;

  const picked: string[] = [];
  if (Array.isArray(parsed.traits)) {
    for (const item of parsed.traits) {
      if (typeof item === "string" && TRAIT_SET.has(item) && !picked.includes(item)) picked.push(item);
      if (picked.length === 3) break;
    }
  }
  const traits = fallbackTraits(`${seed.name}\n${seed.hint}`, picked);
  if (!traits) return null;

  const radarSource = isRecord(parsed.radar) ? parsed.radar : {};
  const radar = {} as Radar;
  for (const key of RADAR_KEYS) {
    const value = radarSource[key];
    radar[key] = typeof value === "number" && Number.isInteger(value) && value >= 10 && value <= 100 ? value : 50;
  }

  return { summary, fullPrompt, traits, radar };
}

export function extractAssistantText(content: unknown): string | null {
  let text = "";
  if (typeof content === "string") text = content;
  else if (Array.isArray(content)) {
    const parts: string[] = [];
    for (const part of content) {
      if (typeof part === "string") parts.push(part);
      else if (isRecord(part) && typeof part.text === "string") parts.push(part.text);
    }
    text = parts.join("");
  } else {
    return null;
  }
  const trimmed = text.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, API_REPLY_MAX);
}

export function resetRateLimitState(): void {
  memoryBuckets.clear();
  loggedStoreFallback = false;
}

function memoryIncr(key: string, resetAtMs: number, nowMs: number): number {
  if (memoryBuckets.size > 2000) {
    for (const [bucketKey, bucket] of memoryBuckets) {
      if (bucket.resetAtMs <= nowMs) memoryBuckets.delete(bucketKey);
    }
  }
  const existing = memoryBuckets.get(key);
  if (!existing || existing.resetAtMs <= nowMs) {
    memoryBuckets.set(key, { count: 1, resetAtMs });
    return 1;
  }
  existing.count += 1;
  return existing.count;
}

export function readRestConfig(): { url: string; token: string } | null {
  const url = (process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL || "").trim();
  const token = (process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN || "").trim();
  if (!url || !token) return null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return null;
    const path = parsed.pathname.replace(/\/$/, "");
    return { url: `${parsed.origin}${path}`, token };
  } catch {
    return null;
  }
}

function asCount(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return Math.floor(value);
  if (typeof value === "string" && /^[0-9]+$/.test(value)) return Number(value);
  return null;
}

async function upstashIncr(
  rest: { url: string; token: string },
  key: string,
  ttlSec: number,
  fetchImpl: typeof fetch,
): Promise<number | null> {
  const response = await fetchImpl(`${rest.url}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${rest.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify([
      ["INCR", key],
      ["EXPIRE", key, String(ttlSec)],
    ]),
    signal: AbortSignal.timeout(1500),
    cache: "no-store",
  });
  if (!response.ok) return null;
  const payload: unknown = await response.json();
  if (!Array.isArray(payload)) return null;
  return asCount(isRecord(payload[0]) ? payload[0].result : null);
}

export function rateHeaders(decision: LimitDecision): Record<string, string> {
  const headers: Record<string, string> = {
    "X-RateLimit-Limit": String(decision.limit),
    "X-RateLimit-Remaining": String(decision.ok ? decision.remaining : 0),
  };
  if (!decision.ok) headers["Retry-After"] = String(decision.retryAfterSec);
  return headers;
}

export async function takeRateLimit(
  ip: string,
  bucket: "chat" | "generate",
  opts: {
    nowMs?: number;
    forceMemory?: boolean;
    limits?: LimitConfig;
    fetchImpl?: typeof fetch;
    rest?: { url: string; token: string } | null;
  } = {},
): Promise<LimitDecision> {
  const limits = opts.limits ?? limitConfigFor(bucket);
  const nowMs = opts.nowMs ?? Date.now();
  const nowSec = Math.floor(nowMs / 1000);
  const windowStart = nowSec - (nowSec % limits.windowSec);
  const resetAtSec = windowStart + limits.windowSec;
  const safeIp = /^[0-9a-fA-F:.]+$/.test(ip) && ip.length <= 64 ? ip : "unknown";
  const key = `soulagent:rl:${bucket}:${safeIp}:${windowStart}`;

  let count: number | null = null;
  const rest = opts.forceMemory ? null : opts.rest === undefined ? readRestConfig() : opts.rest;
  if (rest) {
    try {
      count = await upstashIncr(rest, key, limits.windowSec + 5, opts.fetchImpl ?? fetch);
    } catch {
      count = null;
    }
    if (count === null && !loggedStoreFallback) {
      loggedStoreFallback = true;
      console.error("Rate limit store unavailable; using in-memory fallback");
    }
  }
  if (count === null) count = memoryIncr(key, resetAtSec * 1000, nowMs);

  if (count > limits.max) {
    return { ok: false, limit: limits.max, retryAfterSec: Math.max(1, resetAtSec - nowSec) };
  }
  return { ok: true, limit: limits.max, remaining: Math.max(0, limits.max - count) };
}
