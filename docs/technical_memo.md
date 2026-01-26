# Technical Memo: Problem Solving in Lucidify

## Project 2: Lucidify

"Explore Your Subconscious with AI-Generated Dream Visuals."

**Period**: 2026.01.20 ~ Present

**Tech Stack**:

- **Frontend**: Svelte 5, Vite 7, Tailwind CSS 4, Lucide Svelte.
- **Backend**: SvelteKit (Serverless Functions), Google Cloud Platform (GCP).
- **AI & Video**: Google Gemini 2.0 Flash, Google Veo 2.0 (Vertex AI).
- **Storage & Auth**: Google Cloud Storage (GCS), Google Auth Library.

repo address: https://github.com/Seung-zedd/lucidify.git

---

## Technical Problem Solving

### Problem 1: Real-time Video Generation within Serverless Limits

#### Why: What was the challenge?

The core experience of Lucidify is visualizing dreams through high-quality video. However, generating video using **Google Veo 2.0** is a time-intensive process that far exceeds the standard timeout limits of serverless platforms like Vercel (Hobby plan: 60s). If the function is killed by the platform before the video is ready, the user receives a generic error, and the expensive generation process is wasted.

#### What: What was the solution?

I implemented a **Time-Bounded Polling Architecture** combined with **Server-Sent Events (SSE)**. Instead of a simple request-response cycle, the backend initiates the video generation and enters a controlled polling loop. This loop is strictly monitored by a safety timer that ensures the function terminates gracefully with a meaningful message just before the platform's hard limit is reached.

#### How: How was it implemented?

1.  **Vercel Optimization**: Configured `svelte.config.js` with `maxDuration: 60` to maximize the available execution window.
2.  **PredictLongRunning Integration**: Switched to the Vertex AI `predictLongRunning` endpoint to trigger asynchronous generation on Google's infrastructure.
3.  **Safety Timer**: Recorded a `startTime` and implemented a `while` loop that checks `Date.now() - startTime > 55000`. If the 55s mark is hit, it throws a specific "Generation timed out" error.
4.  **SSE Keep-Alive**: During the polling loop, the server sends `PROGRESS` events every 4 seconds. This prevents the browser or intermediate proxies from closing the connection due to inactivity.
5.  **Secure Delivery**: Once the video is ready in GCS, the system generates a **V4 Signed URL** with a 1-hour expiration, allowing the frontend to stream the private asset securely.

---

### Problem 2: Robust LRO Polling for Nested Model Resources

#### Why: What was the challenge?

Google Veo 2.0 operations are not standard regional operations; they are "nested" under the model resource. Attempting to poll these using the generic Vertex AI operations endpoint results in `404 Not Found` or `400 Bad Request` errors (as the generic endpoint often expects numeric IDs, while Veo uses UUIDs).

#### What: What was the solution?

I developed a **Dynamic Resource-Aware Polling** mechanism. Instead of constructing a generic URL, the system uses the full resource name returned by the initial Veo request to build a precise endpoint that targets the nested operation within the model's namespace.

#### How: How was it implemented?

1.  **Full Path Polling**: The system captures the `name` field from the Veo response (e.g., `projects/.../models/.../operations/...`).
2.  **Endpoint Construction**: It combines the regional base URL (`https://{location}-aiplatform.googleapis.com/v1beta1/`) with the full resource path to ensure the request is routed correctly.
3.  **v1beta1 Transition**: Switched to the `v1beta1` API version to ensure compatibility with the latest `predictLongRunning` features and response structures of the Veo 2.0 model.

---

### Problem 3: Decoupled UX for Complex Backend Polling (The Swan Strategy)

#### Why: What was the challenge?

As the backend logic for video generation became more complex (involving LRO polling, safety timeouts, and multiple API calls), there was a risk that this complexity would leak into the frontend, leading to a jittery or unstable User Experience (UX). The challenge was to keep the UI "elegant" and stable while the backend performed intensive "underwater" operations.

#### What: What was the solution?

I implemented a **Decoupling Strategy** based on the **"Swan Analogy."** Just as a swan appears graceful above water while its feet paddle frantically below, the frontend remains calm and displays a fixed, high-quality motivational state, while the backend handles the complex polling and status checks. This is achieved by using Server-Sent Events (SSE) as a "heartbeat" rather than a data-heavy update stream.

#### How: How was it implemented?

1.  **Swan Analogy (Visual vs. Logic)**: The frontend displays a static "Warping Reality..." message (the swan above water), while the backend performs the heavy lifting of polling Google Veo (the feet paddling below).
2.  **Heartbeat SSE**: The backend sends `PROGRESS` events (`send("PROGRESS", {})`) solely to keep the connection alive. The frontend listens for these events to maintain the stream but does not trigger any UI changes, ensuring zero "flicker."
3.  **Zero-Touch Frontend Migration**: Because the UX is decoupled from the specific polling logic, we were able to migrate the backend from a "Mock" to a "Real Veo Polling" system without changing a single line of frontend code.
4.  **Architectural Integrity**: This separation ensures that future backend optimizations (like switching models or changing polling intervals) will never impact the visual stability of the application.
