# Technical Memo: Problem Solving in Lucidify

## Project 2: Lucidify

"Explore Your Subconscious with AI-Generated Dream Visuals."

**Period**: 2026.01.19 ~ 2026.02.06

**Tech Stack**:

- **Frontend**: Svelte 5, Vite 7, Tailwind CSS 4, Lucide Svelte.
- **Backend**: SvelteKit (Serverless Functions), Google Cloud Platform (GCP).
- **AI & Video**: Google Gemini 2.5 Flash, Google Veo 3.1 (Google AI studio), Imagen 4.0 Ultra, Google TTS (Neural2-F)

repo address: https://github.com/Seung-zedd/lucidify.git

---

## Technical Problem Solving

### Problem 1: Real-time Video Generation within Serverless Limits

#### Why: What was the challenge?

The core experience of Lucidify is visualizing dreams through high-quality video. However, generating video using **Google Veo 3.1 Fast** is a time-intensive process that often approaches the standard timeout limits of serverless platforms like Vercel (Hobby plan: 60s). If the function is killed by the platform before the video is ready, the user receives a generic error, and the expensive generation process is wasted.

#### What: What was the solution?

I implemented a **Time-Bounded Polling Architecture** combined with **Server-Sent Events (SSE)**. Instead of a simple request-response cycle, the backend initiates the video generation and enters a controlled polling loop. This loop is strictly monitored by a safety timer that ensures the function terminates gracefully with a meaningful message just before the platform's hard limit is reached.

#### How: How was it implemented?

1.  **Vercel Optimization**: Configured `svelte.config.js` with `maxDuration: 60` to maximize the available execution window.
2.  **PredictLongRunning Integration**: Switched to the Vertex AI `predictLongRunning` endpoint to trigger asynchronous generation on Google's infrastructure.
3.  **Safety Timer**: Recorded a `startTime` and implemented a `while` loop that checks `Date.now() - startTime > 55000`. If the 55s mark is hit, it throws a specific "Generation timed out" error.
4.  **SSE Keep-Alive**: During the polling loop, the server sends `PROGRESS` events every 4 seconds. This prevents the browser or intermediate proxies from closing the connection due to inactivity.
5.  **Secure Delivery**: Once the video is ready in GCS, the system generates a **V4 Signed URL** with a 1-hour expiration, allowing the frontend to stream the private asset securely.

---

### Problem 2: Robust LRO Polling for Async API Models

#### Why: What was the challenge?

Google Veo 3.1 operations are long-running (LROs) and require precise polling. Attempting to poll these using generic endpoints or incorrect resource name structures results in `404 Not Found` or `400 Bad Request` errors. Early iterations struggled with the deeply nested response objects where URI paths varied between preview and production models.

#### What: What was the solution?

I developed a **Recursive URI extraction & Polling** mechanism. Instead of relying on a fixed response path, the system captures the `operationName` from the initial kickoff and uses the `v1beta` endpoint to poll the status. Once done, it performs a multi-layered search within the response object to find the `video.uri`, ensuring resilience against API schema changes.

#### How: How was it implemented?

1.  **Operation Key Extraction**: The system captures the `name` field from the Veo response (e.g., `projects/.../locations/.../operations/...`).
2.  **v1beta Polling**: It constructs the polling request using the `v1beta` model version to ensure compatibility with the `predictLongRunning` results.
3.  **Resilient JSON Parsing**: Implemented a prioritized URI extraction logic that checks multiple potential fields (`generatedSamples`, `response.video[0]`, `metadata.outputUri`) to successfully retrieve the signed URL regardless of the specific nesting level.

---

### Problem 3: Decoupled UX for Complex Backend Polling (The Swan Strategy)

#### Why: What was the challenge?

As the backend logic for video generation became more complex (involving LRO polling, safety timeouts, and multiple API calls), there was a risk that this complexity would leak into the frontend, leading to a jittery or unstable User Experience (UX). The challenge was to keep the UI "elegant" and stable while the backend performed intensive "underwater" operations.

#### What: What was the solution?

I implemented a **Decoupling Strategy** based on the **"Swan Analogy."** Just as a swan appears graceful above water while its feet paddle frantically below, the frontend remains calm and displays a fixed, high-quality motivational state, while the backend handles the complex polling and status checks. This is achieved by using Server-Sent Events (SSE) as a "heartbeat" rather than a data-heavy update stream.

#### How: How was it implemented?

