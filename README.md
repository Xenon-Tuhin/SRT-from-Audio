# Podcast Speaker Timestamp Generator

## Run
```bash
npm install
npm run dev
```

Enter your Gemini API key in the app, upload audio, and generate an editable timeline.

## Notes
- Frontend-only architecture means API keys are exposed to the browser environment. Use your own key and restrict it appropriately.
- The Gemini SDK/model API evolves. If your installed SDK does not expose the exact Files upload call in `src/services/gemini.ts`, update that adapter to the current SDK API while keeping the rest of the app unchanged.
- AI timestamps should be reviewed in the editor for production-grade subtitle sync.
Rich WebUI
