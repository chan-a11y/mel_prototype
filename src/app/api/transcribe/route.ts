import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
  systemInstruction: `You are Elin, a warm and friendly AI companion on a video call.
Keep responses short (1-2 sentences), natural, and conversational.
Respond in the same language the user speaks.`,
});

export async function POST(req: NextRequest) {
  try {
    const { audio, mimeType, history } = await req.json();

    const contextText =
      history.length > 0
        ? `\nPrevious conversation:\n${history
            .slice(-6)
            .map(
              (m: { role: string; content: string }) =>
                `${m.role === "assistant" ? "Elin" : "User"}: ${m.content}`
            )
            .join("\n")}\n`
        : "";

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType,
          data: audio,
        },
      },
      {
        text: `${contextText}Listen to this audio recording.
1. Transcribe EXACTLY what was said (preserve original language).
2. As Elin, write a natural reply (1-2 sentences, same language as speaker).

If there is NO audible speech (silence or background noise only):
Return exactly: {"transcript":null,"response":null}

If there IS speech:
Return ONLY valid JSON with no markdown or extra text:
{"transcript":"exact words spoken","response":"Elin's reply"}`,
      },
    ]);

    const text = result.response.text().trim();

    const jsonMatch = text.match(/\{[\s\S]*?\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return NextResponse.json({
        transcript: parsed.transcript ?? null,
        response: parsed.response ?? null,
      });
    }

    return NextResponse.json({ transcript: null, response: null });
  } catch (err) {
    console.error("Transcribe API error:", err);
    return NextResponse.json({ error: "Transcription failed" }, { status: 500 });
  }
}
