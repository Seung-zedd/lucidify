# 📋 Project Status: What's Done So Far

This document provides a high-level overview of the Lucidify project's current implementation state for AI models (like Gemini Pro) to quickly grasp the context.

## 🌟 Core Feature: The Dream Engine

The **Dream Engine** is the heart of Lucidify, transforming user dream descriptions into immersive experiences.

### 1. Vision Logic (`api/dream`)

- **Gemini 2.5 Flash**: Acts as the "Dream Architect" to analyze poetic intent, providing titles, insights, and video prompts.
- **Hypnotic Writing**: Generates a 4-5 sentence sensory narration used to guide the user into the dream state.

### 2. Manifestation Logic (`api/dream/manifest`)

- **Multi-Model Orchestration**:
  1. **Google Veo 3.1 Fast**: Primary video engine (predictLongRunning).
  2. **Imagen 4.0 Ultra**: High-fidelity image fallback if Veo exceeds safety limits.
- **Parallel Synthesis (Sync Fix)**:
  - The backend now starts the **Voice Synthesis** and the **Director (Prompt Refinement)** phases in parallel to reduce wait times.
  - **Perfect Sync**: The audio guide now narrations the _exact_ script generated during the analysis phase, ensuring the user's visual text matches the spoken words.
- **Optimized Hypnotic Voice (TTS)**:
  - Switched to **`en-US-Neural2-F`** (Google Cloud TTS).
  - **Tuned for Hypnagogia**: Audio is set to a deep pitch (-4.0) and a slow, calming rate (0.85) to enhance the immersion.
- **Swan Architecture**: Uses Server-Sent Events (SSE) to maintain a "graceful" frontend experience while the backend paddles "frantically" to poll long-running operations.

## 🛠️ Technical Fixes & Stability

- **GCP Key Management**: Uses a dedicated `GOOGLE_CLOUD_TTS_API_KEY` to avoid permission conflicts with AI Studio keys.
- **Serverless Reliability**: Implemented safety timers (55s/180s) and parallelized API calls to respect Vercel's execution limits.
- **Vercel Preview Debugging**: Enhanced server-side logging using `request.url` detection to debug production issues in real-time.

## 🎨 UI/UX (Svelte 5)

- **Runes Everywhere**: Fully migrated to Svelte 5 Runes ($state, $derived, $effect).
- **Lucid Mode**: Interactive "Take Control" flow that lets users modify the dream via the "Director" phase.
- **Synchronized Script Display**: The frontend dynamically updates the `loadingText` via a `NEW_SCRIPT` SSE event if the backend ever decides to refine the text during the manifest phase.

## 📂 Key Files

- `src/lib/server/dream-engine.ts`: All AI/Vertex/GCP synthesis logic.
- `src/routes/api/dream/manifest/+server.ts`: The SSE stream orchestrator and parallel logic.
- `src/routes/(app)/dream/+page.svelte`: The main immersive UI and SSE event listener.
- `docs/technical_memo.md`: Detailed "How & Why" for specific engineering challenges.
