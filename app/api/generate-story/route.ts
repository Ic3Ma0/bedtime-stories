import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const apiKey = process.env.KIMI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Kimi API Key 未配置，请在 .env.local 中设置 KIMI_API_KEY" },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { prompt } = body;

    if (!prompt) {
      return NextResponse.json({ error: "缺少 prompt 参数" }, { status: 400 });
    }

    const res = await fetch("https://api.moonshot.cn/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "moonshot-v1-8k",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.9,
        max_tokens: 2048,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return NextResponse.json(
        { error: err.error?.message || `Kimi API 错误: ${res.statusText}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content || "";

    return NextResponse.json({ text });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "服务器内部错误" },
      { status: 500 }
    );
  }
}