1.  **Swan Analogy (Visual vs. Logic)**: The frontend displays a static "Warping Reality..." message (the swan above water), while the backend handles the heavy lifting of polling Google Veo (the feet paddling below).
2.  **Heartbeat SSE**: The backend sends `PROGRESS` events (`send("PROGRESS", "Generating dream frames...")`) solely to keep the connection alive. The frontend listens for these events to maintain the stream but does not trigger any UI changes, ensuring zero "flicker."
3.  **Zero-Touch Frontend Migration**: Because the UX is decoupled from the specific polling logic, we were able to migrate the backend from a "Mock" to a "Real Veo 3.1 Polling" system without changing a single line of frontend code.
4.  **Architectural Integrity**: This separation ensures that future backend optimizations (like switching models or changing polling intervals) will never impact the visual stability of the application.

---

### Problem 4: High-Fidelity Cloud TTS Integration & Key Scoping

#### Why: What was the challenge?

The application needed a soothing, hypnotic audio guide to accompany the dream visualization. Initially, the system attempted to use an **AI Studio API Key** (standard for Gemini) to access the **Google Cloud Text-to-Speech (TTS) API**. However, AI Studio keys are scoped restrictedly to the "Generative Language API" and do not have permissions for GCP services like TTS. Furthermore, using the experimental **`en-US-Journey-F`** voice with standard `pitch` and `speakingRate` parameters resulted in `400 Bad Request` errors, as these newer models do not yet support fine-grained tuning parameters.

#### What: What was the solution?

I implemented a **Dedicated Multi-Key Architecture** and a **Safe Parameter Protocol** for TTS. The system was refactored to prioritize a dedicated GCP API Key for TTS while maintaining compatibility with the experimental Journey voice by stripping unsupported parameters.

#### How: How was it implemented?

1.  **GCP API Key Provisioning**: Directed the transition from an AI Studio key to a standard GCP API Key (issued via Google Cloud Console) with the `Cloud Text-to-Speech API` explicitly enabled and unrestricted.
2.  **Safe Parameter Striping**: Identified that `en-US-Journey-F` does not support `pitch` or `speakingRate`. Modified the `audioConfig` in `dream-engine.ts` to only specify `audioEncoding: "MP3"` when using Journey voices, preventing `INVALID_ARGUMENT` errors.
3.  **Synchronous SSE Sequencing**: Refactored the `+server.ts` manifest route to `await` the TTS generation before initializing the heavy video generation. This ensures the `AUDIO_GUIDE` event is reliably sent through the SSE stream before any potential timeouts.
4.  **Robust Preview Logging**: Implemented a server-side environment check using `request.url` visibility to enable detailed `console.error` logging in **Vercel Preview** environments. This allowed us to capture and solve the "Pitch parameter not supported" error directly from the production logs.
5.  **Hypnotic Script Sync**: Fixed a discrepancy where the audio narrated a refined script while the UI displayed the original one. Implemented a `NEW_SCRIPT` SSE event to dynamically update the UI text as soon as the "Director" phase completes.
6.  **Voice Parameter Optimization**: Migrated from the experimental Journey voice (which had an immutable high pitch) to a tuned **Neural2** voice (`en-US-Neural2-F`) with a modified `pitch` (-4.0) and `speakingRate` (0.85). This achieved the desired deep, soothing tone essential for a hypnotic experience.
7.  **Environment Variable Sync**: Added `GOOGLE_CLOUD_TTS_API_KEY` to the shared `.env` and SvelteKit static environment, ensuring type safety and easy deployment via Vercel's environment variable dashboard.

---

### Problem 5: Aesthetic Cohesion & Performance (The Chroma Aura System)

#### Why: What was the challenge?

Integrating complex AI features into a "premium" UI can often lead to performance degradation or a generic aesthetic. The Dream Journal needed to feel mystical and personal, but repetitive card designs would feel stale. Furthermore, managing the state of dozens of 3D-rotating, interactive cards using legacy JS frameworks would be computationally expensive.

#### What: What was the solution?

I implemented the **Chroma Aura System** powered by **Svelte 5 Runes**. This system uses lightweight, reactive state management to handle complex 3D CSS transitions. Each card is assigned a unique, vibrant "soul" using dynamic color mapping, ensuring a diverse and premium feel without the overhead of heavy image assets.

#### How: How was it implemented?

1.  **Svelte 5 Runes**: Utilized `$state` and `$derived` for zero-latency UI updates during hovered and flip transitions.
2.  **Chroma Mapping**: Created a deterministic gradient palette where each card's "aura" is derived from its index (`gradients[index % gradients.length]`).
3.  **Performance Optimization**: Offloaded heavy animations to the GPU using `transform: translateZ(0)` and optimized the 3D flip card logic to avoid layout thrashing.
4.  **A11y & UX**: Implemented `stopPropagation` on inner scroll areas to allow users to read long "Subconscious Insights" without accidentally triggering the card's flip behavior.
