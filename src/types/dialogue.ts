export type Speaker = "Xenon" | "Silica";
export interface DialogueSegment { id: string; speaker: Speaker; start_ms: number; end_ms: number; text: string; }
export interface ProcessingResult { audioFileName: string; duration_ms: number; segments: DialogueSegment[]; }
export type ProcessingStatus = "idle"|"uploading"|"analyzing"|"completed"|"error";