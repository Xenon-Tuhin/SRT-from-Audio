import { GoogleGenAI, createPartFromBase64 } from "@google/genai";
import type { DialogueSegment, Speaker } from "../types/dialogue";

const prompt = `Analyze this podcast audio. There are exactly two primary speakers: Xenon (male) and Silica (female).
Create a complete chronological dialogue timeline. Transcribe ONLY what is spoken. Do not add, remove, summarize, rewrite, or correct words.
Bangla words must use Bengali script. English words, names and technical terms must remain in English spelling.
Detect speaker changes. Return accurate start_ms and end_ms in milliseconds. Split long dialogue into short readable subtitle blocks at natural pauses.
Return JSON only matching: {"segments":[{"speaker":"Xenon","start_ms":0,"end_ms":8500,"text":"..."}]}.`;

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.substring(result.indexOf(",") + 1);
      resolve(base64);
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

function cleanJsonResponse(raw: string): string {
  let text = raw.trim();
  // Remove markdown code fence if present
  if (text.startsWith("```")) {
    text = text.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```\s*$/, "").trim();
  }
  // If there's still surrounding text, try extracting JSON object
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    text = text.slice(start, end + 1);
  }
  return text;
}

export async function analyzeAudio(
  apiKey: string,
  file: File,
  referenceTranscript?: string
): Promise<DialogueSegment[]> {
  const ai = new GoogleGenAI({ apiKey });
  const base64Data = await fileToBase64(file);
  const mimeType = file.type || "audio/mpeg";
  const audioPart = createPartFromBase64(base64Data, mimeType);

  const extra = referenceTranscript
    ? `\nReference transcript (reference only; audio is source of truth):\n${referenceTranscript}`
    : "";

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [audioPart, { text: prompt + extra }],
    config: { responseMimeType: "application/json" },
  });

  const rawText = response.text || "";
  const cleaned = cleanJsonResponse(rawText);

  let parsed: any;
  try {
    parsed = JSON.parse(cleaned);
  } catch (err) {
    throw new Error(`Failed to parse response from Gemini: ${rawText.slice(0, 200)}...`);
  }

  if (!parsed || !Array.isArray(parsed.segments)) {
    throw new Error("Invalid Gemini response structure: missing 'segments' array");
  }

  return parsed.segments.map((x: any, i: number) => ({
    id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `seg-${Date.now()}-${i}`,
    speaker: (x.speaker === "Silica" ? "Silica" : "Xenon") as Speaker,
    start_ms: Number(x.start_ms) || 0,
    end_ms: Number(x.end_ms) || 0,
    text: String(x.text || ""),
  }));
}