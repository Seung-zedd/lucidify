<script lang="ts">
  import { fade, fly, crossfade, scale } from "svelte/transition";
  import { cubicInOut } from "svelte/easing";
  import { cn } from "$lib/utils";
  import Send from "@lucide/svelte/icons/send";
  import Sparkles from "@lucide/svelte/icons/sparkles";
  import Volume2 from "@lucide/svelte/icons/volume-2";
  import VolumeX from "@lucide/svelte/icons/volume-x";
  import Repeat from "@lucide/svelte/icons/repeat";
  import X from "@lucide/svelte/icons/x";
  import Mountain from "@lucide/svelte/icons/mountain";
  import Zap from "@lucide/svelte/icons/zap";
  import ZapOff from "@lucide/svelte/icons/zap-off";
  import { IS_DEV_MODE, isDevHostname } from "$lib/utils/env";

  const LOADING_PHRASES = [
    "Manifesting Your Will...",
    "Warping Reality...",
    "Reconstructing Visuals...",
    "Injecting Lucid Thought...",
    "Bending Physics...",
    "Altering Perception...",
  ];

  const [send, receive] = crossfade({
    duration: 800,
    easing: cubicInOut,
    fallback(node, params) {
      const { duration } = params;
      return fade(node, {
        duration: typeof duration === "function" ? duration(0) : duration,
      });
    },
  });

  let message = $state("");
  let isAnalyzing = $state(false);
  let analysisResult = $state<{
    title: string;
    insight: string;
    video_prompt: string;
    keywords: string[];
    hypnotic_script?: string;
  } | null>(null);
  let showResult = $state(false);

  // Phase 3: Visuals & Lucid Interaction State
  let isVideoPlaying = $state(false);
  let isLucidMode = $state(false);
  let showLucidButton = $state(false);
  let mediaSource = $state("");
  let previousMediaSource = $state("");
  let mediaType = $state<"video" | "image">("video");
  let previousMediaType = $state<"video" | "image">("video");
  let isTransitioning = $state(false);
  let showAchievement = $state(false);
  let isMuted = $state(false);
  let isLooping = $state(true);
  let videoElement = $state<HTMLVideoElement | null>(null);
  let showMist = $state(false);
  let isClearing = $state(false);
  let isFocused = $state(true);
  let mistVideo = $state<HTMLVideoElement | null>(null);

  // Real Dream Engine: Relay Sequence State
  let isGenerating = $state(false);
  let isShowingOverlay = $state(false);
  let isReadyToEnter = $state(false);
  let isAudioFinished = $state(false);
  let generatedVideoUrl = $state("");
  let pendingAmbientUrl = $state("");

  // Gamified Lucid Flow State
  let showLucidChoice = $state(false);
  let showLucidInput = $state(false);
  let controlType = $state<"surrounding" | "behavior" | null>(null);
  let lucidAction = $state("");
  let loadingText = $state("Manifesting Your Will...");
  let isAwakening = $state(false);

  // Audio Guide & SFX State
  let currentAudio = $state<HTMLAudioElement | null>(null);
  let ambientAudio = $state<HTMLAudioElement | null>(null);

  function fadeAudioIn(audio: HTMLAudioElement, duration = 3000) {
    audio.volume = 0;
    audio.play().catch(() => {});
    const startTime = Date.now();

    const fadeInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      audio.volume = isMuted ? 0 : progress;
      if (progress >= 1) clearInterval(fadeInterval);
    }, 50);
  }

  function fadeAudioOut(audio: HTMLAudioElement | null, duration = 2000) {
    if (!audio) return;
    const startVolume = audio.volume;
    const startTime = Date.now();

    const fadeInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      audio.volume = startVolume * (1 - progress);

      if (progress >= 1) {
        audio.pause();
        clearInterval(fadeInterval);
      }
    }, 50);
  }

  function fadeOutAudio(duration = 2000) {
    if (!currentAudio) return;
    const audio = currentAudio;
    fadeAudioOut(audio, duration);
    currentAudio = null;
  }

  function playRandomWarpSfx() {
    const n = Math.floor(Math.random() * 5) + 1;
    const audio = new Audio(`/audios/transitions/warp_${n}.mp3`);
    audio.volume = 0.6;
    audio.loop = true;
    audio.play().catch(() => {});
    currentAudio = audio;
  }

  async function handleSubmit() {
    if (!message.trim() || isAnalyzing) return;

    isAnalyzing = true;
    showResult = false;
    analysisResult = null;
    isReadyToEnter = false;
    generatedVideoUrl = "";

    try {
      const res = await fetch("/api/dream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ dream: message }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          errorData.message || "Connection to the dream world failed",
        );
      }

      analysisResult = await res.json();
      showResult = true;
    } catch (e: any) {
      if (IS_DEV_MODE) {
        console.log("[Dream] Analysis Error:", e);
      }
      alert(
        e.message || "Connection to the dream world failed. Please try again.",
      );
    } finally {
      isAnalyzing = false;
    }
  }

  async function handleGenerateVideo() {
    if (!analysisResult) return;

    isGenerating = true;
    isShowingOverlay = true;
    isReadyToEnter = false;
    isAudioFinished = false;
    loadingText =
      analysisResult.hypnotic_script || "CONSTRUCTING YOUR SUBCONSCIOUS...";

    try {
      const res = await fetch("/api/dream/manifest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: analysisResult.video_prompt,
          hypnotic_script: analysisResult.hypnotic_script,
        }),
      });

      if (!res.ok) throw new Error("Failed to generate video");

      const reader = res.body?.getReader();
      if (!reader) throw new Error("Failed to get reader");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const eventMatch = line.match(/^event: (.*)$/m);
          const dataMatch = line.match(/^data: (.*)$/m);

          if (eventMatch && dataMatch) {
            const event = eventMatch[1];
            const data = JSON.parse(dataMatch[1]);

            if (event === "INIT" || event === "PROGRESS") {
              // Keep the initial loadingText to avoid shuffling
            } else if (event === "NEW_SCRIPT") {
              loadingText = data.script;
            } else if (event === "AUDIO_GUIDE") {
              if (currentAudio) currentAudio.pause();
              isAudioFinished = false;
              currentAudio = new Audio(`data:audio/mp3;base64,${data.audio}`);
              currentAudio.volume = 1.0;
              currentAudio.onended = () => {
                isAudioFinished = true;
                isShowingOverlay = false;
              };
              currentAudio.play().catch(() => {});
            } else if (event === "COMPLETE") {
              // No fadeOutAudio here, let it finish naturally
              mediaSource = Array.isArray(data.mediaUrl)
                ? data.mediaUrl[0]
                : data.mediaUrl;
              mediaType = Array.isArray(data.mediaType)
                ? data.mediaType[0]
                : data.mediaType;

              // Store ambient audio URL but don't play yet (avoid clash with TTS)
              if (data.audioUrl) {
                pendingAmbientUrl = data.audioUrl;
              }

              isReadyToEnter = true;
            } else if (event === "ERROR") {
              fadeOutAudio(500);
              throw new Error(data.message);
            }
          }
        }
      }
    } catch (e: any) {
      if (IS_DEV_MODE) {
        console.log("[Dream] Video Generation Error:", e);
      }
      alert(
        e.message || "Failed to construct the dream reality. Please try again.",
      );
      isGenerating = false;
      isShowingOverlay = false;
    }
  }

  function handleEnterDream() {
    isGenerating = false;
    isShowingOverlay = false;
    isVideoPlaying = true;
    showMist = true;
    isClearing = false;
    isFocused = true;
    isLucidMode = false;
    showLucidButton = false;
    isMuted = false;
    isReadyToEnter = false;

    // Trigger Ambient Audio playback if it came from the manifestation
    if (pendingAmbientUrl) {
      if (ambientAudio) {
        fadeAudioOut(ambientAudio, 500);
      }
      ambientAudio = new Audio(pendingAmbientUrl);
      ambientAudio.loop = true;
      fadeAudioIn(ambientAudio, 3000); // Cinematic 3s Fade-In
      pendingAmbientUrl = ""; // Clear after use
    }

    // Show Lucid Button after 3 seconds
    setTimeout(() => {
      if (isVideoPlaying && !isLucidMode) {
        showLucidButton = true;
      }
    }, 3000);
  }

  function handleOpenLucidChoice() {
    if (videoElement) {
      videoElement.pause();
    }
    showLucidChoice = true;
    showLucidButton = false;
  }

  function handleSelectControlType(type: "surrounding" | "behavior") {
    controlType = type;
    showLucidChoice = false;
    showLucidInput = true;
  }

  async function handleAwakening(action: string) {
    if (!action.trim()) return;

    showLucidInput = false;

    // 1. Immediate UI Feedback (Enter Waiting State)
    isAwakening = true;
    showMist = true; // Summon mist
    isClearing = false; // 🚨 IMPORTANT: Do not explode yet! (Only cover with mist)
    isFocused = false; // Blur background

    // Select a single random phrase for this action
    loadingText =
      LOADING_PHRASES[Math.floor(Math.random() * LOADING_PHRASES.length)];

    // Slow mist speed (Dreaming)
    if (mistVideo) {
      mistVideo.playbackRate = 0.5;
    }

    // 1. Cinematic Transition Start: Fade out current music
    if (ambientAudio) {
      fadeAudioOut(ambientAudio, 500);
    }

    // 2. Play transition SFX (This will set currentAudio)
    playRandomWarpSfx();

    try {
      // 2. Request from Director (SSE Stream)
      const res = await fetch("/api/dream/lucid", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: message, action }),
      });

      if (!res.ok) throw new Error("Failed to manifest reality");

      const reader = res.body?.getReader();
      if (!reader) throw new Error("Failed to get reader");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const eventMatch = line.match(/^event: (.*)$/m);
          const dataMatch = line.match(/^data: (.*)$/m);

          if (eventMatch && dataMatch) {
            const event = eventMatch[1];
            const data = JSON.parse(dataMatch[1]);

            if (event === "INIT" || event === "PROGRESS") {
              // Keep the random flavor text, don't let the server shuffle it
            } else if (event === "COMPLETE") {
              // 3. Response arrived! (Ready to Explode)
              // Store current as previous for transition
              if (mediaSource) {
                previousMediaSource = mediaSource;
                previousMediaType = mediaType;
              }

              // Give a small tick to ensure video loading time
              setTimeout(() => {
                isAwakening = false;

                // Update to new media
                mediaSource = Array.isArray(data.mediaUrl)
                  ? data.mediaUrl[0]
                  : data.mediaUrl;
                mediaType = Array.isArray(data.mediaType)
                  ? data.mediaType[0]
                  : data.mediaType;

                // Start video playback
                if (videoElement) {
                  videoElement.load();
                  videoElement.play().catch(() => {});
                }

                // 4. Start Awakening Sequence
                isLucidMode = true;
                showLucidButton = false;
                showAchievement = true;

                // Activate mist warp drive!
                if (mistVideo) mistVideo.playbackRate = 4.0;

                // 💥 Explode now! (Explosion Animation Trigger)
                isClearing = true;
                isTransitioning = true;

                // Fade out current audio (SFX) and play awakening sound
                fadeOutAudio(2000);
                const audio = new Audio("/audios/awakening.mp3");
                audio.volume = 0.5;
                audio.play().catch(() => {});

                // 3. Cinematic Transition End: Fade in new ambient audio
                if (data.audioUrl) {
                  ambientAudio = new Audio(data.audioUrl);
                  ambientAudio.loop = true;
                  // Start fading in after the initial awakening burst
                  setTimeout(() => {
                    fadeAudioIn(ambientAudio!, 2000);
                  }, 1000);
                }

                // Return background focus (with explosion)
                setTimeout(() => {
                  isFocused = true;
                }, 600);
              }, 100); // 0.1s delay (Safety buffer)
            } else if (event === "ERROR") {
              fadeOutAudio(500);
              throw new Error(data.message);
            }
          }
        }
      }

      // 5. Cleanup
      setTimeout(() => {
        showMist = false;
        isClearing = false;
      }, 2500); // Match with animation duration

      setTimeout(() => (showAchievement = false), 4000);
    } catch (e) {
      isAwakening = false;
      if (IS_DEV_MODE) {
        console.log("[Dream] Awakening Error:", e);
      }
      alert("Failed to manifest your will.");
      isClearing = false;
      isFocused = true;
      showMist = false;
    }
  }

  function handleExitVideo() {
    if (videoElement) {
      videoElement.pause();
    }
    if (ambientAudio) {
      ambientAudio.pause();
      ambientAudio = null;
    }
    isVideoPlaying = false;
    isLucidMode = false;
    isLooping = true;
    showLucidButton = false;
    showAchievement = false;
    showMist = false;
    isClearing = false;
    isFocused = true;
    isAwakening = false;
  }

  function toggleLoop() {
    isLooping = !isLooping;
    if (isLooping && videoElement && videoElement.ended) {
      videoElement.play().catch(() => {});
    }
  }

  function handleReset() {
    message = "";
    showResult = false;
    analysisResult = null;
    isReadyToEnter = false;
    isAudioFinished = false;
    isShowingOverlay = false;
    isGenerating = false;
    mediaSource = "";
    previousMediaSource = "";
    isTransitioning = false;
    pendingAmbientUrl = "";
    if (ambientAudio) {
      ambientAudio.pause();
      ambientAudio = null;
    }
    handleExitVideo();
  }
