export const formatMs = (ms: number): string => {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const x = Math.max(0, Math.floor(ms % 1000));
  const timeStr = `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(x).padStart(3, "0")}`;
  return h > 0 ? `${String(h).padStart(2, "0")}:${timeStr}` : timeStr;
};

export const srtTime = (ms: number): string => {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const x = Math.max(0, Math.floor(ms % 1000));
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")},${String(x).padStart(3, "0")}`;
};