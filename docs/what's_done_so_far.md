# 📋 Project Status: What's Done So Far

This document tracks the accumulated progress of the Lucidify project for AI context and historical reference.

## 🌟 Core Feature: The Dream Engine

The **Dream Engine** is the heart of Lucidify, transforming user dream descriptions into immersive experiences.

### 1. Vision Logic (`api/dream`)

- **Gemini 2.5 Flash**: Acts as the "Dream Architect" to analyze poetic intent, providing titles, insights, and video prompts.
- **Hypnotic Writing**: Generates a 4-5 sentence sensory narration used to guide the user into the dream state.
- **Sanitization (Aesthetic Metaphors)**: Automatically translates sensitive or violent content into artistic metaphors (e.g., blood -> rose petals) before sending to generation models.

### 2. Manifestation Logic (`api/dream/manifest`)

- **Multi-Model Orchestration**:
  1. **Google Veo 3.1 Fast**: Primary video engine using `predictLongRunning`.
  2. **Imagen 4.0 Ultra**: High-fidelity image fallback for complex prompts.
  3. **Imagen 3.0**: Secondary fallback to ensure reliability.
- **Parallel Synthesis (Sync Fix)**:
  - **Performance**: The backend now starts the **Voice Synthesis** and the **Director (Prompt Refinement)** phases in parallel.
  - **Perfect Sync**: The audio guide narrations the _exact_ script generated during the analysis phase, ensuring the user's visual text matches the spoken words.
- **Optimized Hypnotic Voice (TTS)**:
  - Switched to **`en-US-Neural2-F`** (Google Cloud TTS).
  - **Tuned for Hypnagogia**: Audio is set to a deep pitch (-4.0) and a slow, calming rate (0.85).
- **Swan Architecture**: Uses Server-Sent Events (SSE) to maintain a "graceful" frontend experience while the backend paddles "frantically" to poll long-running operations.

## 🛠️ Technical Fixes & Stability

- **GCP Key Management**: Dedicated `GOOGLE_CLOUD_TTS_API_KEY` for GCP services like TTS to avoid scope conflicts with AI Studio.
- **Serverless Reliability**: Safety timers (55s/180s) to prevent hard timeouts on Vercel.
- **Vercel Preview Debugging**: Enhanced server-side logging using `request.url` detection to debug issues directly in production-like environments.

## 🎨 UI/UX (Svelte 5)

- **Runes Everywhere**: Fully migrated to Svelte 5 Runes ($state, $derived, $effect).
- **Lucid Mode**: Interactive "Take Control" flow that lets users modify the dream via the "Director" phase.
- **Immersive Atmosphere**: CSS-based "fluid-expand" transitions, mist overlays, and deep-purple aesthetics.
- **Synchronized Script Display**: Frontend dynamically updates the `loadingText` via a `NEW_SCRIPT` SSE event to match any real-time backend refinements.

## 📂 Key Files

- `src/lib/server/dream-engine.ts`: All AI/Vertex/GCP synthesis logic.
- `src/routes/api/dream/manifest/+server.ts`: The SSE stream orchestrator and parallel logic.
- `src/routes/(app)/dream/+page.svelte`: The main immersive UI and SSE event listener.
- `docs/technical_memo.md`: Detailed "How & Why" for specific engineering challenges.
