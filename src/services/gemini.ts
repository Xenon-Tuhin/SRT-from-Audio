import { GoogleGenAI, createPartFromUri } from "@google/genai";
import type { DialogueSegment, Speaker } from "../types/dialogue";

const prompt = `Analyze this podcast audio. There are exactly two primary speakers: Xenon (male) and Silica (female).
Create a complete chronological dialogue timeline. Transcribe ONLY what is spoken. Do not add, remove, summarize, rewrite, or correct words.
Bangla words must use Bengali script. English words, names and technical terms must remain in English spelling.
Detect speaker changes. Return accurate start_ms and end_ms in milliseconds. Split long dialogue into short readable subtitle blocks at natural pauses.
Return JSON only matching: {"segments":[{"speaker":"Xenon","start_ms":0,"end_ms":8500,"text":"..."}]}.`;

export async function analyzeAudio(apiKey:string,file:File,referenceTranscript?:string):Promise<DialogueSegment[]>{
  const ai=new GoogleGenAI({apiKey});
  // Browser SDK upload API. If the installed SDK version changes, update this call per its current Files API surface.
  const uploaded=await ai.files.upload({file,config:{mimeType:file.type||"audio/mpeg"}});
  if(!uploaded.uri) throw new Error("Gemini did not return a file URI");
  const extra=referenceTranscript?`\nReference transcript (reference only; audio is source of truth):\n${referenceTranscript}`:"";
  const response=await ai.models.generateContent({
    model:"gemini-3.7-flash",
    contents:[{role:"user",parts:[createPartFromUri(uploaded.uri,uploaded.mimeType||file.type),{text:prompt+extra}]}],
    config:{responseMimeType:"application/json"}
  });
  const text=response.text||"";
  const parsed=JSON.parse(text);
  if(!Array.isArray(parsed.segments)) throw new Error("Invalid Gemini response");
  return parsed.segments.map((x:any,i:number)=>({
    id:crypto.randomUUID?.()||String(i),
    speaker:(x.speaker==="Silica"?"Silica":"Xenon") as Speaker,
    start_ms:Number(x.start_ms)||0,
    end_ms:Number(x.end_ms)||0,
    text:String(x.text||"")
  }));
}