import type {DialogueSegment} from "../types/dialogue"; import {srtTime,formatMs} from "./timestamp";
const dl=(name:string,data:string,type:string)=>{const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([data],{type}));a.download=name;a.click();URL.revokeObjectURL(a.href)};
export const exportJSON=(s:DialogueSegment[])=>dl("timeline.json",JSON.stringify({segments:s},null,2),"application/json");
export const exportCSV=(s:DialogueSegment[])=>dl("timeline.csv","speaker,start_ms,end_ms,text\n"+s.map(x=>`${x.speaker},${x.start_ms},${x.end_ms},"${x.text.replaceAll('"','""')}"`).join("\n"),"text/csv");
export const exportTXT=(s:DialogueSegment[])=>dl("timeline.txt",s.map(x=>`[${formatMs(x.start_ms)}] ${x.speaker}\n${x.text}`).join("\n\n"),"text/plain");
export const exportSRT=(s:DialogueSegment[])=>dl("timeline.srt",s.map((x,i)=>`${i+1}\n${srtTime(x.start_ms)} --> ${srtTime(x.end_ms)}\n[${x.speaker}] ${x.text}`).join("\n\n"),"text/plain");