import { useState, useRef } from "react";
import { Container, Typography, Stack, Alert, CircularProgress, Divider } from "@mui/material";
import mammoth from "mammoth";
import UploadPanel from "./components/UploadPanel";
import Timeline from "./components/Timeline";
import ExportBar from "./components/ExportBar";
import { analyzeAudio } from "./services/gemini";
import type { DialogueSegment, ProcessingStatus } from "./types/dialogue";

export default function App() {
  const [status, setStatus] = useState<ProcessingStatus>("idle");
  const [segments, setSegments] = useState<DialogueSegment[]>([]);
  const [audioUrl, setAudioUrl] = useState<string>();
  const [error, setError] = useState<string>();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const run = async (audio: File, trans?: File, key?: string) => {
    try {
      setError(undefined);
      setStatus("uploading");
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      const newUrl = URL.createObjectURL(audio);
      setAudioUrl(newUrl);

      let reference = "";
      if (trans) {
        const ext = trans.name.toLowerCase();
        if (ext.endsWith(".txt")) {
          reference = await trans.text();
        } else if (ext.endsWith(".docx")) {
          const arrayBuffer = await trans.arrayBuffer();
          const result = await mammoth.extractRawText({ arrayBuffer });
          reference = result.value;
        }
      }

      setStatus("analyzing");
      const data = await analyzeAudio(key!, audio, reference);
      setSegments(data.sort((a, b) => a.start_ms - b.start_ms));
      setStatus("completed");
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Processing failed. Please check your API key and file.");
      setStatus("error");
    }
  };

  const handleSeek = (timeMs: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = timeMs / 1000;
      audioRef.current.play().catch(() => {});
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 5 }}>
      <Stack spacing={3}>
        <div>
          <Typography variant="h3" fontWeight={800}>
            Podcast Speaker Timestamp Generator
          </Typography>
          <Typography color="text.secondary">
            Gemini-powered dialogue timeline for Xenon & Silica
          </Typography>
        </div>

        {error && <Alert severity="error">{error}</Alert>}

        <UploadPanel onRun={run} status={status} />

        {(status === "uploading" || status === "analyzing") && (
          <Stack direction="row" spacing={2} alignItems="center">
            <CircularProgress size={24} />
            <Typography>
              {status === "uploading"
                ? "Preparing audio and connecting to Gemini..."
                : "Analyzing speakers and generating timestamps with Gemini 2.5 Flash..."}
            </Typography>
          </Stack>
        )}

        {segments.length > 0 && (
          <>
            <Divider />
            <Typography variant="h5">Editable Timeline ({segments.length} segments)</Typography>
            <ExportBar segments={segments} />
            <Timeline
              segments={segments}
              setSegments={setSegments}
              audioUrl={audioUrl}
              audioRef={audioRef}
              onSeek={handleSeek}
            />
          </>
        )}
      </Stack>
    </Container>
  );
}