</script>

{#if isShowingOverlay}
  <div transition:fade={{ duration: 1500 }} class="fixed inset-0 z-50 bg-black">
    <video
      src="/images/purple-dream.mp4"
      autoplay
      loop
      muted
      playsinline
      class="w-full h-full object-cover opacity-90"
    ></video>

    <div
      class="absolute inset-0 flex flex-col items-center justify-center z-50 p-12"
    >
      <p
        class="text-white font-serif text-xl md:text-2xl font-medium animate-pulse tracking-[0.2em] uppercase text-center max-w-5xl leading-relaxed drop-shadow-[0_0_20px_rgba(168,85,247,0.5)]"
      >
        {loadingText}
      </p>

      {#if isReadyToEnter && isAudioFinished}
        <div in:fade={{ delay: 500, duration: 1000 }} class="mt-12">
          <button
            onclick={handleEnterDream}
            class="group relative px-12 py-4 rounded-full overflow-hidden transition-all duration-500 hover:scale-110 active:scale-95 bg-white/10 backdrop-blur-md border border-white/20 hover:border-white/40 shadow-[0_0_30px_rgba(168,85,247,0.3)] hover:shadow-[0_0_50px_rgba(168,85,247,0.5)]"
          >
            <div
              class="absolute inset-0 bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-20 group-hover:opacity-40 transition-opacity"
            ></div>
            <span
              class="relative text-white font-serif text-2xl font-bold tracking-[0.3em] uppercase"
              >Enter Dream</span
            >
          </button>
        </div>
      {/if}
    </div>
  </div>
{/if}

<div
  class="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center p-6 relative overflow-hidden"
>
  <!-- Deep Dreamy Background -->
  <div
    class="absolute inset-0 bg-linear-to-b from-indigo-950 via-zinc-950 to-black -z-10"
  ></div>

  <!-- Ambient Glow -->
  <div
    class="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] -z-10 animate-pulse"
  ></div>
  <div
    class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] -z-10 animate-pulse"
    style="animation-delay: 2s"
  ></div>

  <div class="w-full max-w-3xl space-y-8 relative z-10">
    <!-- Header -->
    <div in:fly={{ y: -20, duration: 800 }} class="text-center space-y-4">
      <div
        class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-bold mb-2"
      >
        <Sparkles class="w-4 h-4" />
        <span>AI Dream Architect</span>
      </div>
      <h2
        class="text-5xl md:text-7xl font-black text-white tracking-tight font-serif"
      >
        Explore Your <span
          class="bg-linear-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
          >Subconscious</span
        >
      </h2>
      <p class="text-slate-300 text-xl max-w-xl mx-auto font-medium">
        Describe your dream in detail. Lucidify will help you visualize and
        understand the hidden meanings.
      </p>
    </div>

    <!-- Chat/Input Container -->
    <div in:fade={{ delay: 400, duration: 800 }} class="space-y-6">
      <div class="relative group">
        <!-- Glow effect on focus -->
        <div
          class="absolute -inset-1 bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition duration-500 shadow-[0_0_20px_rgba(168,85,247,0.4)]"
        ></div>

        <div
          class="relative bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-2xl transition-all duration-300 group-focus-within:border-white/20"
        >
          <div class="flex items-end gap-2">
            <textarea
              bind:value={message}
              placeholder="I was walking through a forest of crystal trees..."
              class="flex-1 bg-transparent border-none focus:ring-0 p-4 text-white placeholder-slate-400 text-lg min-h-[120px] resize-none outline-none font-sans"
              onkeydown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
            ></textarea>

            <button
              onclick={handleSubmit}
              disabled={isAnalyzing || !message.trim()}
              class="mb-2 mr-2 p-4 rounded-xl bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-bold hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 disabled:hover:scale-100 shadow-[0_0_20px_rgba(168,85,247,0.4)]"
              aria-label="Send to subconscious"
            >
              {#if isAnalyzing}
                <div
                  class="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"
                ></div>
              {:else}
                <Send class="w-6 h-6" />
              {/if}
            </button>
          </div>
        </div>
      </div>

      <!-- Response Area -->
      {#if isAnalyzing || showResult}
        {#if !isVideoPlaying}
          <div
            in:receive={{ key: "morph-container" }}
            out:send={{ key: "morph-container" }}
            class="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl transition-all duration-700 ease-in-out"
          >
            <div in:fade={{ duration: 400, delay: 300 }}>
              <div class="flex items-center gap-3 mb-6">
                <div
                  class="w-10 h-10 rounded-xl bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg"
                >
                  <Sparkles class="w-6 h-6 text-white" />
                </div>
                <h3
                  class="text-sm font-bold uppercase tracking-widest text-indigo-300"
                >
                  {isAnalyzing ? "Analyzing Dream..." : "Subconscious Insight"}
                </h3>
              </div>

              {#if isAnalyzing}
                <div class="space-y-3">
                  <div
                    class="h-4 bg-white/10 rounded-full w-3/4 animate-pulse"
                  ></div>
                  <div
                    class="h-4 bg-white/10 rounded-full w-full animate-pulse"
                  ></div>
                  <div
                    class="h-4 bg-white/10 rounded-full w-5/6 animate-pulse"
                  ></div>
                  <p
                    class="text-slate-400 text-sm mt-4 animate-pulse font-medium"
                  >
                    Connecting to subconscious...
                  </p>
                </div>
              {:else if analysisResult}
                <div class="space-y-6">
                  <div>
                    <h4 class="text-2xl font-serif font-bold text-white mb-2">
                      {analysisResult.title}
                    </h4>
                    <p
                      class="text-slate-100 text-lg leading-relaxed whitespace-pre-wrap font-medium"
                    >
                      {analysisResult.insight}
                    </p>
                  </div>

                  <div class="p-4 rounded-xl bg-white/5 border border-white/10">
                    <h5
                      class="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-2"
                    >
                      Video Generation Prompt
                    </h5>
                    <p class="text-slate-300 text-sm italic">
                      "{analysisResult.video_prompt}"
                    </p>
                  </div>

                  <div class="flex flex-wrap gap-2">
                    {#each analysisResult.keywords as keyword}
                      <span
                        class="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium"
                      >
                        #{keyword}
                      </span>
                    {/each}
                  </div>

                  <div class="pt-4 flex gap-4">
                    {#if isReadyToEnter && isAudioFinished}
                      <button
                        onclick={handleEnterDream}
                        class="px-8 py-3 rounded-xl bg-linear-to-r from-emerald-500 to-teal-500 text-white font-bold hover:scale-105 transition-all shadow-lg shadow-emerald-500/20 animate-pulse"
                      >
                        Enter Dream
                      </button>
                    {:else}
                      <button
                        onclick={handleGenerateVideo}
                        disabled={isGenerating}
                        class="px-8 py-3 rounded-xl bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-bold hover:scale-105 transition-all shadow-lg shadow-purple-500/20 disabled:opacity-50"
                      >
                        {#if isGenerating}
                          <div class="flex items-center gap-2">
                            <div
                              class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
                            ></div>
                            <span>Generating...</span>
                          </div>
                        {:else}
                          Generate Video
                        {/if}
                      </button>
                    {/if}
                    <button
                      onclick={handleReset}
                      disabled={isGenerating}
                      class="px-8 py-3 rounded-xl border border-white/10 text-slate-300 font-bold hover:text-white hover:border-white/20 transition-all disabled:opacity-50"
                    >
                      New Dream
                    </button>
                  </div>
                </div>
              {/if}
            </div>
          </div>
        {/if}
      {/if}

      {#if isVideoPlaying}
        <div
          in:receive={{ key: "morph-container" }}
          out:send={{ key: "morph-container" }}
          class="fixed inset-0 z-50 bg-slate-950 flex items-center justify-center overflow-hidden transition-all duration-700 ease-in-out"
        >
          <div
            in:fade={{ duration: 600, delay: 300 }}
            out:fade={{ duration: 400 }}
            class="relative w-full h-full"
          >
            <!-- Reality Layering Container -->
            <div
              class={cn(
                "relative w-full h-full overflow-hidden",
                isClearing && "animate-mild-shake",
              )}
            >
              <!-- Previous Reality (Background) -->
              {#if previousMediaSource}
                <div class="absolute inset-0 z-0">
                  {#if previousMediaType === "video"}
                    <video
                      src={previousMediaSource}
                      autoplay
                      loop
                      muted
                      playsinline
                      class="w-full h-full object-cover opacity-50"
                      style="filter: grayscale(100%) blur(4px);"
                    >
                      <track kind="captions" />
                    </video>
                  {:else}
                    <img
                      src={previousMediaSource}
                      alt="Previous dream"
                      class="w-full h-full object-cover opacity-50"
                      style="filter: grayscale(100%) blur(4px);"
                    />
                  {/if}
                </div>
              {/if}

              <!-- New Reality (Foreground with Expansion) -->
              <div
                class={cn(
                  "absolute inset-0 z-10",
                  isTransitioning && "animate-fluid-expand",
                )}
                onanimationend={() => {
                  if (isTransitioning) {
                    isTransitioning = false;
                    previousMediaSource = "";
                  }
                }}
              >
                {#if mediaType === "video"}
                  <video
                    bind:this={videoElement}
                    src={mediaSource}
                    autoplay
                    loop={isLooping}
                    muted={isMuted}
                    playsinline
                    class={cn(
                      "w-full h-full object-cover transition-all duration-2500 ease-in",
                      isClearing && "animate-pulse-impact",
                      isTransitioning && "animate-settle-in",
                    )}
                    style="filter: {isLucidMode
                      ? isFocused
                        ? 'blur(0px) brightness(1.0)'
                        : 'blur(16px) brightness(1.25)'
                      : showMist
                        ? 'blur(1px) brightness(1.05)'
                        : 'grayscale(50%) sepia(20%)'} {showLucidChoice ||
                    showLucidInput
                      ? 'blur(4px) brightness(0.5)'
                      : ''};"
                  >
                    <track kind="captions" />
                  </video>
                {:else}
                  <img
                    src={mediaSource}
                    alt="Dream visualization"
                    class={cn(
                      "w-full h-full object-cover transition-all duration-2500 ease-in animate-ken-burns",
                      isClearing && "animate-pulse-impact",
                      isTransitioning && "animate-settle-in",
                    )}
                    style="filter: {isLucidMode
                      ? isFocused
                        ? 'blur(0px) brightness(1.0)'
                        : 'blur(16px) brightness(1.25)'
                      : showMist
                        ? 'blur(1px) brightness(1.05)'
                        : 'grayscale(50%) sepia(20%)'} {showLucidChoice ||
                    showLucidInput
                      ? 'blur(4px) brightness(0.5)'
                      : ''};"
                  />
                {/if}
              </div>
            </div>

            <!-- Atmosphere Layer: Mist Overlay -->
            {#if !isLucidMode}
              <div
                class="absolute inset-0 z-10 pointer-events-none mix-blend-screen opacity-60"
                transition:fade={{ duration: 1500 }}
              >
                <video
                  src="/images/mist.mp4"
                  autoplay
                  loop
                  muted
                  playsinline
                  class="w-full h-full object-cover"
                  onplay={(e) => (e.currentTarget.playbackRate = 0.5)}
                >
                  <track kind="captions" />
                </video>
              </div>
            {/if}
            {#if isLucidMode}
              <div
                class="absolute inset-0 pointer-events-none z-10 shadow-[inset_0_0_100px_rgba(250,204,21,0.3),inset_0_0_200px_rgba(168,85,247,0.2)] animate-pulse-slow"
              ></div>
            {/if}

            <!-- Lucid Button (⭐️) -->
            {#if showLucidButton}
              <div
                in:fly={{ y: 20, duration: 500 }}
                class="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
              >
                <button
                  onclick={handleOpenLucidChoice}
                  class="group/lucid relative p-6 rounded-full bg-linear-to-r from-yellow-400 via-orange-400 to-yellow-500 text-white shadow-[0_0_30px_rgba(234,179,8,0.5)] hover:scale-110 active:scale-95 transition-all animate-pulse"
                  aria-label="Trigger Awakening"
                >
                  <Sparkles class="w-8 h-8 fill-white" />

                  <!-- Tooltip -->
                  <div
                    class="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/80 backdrop-blur-md rounded-lg text-xs font-bold whitespace-nowrap opacity-0 group-hover/lucid:opacity-100 transition-opacity"
                  >
                    Take Control
                  </div>
                </button>
              </div>
            {/if}

            <!-- Souls-like Achievement Overlay -->
            {#if showAchievement}
              <div
                in:fade={{ duration: 1000 }}
                out:fade={{ duration: 1000 }}
                class="absolute inset-x-0 bottom-24 z-30 flex flex-col items-center pointer-events-none"
              >
                <div class="w-full max-w-2xl px-4 flex flex-col items-center">
                  <!-- Top Divider -->
                  <div
                    class="w-[120%] h-px bg-linear-to-r from-transparent via-[#FDB931] to-transparent opacity-80 mb-6"
                  ></div>

                  <h2
                    class="text-4xl md:text-6xl font-['Cinzel_Decorative'] font-black tracking-[0.25em] text-center bg-linear-to-b from-[#FFF5C3] via-[#FDB931] to-[#9F7928] bg-clip-text text-transparent drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
                  >
                    LUCIDITY ACHIEVED
                  </h2>

                  <!-- Bottom Divider -->
                  <div
                    class="w-[120%] h-px bg-linear-to-r from-transparent via-[#FDB931] to-transparent opacity-80 mt-6"
                  ></div>
                </div>
              </div>
            {/if}

            <!-- Video Controls Overlay -->
            <div class="absolute top-24 right-6 z-20">
              <div
                class="bg-black/40 backdrop-blur-md rounded-full px-4 py-2 flex items-center gap-4 border border-white/10 shadow-2xl"
              >
                <!-- Mute Toggle -->
                <button
                  onclick={() => {
                    isMuted = !isMuted;
                    if (ambientAudio) {
                      ambientAudio.volume = isMuted ? 0 : 1;
                    }
                  }}
                  class="p-1.5 rounded-full hover:bg-white/10 transition-colors group/control"
                  title={isMuted ? "Unmute" : "Mute"}
                >
                  {#if isMuted}
                    <VolumeX class="w-5 h-5 text-red-400" />
                  {:else}
                    <Volume2
                      class="w-5 h-5 text-white/70 group-hover/control:text-white"
                    />
                  {/if}
                </button>

                <!-- Loop Toggle -->
                <button
                  onclick={toggleLoop}
                  class="p-1.5 rounded-full hover:bg-white/10 transition-colors group/control"
                  title={isLooping ? "Disable Loop" : "Enable Loop"}
                >
                  <Repeat
                    class="w-5 h-5 transition-colors {isLooping
                      ? 'text-amber-400'
                      : 'text-white/30 group-hover/control:text-white/60'}"
                  />
                </button>

                <!-- Divider -->
                <div class="w-px h-4 bg-white/10"></div>

                <!-- Exit Button -->
                <button
                  onclick={handleExitVideo}
                  class="flex items-center gap-2 px-4 py-1.5 rounded-full hover:bg-white/10 transition-colors group/control"
                  title="Exit Dream"
                >
                  <span
                    class="text-xs font-bold text-white/50 group-hover/control:text-white transition-colors"
                    >Exit Dream</span
                  >
                  <X
                    class="w-5 h-5 text-white/70 group-hover/control:text-white"
                  />
                </button>
              </div>
            </div>

            <div class="absolute top-24 left-6 z-20">
              <div
                class={cn(
                  "px-5 py-2.5 rounded-full backdrop-blur-md border transition-all duration-1000 font-bold uppercase tracking-widest text-sm md:text-base shadow-lg",
                  isLucidMode
                    ? "bg-amber-500/10 border-amber-500/50 text-amber-400 animate-lucid-glow"
                    : "bg-black/30 border-white/20 text-white/80 animate-daze",
                )}
              >
                {isLucidMode ? "Lucid State" : "Dream State"}
              </div>
            </div>
          </div>

          <!-- Mist Overlay -->
          {#if showMist}
            <div
              class={cn(
                "absolute inset-0 z-60 pointer-events-none mix-blend-screen mist-layer transition-opacity duration-1000",
                isClearing
                  ? "animate-engulf-breakthrough"
                  : "opacity-70 scale-100",
                isAwakening && "opacity-0",
              )}
            >
              <video
                bind:this={mistVideo}
                src="/images/mist.mp4"
                autoplay
                muted
                loop
                playsinline
                class="w-full h-full object-cover"
                onplay={() => {
                  if (mistVideo) mistVideo.playbackRate = 0.5;
                }}
              >
                <track kind="captions" />
              </video>
            </div>
          {/if}

          <!-- Loading Overlay (Moved out of blended mist container for visibility) -->
          {#if isAwakening && !isClearing}
            <div
              class="absolute inset-0 flex items-center justify-center z-70 pointer-events-none"
              transition:fade={{ duration: 500 }}
            >
              <div
                class="bg-black/60 backdrop-blur-md px-8 py-4 rounded-full shadow-2xl border border-white/10"
              >
                <p
                  class="text-white font-medium text-lg animate-pulse tracking-[0.2em] uppercase text-center leading-relaxed"
                >
                  {loadingText}
                </p>
              </div>
            </div>
          {/if}

          <!-- Choice Modal -->
          {#if showLucidChoice}
            <div
              in:fade={{ duration: 300 }}
              out:fade={{ duration: 200 }}
              class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            >
              <div
                in:scale={{ start: 0.9, duration: 400, easing: cubicInOut }}
                class="text-center space-y-8 p-8"
              >
                <h3
                  class="text-3xl md:text-4xl font-serif font-bold text-white tracking-tight"
                >
                  Which way do you want to control the dream?
                </h3>

                <div class="flex flex-wrap justify-center gap-6">
                  <!-- Control Surrounding -->
                  <button
                    onclick={() => handleSelectControlType("surrounding")}
                    class="w-48 h-48 flex flex-col items-center justify-center gap-4 bg-slate-900/50 border border-white/10 rounded-2xl hover:bg-slate-800/80 hover:scale-105 hover:border-purple-500/50 hover:shadow-[0_0_30px_rgba(168,85,247,0.2)] transition-all cursor-pointer group"
                  >
                    <div
                      class="p-4 rounded-xl bg-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform"
                    >
                      <Mountain class="w-10 h-10" />
                    </div>
                    <span class="text-sm font-semibold text-slate-200"
                      >Control Surrounding</span
                    >
                  </button>

                  <!-- Control Behavior -->
                  <button
                    onclick={() => handleSelectControlType("behavior")}
                    class="w-48 h-48 flex flex-col items-center justify-center gap-4 bg-slate-900/50 border border-white/10 rounded-2xl hover:bg-slate-800/80 hover:scale-105 hover:border-amber-500/50 hover:shadow-[0_0_30px_rgba(245,158,11,0.2)] transition-all cursor-pointer group"
                  >
                    <div
                      class="p-4 rounded-xl bg-amber-500/10 text-amber-400 group-hover:scale-110 transition-transform"
                    >
                      <Zap class="w-10 h-10" />
                    </div>
                    <span class="text-sm font-semibold text-slate-200"
                      >Control Behavior</span
                    >
                  </button>
                </div>

                <button
                  onclick={() => {
                    showLucidChoice = false;
                    showLucidButton = true;
                    if (videoElement) videoElement.play().catch(() => {});
                  }}
                  class="text-slate-400 hover:text-white text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          {/if}

          <!-- Mini Prompt Window -->
          {#if showLucidInput}
            <div
              in:fade={{ duration: 300 }}
              out:fade={{ duration: 200 }}
              class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md"
            >
              <div
                in:scale={{ start: 0.9, duration: 400, easing: cubicInOut }}
                class="w-full max-w-2xl px-6"
              >
                <div class="mb-2 flex flex-col items-center">
                  <span
                    class="text-xs text-purple-300 font-mono tracking-wide animate-pulse"
                  >
                    {controlType === "surrounding"
                      ? "Constructing new reality..."
                      : "Modifying physical laws..."}
                  </span>
                </div>

                <div class="relative group">
                  <div
                    class="absolute -inset-1 bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-75 group-focus-within:opacity-100 transition duration-500 shadow-[0_0_20px_rgba(168,85,247,0.4)]"
                  ></div>

                  <div
                    class="relative bg-slate-900/60 backdrop-blur-xl border border-white/20 rounded-2xl p-2 shadow-2xl"
                  >
                    <div class="flex items-end gap-2">
                      <textarea
                        bind:value={lucidAction}
                        placeholder={controlType === "surrounding"
                          ? "Input the specific surrounding you want to create..."
                          : "Input the specific behavior you want to perform..."}
                        class="flex-1 bg-transparent border-none focus:ring-0 p-4 text-white placeholder-white/40 text-xl text-center min-h-[100px] resize-none outline-none font-sans"
                        onkeydown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleAwakening(lucidAction);
                          }
                        }}
                      ></textarea>

                      <button
                        onclick={() => handleAwakening(lucidAction)}
                        disabled={!lucidAction.trim()}
                        class="mb-2 mr-2 p-4 rounded-xl bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-bold hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 shadow-[0_0_20px_rgba(168,85,247,0.4)]"
                        aria-label="Manifest Reality"
                      >
                        <Send class="w-6 h-6" />
                      </button>
                    </div>
                  </div>
                </div>

                <div class="mt-6 text-center">
                  <button
                    onclick={() => {
                      showLucidInput = false;
                      showLucidButton = true;
                      if (videoElement) videoElement.play().catch(() => {});
                    }}
                    class="text-white/40 hover:text-white/80 text-sm transition-colors"
                  >
                    Back to Dream
                  </button>
                </div>
              </div>
            </div>
          {/if}
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  @keyframes ken-burns {
    0% {
      transform: scale(1);
      translate: 0 0;
    }
    100% {
      transform: scale(1.15);
      translate: -1% -1%;
    }
  }

  .animate-ken-burns {
    animation: ken-burns 20s ease-in-out infinite alternate;
  }

  @keyframes fluid-expand {
    0% {
      mask-size: 0% 0%;
      -webkit-mask-size: 0% 0%;
      filter: brightness(2);
    }
    20% {
      mask-size: 50% 50%;
      -webkit-mask-size: 50% 50%;
      filter: brightness(1.5);
    }
    100% {
      mask-size: 300% 300%;
      -webkit-mask-size: 300% 300%;
      filter: brightness(1);
    }
  }

  .animate-fluid-expand {
    mask-image: radial-gradient(circle, black 0%, transparent 70%);
    -webkit-mask-image: radial-gradient(circle, black 0%, transparent 70%);
    mask-repeat: no-repeat;
    -webkit-mask-repeat: no-repeat;
    mask-position: center;
    -webkit-mask-position: center;
    animation: fluid-expand 2.5s cubic-bezier(0.25, 1, 0.5, 1) forwards;
  }

  @keyframes settle-in {
    0% {
      transform: scale(1.1);
    }
    100% {
      transform: scale(1);
    }
  }

  .animate-settle-in {
    animation: settle-in 2.5s cubic-bezier(0.25, 1, 0.5, 1) forwards;
  }

  @keyframes mild-shake {
    0%,
    100% {
      transform: translate(0, 0);
    }
    25% {
      transform: translate(-5px, 5px);
    }
    75% {
      transform: translate(5px, -5px);
    }
  }

  .animate-mild-shake {
    animation: mild-shake 0.4s ease-in-out;
  }

  .mist-layer {
    mask-image: radial-gradient(circle at center, transparent 30%, black 100%);
    -webkit-mask-image: radial-gradient(
      circle at center,
      transparent 30%,
      black 100%
    );
    opacity: 0.8;
    pointer-events: none;
  }

  @keyframes pulse-slow {
    0%,
    100% {
      opacity: 0.5;
    }
    50% {
      opacity: 0.8;
    }
  }

  .animate-pulse-slow {
    animation: pulse-slow 3s ease-in-out infinite;
  }

  @keyframes pulse-impact {
    0% {
      transform: scale(1);
    }
    20% {
      transform: scale(1.015);
    } /* Push in */
    40% {
      transform: scale(0.99);
    } /* Pull back slightly */
    60% {
      transform: scale(1.005);
    } /* Stabilize */
    100% {
      transform: scale(1);
    }
  }

  .animate-pulse-impact {
    animation: pulse-impact 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
  }

  @keyframes daze {
    0%,
    100% {
      opacity: 0.5;
      filter: blur(0.5px);
    }
    50% {
      opacity: 0.8;
      filter: blur(1.5px);
    }
  }

  .animate-daze {
    animation: daze 4s ease-in-out infinite;
  }

  @keyframes lucid-glow {
    0%,
    100% {
      box-shadow: 0 0 15px rgba(251, 191, 36, 0.3);
      text-shadow: 0 0 8px rgba(251, 191, 36, 0.4);
    }
    50% {
      box-shadow: 0 0 30px rgba(251, 191, 36, 0.6);
      text-shadow: 0 0 12px rgba(251, 191, 36, 0.8);
    }
  }

  .animate-lucid-glow {
    animation: lucid-glow 2s ease-in-out infinite;
  }

  /* Custom scrollbar for textarea if needed */
  textarea::-webkit-scrollbar {
    width: 6px;
  }
  textarea::-webkit-scrollbar-track {
    background: transparent;
  }
  textarea::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 10px;
  }
  textarea::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.2);
  }
</style>
