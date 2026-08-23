import React, { useRef, useState } from "react";
import { Box, Button, Paper, Stack, Typography, TextField, Chip } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DescriptionIcon from "@mui/icons-material/Description";
import AudioFileIcon from "@mui/icons-material/AudioFile";
import type { ProcessingStatus } from "../types/dialogue";

interface UploadPanelProps {
  onRun: (audio: File, trans?: File, key?: string) => void;
  status: ProcessingStatus;
}

export default function UploadPanel({ onRun, status }: UploadPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const transRef = useRef<HTMLInputElement>(null);
  const [audio, setAudio] = useState<File>();
  const [trans, setTrans] = useState<File>();
  const [key, setKey] = useState(localStorage.getItem("gemini_api_key") || "");

  const run = () => {
    if (!audio || !key) return;
    localStorage.setItem("gemini_api_key", key);
    onRun(audio, trans, key);
  };

  const isProcessing = status === "uploading" || status === "analyzing";

  return (
    <Stack spacing={3}>
      <TextField
        label="Gemini API Key"
        type="password"
        value={key}
        onChange={(e) => setKey(e.target.value)}
        helperText="Your API key is saved locally in browser localStorage."
        fullWidth
      />

      <Paper
        variant="outlined"
        sx={{
          p: 4,
          textAlign: "center",
          borderStyle: "dashed",
          borderColor: audio ? "primary.main" : "divider",
          bgcolor: "background.paper",
        }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const f = e.dataTransfer.files[0];
          if (f) setAudio(f);
        }}
      >
        <CloudUploadIcon sx={{ fontSize: 48, color: audio ? "primary.main" : "text.secondary", mb: 1 }} />
        <Typography variant="h6">Drop podcast audio file here</Typography>
        <Typography color="text.secondary" variant="body2" sx={{ mb: 2 }}>
          Supports MP3, WAV, M4A, AAC
        </Typography>

        <Button variant="outlined" onClick={() => inputRef.current?.click()}>
          {audio ? "Change Audio File" : "Browse Audio File"}
        </Button>

        <input
          hidden
          ref={inputRef}
          type="file"
          accept="audio/*,.mp3,.wav,.m4a,.aac"
          onChange={(e) => {
            if (e.target.files?.[0]) setAudio(e.target.files[0]);
          }}
        />

        {audio && (
          <Box sx={{ mt: 2 }}>
            <Chip
              icon={<AudioFileIcon />}
              label={`${audio.name} (${(audio.size / (1024 * 1024)).toFixed(2)} MB)`}
              onDelete={() => setAudio(undefined)}
              color="primary"
              variant="outlined"
            />
          </Box>
        )}
      </Paper>

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="subtitle2">Optional Reference Transcript</Typography>
            <Typography variant="caption" color="text.secondary">
              Upload a .txt or .docx transcript to guide transcription accuracy
            </Typography>
          </Box>

          <Box>
            {trans ? (
              <Chip
                icon={<DescriptionIcon />}
                label={trans.name}
                onDelete={() => setTrans(undefined)}
                color="secondary"
                variant="outlined"
              />
            ) : (
              <Button size="small" variant="outlined" onClick={() => transRef.current?.click()}>
                Upload Transcript
              </Button>
            )}
            <input
              hidden
              ref={transRef}
              type="file"
              accept=".txt,.docx"
              onChange={(e) => {
                if (e.target.files?.[0]) setTrans(e.target.files[0]);
              }}
            />
          </Box>
        </Stack>
      </Paper>

      <Button
        size="large"
        variant="contained"
        disabled={!audio || !key || isProcessing}
        onClick={run}
      >
        {isProcessing ? "Processing..." : "Generate Timeline"}
      </Button>
    </Stack>
  );
}