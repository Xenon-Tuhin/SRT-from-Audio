import type { DialogueSegment } from "../types/dialogue";
import { srtTime, formatMs } from "./timestamp";

const dl = (name: string, data: string, type: string) => {
  const blob = new Blob([data], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const exportJSON = (s: DialogueSegment[]) =>
  dl("timeline.json", JSON.stringify({ segments: s }, null, 2), "application/json");

export const exportCSV = (s: DialogueSegment[]) => {
  const rows = s.map(x => `${x.speaker},${x.start_ms},${x.end_ms},"${(x.text || "").replace(/"/g, '""')}"`);
  dl("timeline.csv", "speaker,start_ms,end_ms,text\n" + rows.join("\n"), "text/csv");
};

export const exportTXT = (s: DialogueSegment[]) =>
  dl("timeline.txt", s.map(x => `[${formatMs(x.start_ms)}] ${x.speaker}\n${x.text}`).join("\n\n"), "text/plain");

export const exportSRT = (s: DialogueSegment[]) =>
  dl(
    "timeline.srt",
    s.map((x, i) => `${i + 1}\n${srtTime(x.start_ms)} --> ${srtTime(x.end_ms)}\n[${x.speaker}] ${x.text}`).join("\n\n"),
    "text/plain"
  );