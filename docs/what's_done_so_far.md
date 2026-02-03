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
- **Smart Ambient Audio Matching (Smart Fallback)**:
  - **Mood Detection**: Uses **Gemini 2.5 Flash** to intelligently select one of 5 high-quality ambient loops (`nature`, `space`, `city`, `horror`, `fantasy`) based on the dream's emotional profile.
  - **Parallel Execution**: Analysis runs in parallel with Imagen generation to minimize latency during the fallback phase.
- **Cinematic Audio Transitions**:
  - **Dynamic Fading**: Implemented sophisticated `fadeAudioIn` and `fadeAudioOut` controllers on the frontend to handle state changes.
  - **Zero-Clash Sequence**: Ambient music is deferred until the "Enter Dream" action, and cross-fades with Warp SFX during lucid dream modifications (Warp starts as music fades out, new music fades in after transition).
- **Parallel Synthesis (Sync Fix)**:
  - **Performance**: The backend now starts the **Voice Synthesis** and the **Director (Prompt Refinement)** phases in parallel.
  - **Perfect Sync**: The audio guide narrations the _exact_ script generated during the analysis phase, ensuring the user's visual text matches the spoken words.
- **Aggressive SSML Pacing (Sync Fix)**:
  - **Model**: Switched to `en-US-Neural2-F` for precise control.
  - **Hypnotic Pacing**: Implemented SSML with `rate="0.85"`, `pitch="-2.0st"`, and forced pauses (1s after periods, 0.5s after commas).
- **TTS-driven User Flow**:
  - **Audio-Gated UI**: The user enters a fullscreen "Purple Dream" overlay while manifesting. The "Enter Dream" button only appears after BOTH the video is ready and the narrator has finished.
  - **Auto-Fade Overlay**: The loading overlay now automatically fades out once the audio narration ends, returning the user to the results screen for a natural transition.
- **Dream Journal (Local Persistence)**:
  - **Feature**: Lightweight "Dream Journal" to save subconscious insights locally.
  - **UI (Mystical Flip Cards)**: Tarot-style cards that levitate on hover and flip on click to reveal dream details.
  - **Tactile Interaction**: Smooth 3D transformations with dynamic colored auras (unique gradients) for each card.
  - **Navigation**: Dedicated `/journal` page with a responsive grid layout.
  - **Integration**: "Bookmark" button in the insight box for immediate saving with toast notifications.

## 🛠️ Technical Fixes & Stability

- **GCP Key Management**: Dedicated `GOOGLE_CLOUD_TTS_API_KEY` for GCP services like TTS to avoid scope conflicts with AI Studio.
- **Swan Architecture**: Uses Server-Sent Events (SSE) to maintain a "graceful" frontend experience.
- **Serverless Reliability**: Safety timers (55s/180s) to prevent hard timeouts on Vercel.
- **Vercel Preview Debugging**: Enhanced server-side logging using `request.url` detection to debug issues directly in production-like environments.
- **Veo Quota Resilience**: Implemented exponential backoff for the Dream Engine to handle transient `429 RESOURCE_EXHAUSTED` errors. Aligned model IDs to match dashboard standards.
- **Veo API Schema Fix**: Updated polling logic to correctly parse the deeply nested `generatedSamples` response from Veo 3.1. Added support for `video[0]` array structure to ensure only a single sample is processed even when multiple are returned.
- **Veo Manifestation Fix**: Implemented dual-fix for "Only Mist" bug: (1) Appending API keys to video URLs for browser authorization and (2) Adding the missing theatrical transition sequence to clear the entry mist.
- **Lucid Timeout Fix**: Increased Lucid Mode safety timeout to 150s in dev to prevent premature Imagen fallbacks.
- **Entry Flow Pivot**: Changed overlay button to "Ready to Enter dream?" to allow users to view insights before starting the video via the dashboard.
- **Lucid SFX Purity**: Reserved the `awakening.mp3` sound effect strictly for Lucid Mode transitions to maintain theatrical impact.
- **Lucid Time Freeze**: Implemented a smooth `grayscale(100%)` transition (1s) and `awakening.mp3` sound when entering Lucid Mode choice.
- **Dream State Vibrancy**: Removed the muted grayscale filter from the non-lucid state to ensure Veo and Imagen content is displayed in full, vivid color.
- **Robust SFX Randomization**: Implemented a **Fisher-Yates Shuffle** deck system for `warp_n.mp3` sounds. This ensures a non-repeating, unbiased variety where every sound in the set plays once before reshuffling. Added cache-busting for browser stream reliability.
- **Immersion Persistence**: Refined overlay logic to stay in the "Dreaming" state until both audio and video are fully synchronized and ready.
- **API Quota Isolation**: Separated `DEV_` and `PROD` Google AI keys across all endpoints to ensure testing does not consume production limits.
- **Vercel Build Stability**: Migrated all private environment variables to `$env/dynamic/private` to prevent build-time failures on Vercel when branch-specific keys are absent.
- **Agent Guidelines**: Established `AGENTS.md` to enforce cognitive protocols, documentation standards, and selective technical memo usage.
- **Context-Aware Ghost Typing**: Enhanced the F8 demo shortcut to automatically target the visible input. It now types the Icarus-themed prompt when the Lucid Mode transition prompt is open, and the default dream prompt otherwise.

## 🎨 UI/UX (Svelte 5)

- **Runes Everywhere**: Fully migrated to Svelte 5 Runes ($state, $derived, $effect).
- **Lucid Mode**: Interactive "Take Control" flow that lets users modify the dream via the "Director" phase.
- **Immersive Atmosphere**: CSS-based "fluid-expand" transitions, mist overlays, and deep-purple aesthetics.
- **Synchronized Script Display**: Frontend dynamically updates the `loadingText` via a `NEW_SCRIPT` SSE event to match any real-time backend refinements.
- **Micro-Animations (Toast/Journal)**: Implemented Svelte 5 rune-based global toast system and sophisticated 3D CSS animations for the journal archives.

## 📂 Key Files

- `src/lib/server/dream-engine.ts`: All AI/Vertex/GCP synthesis logic.
- `src/routes/api/dream/manifest/+server.ts`: The SSE stream orchestrator and parallel logic.
- `src/routes/(app)/dream/+page.svelte`: The main immersive UI and SSE event listener.
- `src/lib/utils/journal.ts`: Local Storage persistence logic for dream entries.
- `src/routes/(app)/journal/+page.svelte`: The mystical journal archive view.
- `src/lib/components/DreamCard.svelte`: Mystical 3D flip card component with index-based gradients.
- `src/lib/components/SubconsciousInsight.svelte`: Extracted insight rendering with Bookmark integration.
- `docs/walkthrough_journal.md`: Detailed engineering walkthrough of the Dream Journal feature.
- `docs/technical_memo.md`: Detailed "How & Why" for specific engineering challenges.
