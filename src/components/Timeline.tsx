import React from "react";
import { Stack, Paper, Typography, TextField, IconButton, Button, Box } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import AddIcon from "@mui/icons-material/Add";
import type { DialogueSegment, Speaker } from "../types/dialogue";
import { formatMs } from "../utils/timestamp";

interface TimelineProps {
  segments: DialogueSegment[];
  setSegments: (s: DialogueSegment[]) => void;
  audioUrl?: string;
  audioRef?: React.RefObject<HTMLAudioElement | null>;
  onSeek?: (ms: number) => void;
}

export default function Timeline({ segments, setSegments, audioUrl, audioRef, onSeek }: TimelineProps) {
  const update = (id: string, k: keyof DialogueSegment, v: any) => {
    setSegments(segments.map((s) => (s.id === id ? { ...s, [k]: v } : s)));
  };

  const del = (id: string) => {
    setSegments(segments.filter((s) => s.id !== id));
  };

  const addSegment = () => {
    const lastSeg = segments[segments.length - 1];
    const start_ms = lastSeg ? lastSeg.end_ms : 0;
    const newSeg: DialogueSegment = {
      id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `seg-${Date.now()}`,
      speaker: lastSeg?.speaker === "Xenon" ? "Silica" : "Xenon",
      start_ms,
      end_ms: start_ms + 5000,
      text: "",
    };
    setSegments([...segments, newSeg]);
  };

  return (
    <Stack spacing={2}>
      {audioUrl && (
        <Paper sx={{ p: 2, position: "sticky", top: 16, zIndex: 10 }}>
          <audio ref={audioRef} controls src={audioUrl} style={{ width: "100%", display: "block" }} />
        </Paper>
      )}

      {segments.map((s, index) => (
        <Paper key={s.id} sx={{ p: 2 }}>
          <Stack spacing={1.5}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Button
                size="small"
                startIcon={<PlayArrowIcon />}
                onClick={() => onSeek?.(s.start_ms)}
                sx={{ textTransform: "none" }}
              >
                {formatMs(s.start_ms)} → {formatMs(s.end_ms)}
              </Button>
              <Typography variant="caption" color="text.secondary">
                #{index + 1}
              </Typography>
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center">
              <Button
                size="small"
                variant={s.speaker === "Xenon" ? "contained" : "outlined"}
                color={s.speaker === "Xenon" ? "primary" : "secondary"}
                onClick={() => update(s.id, "speaker", s.speaker === "Xenon" ? "Silica" : "Xenon")}
              >
                {s.speaker}
              </Button>
              <TextField
                size="small"
                label="Start ms"
                type="number"
                value={s.start_ms}
                onChange={(e) => update(s.id, "start_ms", Math.max(0, parseInt(e.target.value) || 0))}
                sx={{ width: 120 }}
              />
              <TextField
                size="small"
                label="End ms"
                type="number"
                value={s.end_ms}
                onChange={(e) => update(s.id, "end_ms", Math.max(0, parseInt(e.target.value) || 0))}
                sx={{ width: 120 }}
              />
              <Box sx={{ flexGrow: 1 }} />
              <IconButton color="error" size="small" onClick={() => del(s.id)}>
                <DeleteIcon />
              </IconButton>
            </Stack>

            <TextField
              multiline
              minRows={2}
              fullWidth
              placeholder="Dialogue text..."
              value={s.text}
              onChange={(e) => update(s.id, "text", e.target.value)}
            />
          </Stack>
        </Paper>
      ))}

      <Button variant="outlined" startIcon={<AddIcon />} onClick={addSegment} sx={{ mt: 1 }}>
        Add Segment
      </Button>
    </Stack>
  );
}