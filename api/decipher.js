export default async function handler(req) {
  const apiKey = process.env.apiKey;
  if (!apiKey) {
    return Response.json({ code: 500, msg: "未配置API密钥" }, { status: 500 });
  }

  try {
    const { imageBase64, imageType } = await req.json();

    const prompt = `
你是专业古文字学家。
请分析图片中的古文字，给出：
1. 文字释读
2. 字形结构
3. 出处
4. 现代释义
只返回清晰结论。
`;

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              { inlineData: { mimeType: imageType, data: imageBase64 } }
            ]
          }],
          generationConfig: { temperature: 0.2 }
        })
      }
    );

    const data = await geminiRes.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "无结果";
    return Response.json({ code: 200, data: text });

  } catch (e) {
    return Response.json({ code: 500, error: e.message }, { status: 500 });
  }
}

export const config = { runtime: "edge" };
