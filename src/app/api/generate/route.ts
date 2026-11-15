// POST /api/generate
// Validates the caller's name/description/parents, then validates the model
// JSON before it can be minted. Upstream bodies are logged and not returned.

import { NextRequest, NextResponse } from "next/server";
import { API_BODY_MAX_CHARS, TRAIT_VOCAB } from "@/lib/api-limits";
import {
  abuseGateDecision,
  clientAddress,
  embedUserText,
  extractAssistantText,
  parseModelJson,
  rateHeaders,
  sanitizeModelPersonality,
  takeRateLimit,
  validateGenerateBody,
  type GenerateRequest,
} from "@/lib/api-guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const UPSTREAM_TIMEOUT_MS = 20_000;

function apiJson(body: Record<string, unknown>, status = 200, headers?: Record<string, string>) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store", ...headers },
  });
}

function upstreamChatUrl(): string | null {
  const raw = (process.env.XIAOMI_BASE_URL || "https://token-plan-cn.xiaomimimo.com/v1").trim();
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:") return null;
    const path = url.pathname.replace(/\/$/, "");
    return `${url.origin}${path}/chat/completions`;
  } catch {
    return null;
  }
}

function logUpstream(status: number, body: string) {
  const snippet = body.slice(0, 300).replace(/Bearer\s+\S+/gi, "Bearer [redacted]");
  console.error(`[generate] upstream ${status}: ${snippet}`);
}

function systemPrompt(): string {
  return `你是 AI 人格生成器。必须严格返回 JSON，不要有任何额外文字或 markdown 标记。

返回格式（严格遵守）：
{"summary":"20字以内性格描述","fullPrompt":"100字以内的系统提示词，包含性格规则","traits":["标签1","标签2","标签3"],"radar":{"humor":数字,"kindness":数字,"intelligence":数字,"creativity":数字,"directness":数字,"patience":数字}}

重要规则：
- traits 必须恰好 3 个，必须从以下词库中选择（一字不差）：${TRAIT_VOCAB.join("、")}
- radar 每个值是 10-100 的整数
- summary 不超过 20 个字，fullPrompt 不超过 100 个字
- 只返回 JSON，不要任何解释`;
}

function userPrompt(input: GenerateRequest): string {
  if (input.mode === "breed") {
    const tags = (traits: string[]) => traits.join("、") || "无";
    return `融合两个 AI 灵魂，创造新生命。

父代1：${embedUserText(input.parent1.name)}，性格：${embedUserText(input.parent1.summary)}，标签：${tags(input.parent1.traits)}
父代2：${embedUserText(input.parent2.name)}，性格：${embedUserText(input.parent2.summary)}，标签：${tags(input.parent2.traits)}

子代名字：${embedUserText(input.name)}

融合双方特质，但有自己的独特个性。直接返回 JSON。`;
  }

  return `为一个 AI Agent 生成人格。

名字：${embedUserText(input.name)}
用户描述：${embedUserText(input.description)}

根据描述提炼 3 个最匹配的性格标签，生成性格描述和系统提示词。直接返回 JSON。`;
}

export async function POST(req: NextRequest) {
  try {
    if (!abuseGateDecision({
      origin: req.headers.get("origin"),
      referer: req.headers.get("referer"),
      host: req.headers.get("host"),
      forwardedHost: req.headers.get("x-forwarded-host"),
    }).ok) {
      return apiJson({ error: "forbidden" }, 403);
    }

    const contentType = req.headers.get("content-type") || "";
    if (!contentType.toLowerCase().includes("application/json")) {
      return apiJson({ error: "invalid_request" }, 400);
    }

    const raw = await req.text();
    if (raw.length > API_BODY_MAX_CHARS) return apiJson({ error: "payload_too_large" }, 413);

    let body: unknown;
    try {
      body = JSON.parse(raw);
    } catch {
      return apiJson({ error: "invalid_request" }, 400);
    }

    const parsed = validateGenerateBody(body);
    if (!parsed.ok) {
      console.warn(`[generate] rejected ${parsed.reason}`);
      return apiJson({ error: "invalid_request" }, 400);
    }

    const ip = clientAddress({
      vercelForwardedFor: req.headers.get("x-vercel-forwarded-for"),
      forwardedFor: req.headers.get("x-forwarded-for"),
      realIp: req.headers.get("x-real-ip"),
    });
    const limit = await takeRateLimit(ip, "generate");
    if (!limit.ok) return apiJson({ error: "rate_limited" }, 429, rateHeaders(limit));

    const apiKey = process.env.XIAOMI_API_KEY;
    const endpoint = upstreamChatUrl();
    if (!apiKey || !endpoint) return apiJson({ error: "ai_unavailable" }, 500);

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "mimo-v2.5-pro",
        messages: [
          { role: "system", content: systemPrompt() },
          { role: "user", content: userPrompt(parsed.value) },
        ],
        temperature: 0.8,
        max_tokens: 800,
      }),
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
      cache: "no-store",
    });

    if (!response.ok) {
      logUpstream(response.status, await response.text());
      return apiJson({ error: "ai_failed" }, 502);
    }

    const data: unknown = await response.json();
    const content = data && typeof data === "object"
      ? (data as { choices?: { message?: { content?: unknown } }[] }).choices?.[0]?.message?.content
      : undefined;
    const text = extractAssistantText(content);
    if (!text) {
      console.error("[generate] upstream returned no text");
      return apiJson({ error: "ai_failed" }, 502);
    }

    const modelJson = parseModelJson(text);
    const hint = parsed.value.mode === "breed"
      ? `${parsed.value.parent1.summary} ${parsed.value.parent2.summary}`
      : parsed.value.description;
    const personality = sanitizeModelPersonality(modelJson, { name: parsed.value.name, hint });
    if (!personality) {
      console.error("[generate] model JSON failed validation");
      return apiJson({ error: "ai_failed" }, 502);
    }

    return apiJson({
      summary: personality.summary,
      fullPrompt: personality.fullPrompt,
      traits: personality.traits,
      radar: personality.radar,
    }, 200, rateHeaders(limit));
  } catch (err) {
    console.error("[generate] failed", err instanceof Error ? err.message : "error");
    return apiJson({ error: "ai_failed" }, 500);
  }
}
