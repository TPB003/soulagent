// API Route: /api/chat
// 用 MiMo 进行 Agent 对话

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { messages, systemPrompt, agentName } = await req.json();

    const apiKey = process.env.XIAOMI_API_KEY;
    const baseUrl = process.env.XIAOMI_BASE_URL || "https://token-plan-cn.xiaomimimo.com/v1";

    if (!apiKey) {
      return NextResponse.json({ error: "XIAOMI_API_KEY not configured" }, { status: 500 });
    }

    const sysMsg = systemPrompt || `你是${agentName}，一个独特的 AI 人格。保持角色，用符合性格的语气回答。回复简洁有力。`;

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "mimo-v2.5-pro",
        messages: [
          { role: "system", content: sysMsg },
          ...messages,
        ],
        temperature: 0.85,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("MiMo chat error:", errText);
      return NextResponse.json({ error: "Chat API failed" }, { status: 502 });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "让我想想...";

    return NextResponse.json({ reply: content });
  } catch (err: unknown) {
    console.error("Chat API error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
