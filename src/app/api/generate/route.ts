// API Route: /api/generate
// 服务端调用小米 MiMo API，不暴露 API Key 给前端

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { name, description, mode, parent1, parent2 } = await req.json();

    const apiKey = process.env.XIAOMI_API_KEY;
    const baseUrl = process.env.XIAOMI_BASE_URL || "https://token-plan-cn.xiaomimimo.com/v1";

    if (!apiKey) {
      return NextResponse.json({ error: "XIAOMI_API_KEY not configured" }, { status: 500 });
    }

    let systemPrompt: string;
    let userPrompt: string;

    if (mode === "breed" && parent1 && parent2) {
      systemPrompt = `你是 AI 人格生成器。必须严格返回 JSON，不要有任何额外文字或 markdown 标记。

返回格式（严格遵守）：
{"summary":"20字以内性格描述","fullPrompt":"100字以内的系统提示词，包含性格规则","traits":["标签1","标签2","标签3"],"radar":{"humor":数字,"kindness":数字,"intelligence":数字,"creativity":数字,"directness":数字,"patience":数字}}

重要规则：
- traits 必须恰好 3 个，必须从以下词库中选择（一字不差）：毒舌、温柔、理性、感性、幽默、严肃、乐观、悲观、直接、委婉、好奇、谨慎、大胆、细腻、粗犷、文艺、技术宅、社交达人、哲学家、实干家、梦想家、完美主义者
- radar 每个值是 10-100 的整数
- 只返回 JSON，不要任何解释`;

      userPrompt = `融合两个 AI 灵魂，创造新生命。

父代1：${parent1.name}，性格：${parent1.summary}，标签：${parent1.traits.join("、")}
父代2：${parent2.name}，性格：${parent2.summary}，标签：${parent2.traits.join("、")}

子代名字：${name}

融合双方特质，但有自己的独特个性。直接返回 JSON。`;
    } else {
      systemPrompt = `你是 AI 人格生成器。必须严格返回 JSON，不要有任何额外文字或 markdown 标记。

返回格式（严格遵守）：
{"summary":"20字以内性格描述","fullPrompt":"100字以内的系统提示词，包含性格规则","traits":["标签1","标签2","标签3"],"radar":{"humor":数字,"kindness":数字,"intelligence":数字,"creativity":数字,"directness":数字,"patience":数字}}

重要规则：
- traits 必须恰好 3 个，必须从以下词库中选择（一字不差）：毒舌、温柔、理性、感性、幽默、严肃、乐观、悲观、直接、委婉、好奇、谨慎、大胆、细腻、粗犷、文艺、技术宅、社交达人、哲学家、实干家、梦想家、完美主义者
- radar 每个值是 10-100 的整数
- 只返回 JSON，不要任何解释`;

      userPrompt = `为一个 AI Agent 生成人格。

名字：${name}
用户描述：${description}

根据描述提炼 3 个最匹配的性格标签，生成性格描述和系统提示词。直接返回 JSON。`;
    }

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "mimo-v2.5-pro",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.8,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("MiMo API error:", errText);
      return NextResponse.json({ error: "AI API call failed", detail: errText }, { status: 502 });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // 解析 JSON（处理可能的 markdown 代码块包裹）
    let parsed;
    try {
      const jsonStr = content.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
      parsed = JSON.parse(jsonStr);
    } catch {
      console.error("Failed to parse AI response:", content);
      return NextResponse.json({ error: "AI returned invalid JSON", raw: content }, { status: 502 });
    }

    return NextResponse.json(parsed);
  } catch (err: unknown) {
    console.error("Generate API error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
