import { anthropic } from "@/lib/anthropic";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { image } = await req.json();

    console.log("1. Image received, length:", image.length);

    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20240620",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text:
                "この画像はおみくじです。おみくじの内容から項目とその内容を読み取って、以下のようなJSON形式で返してください：\n" +
                "{\n" +
                '  "項目1": "内容1",\n' +
                '  "項目2": "内容2",\n' +
                "  ...\n" +
                "}\n" +
                "例：総運、願事、待人などの項目とその内容を抽出してください。\n" +
                "必ずJSONとして解析可能な形式で返してください。",
            },
            {
              type: "image",
              source: {
                type: "base64",
                media_type: "image/jpeg",
                data: image.replace(/^data:image\/\w+;base64,/, ""),
              },
            },
          ],
        },
      ],
    });
    console.log("2. API Response:", message);

    const content = message.content[0];
    console.log("3. Content:", content);

    if ("text" in content) {
      const result = content.text;
      console.log("4. Parsed text:", result);
      return NextResponse.json(result);
    } else {
      console.log("4. No text found in content");
      return NextResponse.json(
        { error: "テキストの解析に失敗しました" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "処理中にエラーが発生しました" }),
      { status: 500 }
    );
  }
}
