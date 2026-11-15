// POST /api/chat
// The browser sends a token id and user/assistant turns. The system prompt is
// built here from getAgent so this route cannot be used as an open MiMo proxy.

import { NextRequest, NextResponse } from "next/server";
import { API_BODY_MAX_CHARS } from "@/lib/api-limits";
import {
  abuseGateDecision,
  clientAddress,
  extractAssistantText,
  rateHeaders,
  takeRateLimit,
  validateChatBody,
} from "@/lib/api-guard";
import { buildChatSystemPrompt, fetchOnChainAgent } from "@/lib/onchain-agent";

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
  console.error(`[chat] upstream ${status}: ${snippet}`);
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

    const parsed = validateChatBody(body);
    if (!parsed.ok) {
      console.warn(`[chat] rejected ${parsed.reason}`);
      return apiJson({ error: "invalid_request" }, 400);
    }

    const ip = clientAddress({
      vercelForwardedFor: req.headers.get("x-vercel-forwarded-for"),
      forwardedFor: req.headers.get("x-forwarded-for"),
      realIp: req.headers.get("x-real-ip"),
    });
    const limit = await takeRateLimit(ip, "chat");
    if (!limit.ok) return apiJson({ error: "rate_limited" }, 429, rateHeaders(limit));

    let agent;
    try {
      agent = await fetchOnChainAgent(parsed.tokenId);
    } catch (err) {
      console.error("[chat] getAgent failed", err instanceof Error ? err.message : "error");
      return apiJson({ error: "unavailable" }, 503);
    }
    if (!agent) return apiJson({ error: "not_found" }, 404);

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
          { role: "system", content: buildChatSystemPrompt(agent, parsed.tokenId) },
          ...parsed.messages,
        ],
        temperature: 0.85,
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
    const reply = extractAssistantText(content);
    if (!reply) {
      console.error("[chat] upstream returned no assistant text");
      return apiJson({ error: "ai_failed" }, 502);
    }

    return apiJson({ reply }, 200, rateHeaders(limit));
  } catch (err) {
    console.error("[chat] failed", err instanceof Error ? err.message : "error");
    return apiJson({ error: "ai_failed" }, 500);
  }
}
