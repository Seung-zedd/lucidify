# 📋 Project Status: What's Done So Far

This document provides a high-level overview of the Lucidify project's current implementation state for AI models (like Gemini Pro) to quickly grasp the context.

## 🌟 Core Feature: The Dream Engine

The **Dream Engine** is the heart of Lucidify, transforming user dream descriptions into immersive experiences.

### 1. Vision Logic (`api/dream`)

- **Gemini 2.5 Flash**: Acts as the "Dream Architect" to analyze poetic intent, providing titles, insights, and video prompts.
- **Sanitization**: Automatically Metaphorizes gore/violence into aesthetic visuals (e.g., blood -> rose petals).

### 2. Manifestation Logic (`api/dream/manifest`)

- **Multi-Model Orchestration**:
  1. **Google Veo 3.1 Fast**: Primary video engine (predictLongRunning).
  2. **Imagen 4.0 Ultra**: High-fidelity image fallback if Veo exceeds safety limits.
  3. **Imagen 3.0**: Secondary image fallback.
- **Hypnotic Narration (TTS)**:
  - Uses **Google Cloud Text-to-Speech** with the premium **`en-US-Journey-F`** voice.
  - Specialized logic to handle Journey-specific parameter restrictions.
- **Swan Architecture**: Uses Server-Sent Events (SSE) to maintain a "graceful" frontend experience while the backend paddles "frantically" to pool long-running operations.

## 🛠️ Technical Fixes & Stability

- **GCP Key Management**: Dedicated `GOOGLE_CLOUD_TTS_API_KEY` for GCP services to avoid scope conflicts with AI Studio keys.
- **Serverless Reliability**: Safety timers at 55s/180s to prevent hard timeouts on Vercel.
- **Vercel Preview Debugging**: Enhanced server-side logging using `request.url` detection to debug issues directly in the production-like cloud environment.

## 🎨 UI/UX (Svelte 5)

- **Runes Everywhere**: Fully migrated to Svelte 5 Runes ($state, $derived, $effect).
- **Lucid Mode**: Interactive "Take Control" flow that lets users modify the dream via the "Director" phase.
- **Immersive Atmosphere**: CSS-based "fluid-expand" transitions and mist overlays.

## 📂 Key Files

- `src/lib/server/dream-engine.ts`: All AI/Vertex/GCP synthesis logic.
- `src/routes/api/dream/manifest/+server.ts`: The SSE stream orchestrator.
- `src/routes/(app)/dream/+page.svelte`: The main immersive UI.
- `docs/technical_memo.md`: Detailed "How & Why" for specific engineering challenges.
