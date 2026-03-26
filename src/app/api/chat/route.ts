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
  const { messages } = await req.json();

  const allHistory = messages.slice(0, -1).map((m: { role: string; content: string }) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  // Gemini requires history to start with 'user'
  const firstUserIdx = allHistory.findIndex((m) => m.role === "user");
  const history = firstUserIdx > 0 ? allHistory.slice(firstUserIdx) : allHistory;

  const lastMessage = messages[messages.length - 1].content;

  const chat = model.startChat({ history });
  const result = await chat.sendMessage(lastMessage);
  const text = result.response.text();

  return NextResponse.json({ text });
}
