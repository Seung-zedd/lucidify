<script lang="ts">
  import { fade, fly, crossfade } from "svelte/transition";
  import { cubicInOut } from "svelte/easing";
  import Send from "@lucide/svelte/icons/send";
  import Sparkles from "@lucide/svelte/icons/sparkles";
  import Volume2 from "@lucide/svelte/icons/volume-2";
  import VolumeX from "@lucide/svelte/icons/volume-x";
  import Repeat from "@lucide/svelte/icons/repeat";
  import X from "@lucide/svelte/icons/x";

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
  } | null>(null);
  let showResult = $state(false);

  // Phase 3: Visuals & Lucid Interaction State
  let isVideoPlaying = $state(false);
  let isLucidMode = $state(false);
  let showLucidButton = $state(false);
  let videoSource = $state("/videos/demo_dream.mp4");
  let showFlash = $state(false);
  let showAchievement = $state(false);
  let isMuted = $state(false);
  let isLooping = $state(true);
  let videoElement = $state<HTMLVideoElement | null>(null);

  async function handleSubmit() {
    if (!message.trim() || isAnalyzing) return;

    isAnalyzing = true;
    showResult = false;
    analysisResult = null;

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
      if (import.meta.env.DEV) {
        console.error("Analysis Error:", e);
      }
      alert(
        e.message || "Connection to the dream world failed. Please try again.",
      );
    } finally {
      isAnalyzing = false;
    }
  }

  function handleGenerateVideo() {
    isVideoPlaying = true;
    showResult = false; // Add this to allow video player to show
    isLucidMode = false;
    showLucidButton = false;
    isMuted = false; // Start unmuted for the full experience
    videoSource = "/videos/demo_dream.mp4";

    // Show Lucid Button after 3 seconds
    setTimeout(() => {
      if (isVideoPlaying && !isLucidMode) {
        showLucidButton = true;
      }
    }, 3000);
  }

  function handleAwakening() {
    // Trigger Flash & Achievement
    showFlash = true;
    showAchievement = true;

    // Switch to Lucid Mode immediately behind the flash
    isLucidMode = true;
    videoSource = "/videos/demo_lucid.mp4";
    showLucidButton = false;

    // Reveal slowly
    setTimeout(() => (showFlash = false), 2000);
    // Hide achievement later
    setTimeout(() => (showAchievement = false), 4000);

    // Play optional sound
    const audio = new Audio("/audios/awakening.mp3");
    audio.play().catch(() => {
      if (import.meta.env.DEV) {
        console.log("Optional awakening audio not found or blocked.");
      }
    });
  }

  function handleExitVideo() {
    if (videoElement) {
      videoElement.pause();
      videoElement.src = "";
    }
    isVideoPlaying = false;
    isLucidMode = false;
    isLooping = true;
    showLucidButton = false;
    showAchievement = false;
    showFlash = false;
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
    handleExitVideo();
  }
</script>

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
            class="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl"
          >
            <div in:fade={{ duration: 400 }}>
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
                    <button
                      onclick={handleGenerateVideo}
                      class="px-8 py-3 rounded-xl bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-bold hover:scale-105 transition-all shadow-lg shadow-purple-500/20"
                    >
                      Generate Video
                    </button>
                    <button
                      onclick={handleReset}
                      class="px-8 py-3 rounded-xl border border-white/10 text-slate-300 font-bold hover:text-white hover:border-white/20 transition-all"
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
          class="fixed inset-0 z-50 bg-slate-950 flex items-center justify-center overflow-hidden"
        >
          <div
            in:fade={{ duration: 600, delay: 400 }}
            out:fade={{ duration: 400 }}
            class="relative w-full h-full"
          >
            <!-- Video Element -->
            <video
              bind:this={videoElement}
              src={videoSource}
              autoplay
              loop={isLooping}
              muted={isMuted}
              playsinline
              class="w-full h-full object-cover transition-all duration-1000"
              style="filter: {isLucidMode
                ? 'none'
                : 'grayscale(50%) sepia(20%)'}"
            >
              <track kind="captions" />
            </video>

            <!-- Holy Ambient Glow (Lucid Mode Only) -->
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
                  onclick={handleAwakening}
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
                  onclick={() => (isMuted = !isMuted)}
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
                  class="p-1.5 rounded-full hover:bg-white/10 transition-colors group/control"
                  title="Exit Dream"
                >
                  <X
                    class="w-5 h-5 text-white/70 group-hover/control:text-white"
                  />
                </button>
              </div>
            </div>

            <!-- Dream State Label -->
            <div class="absolute top-24 left-6 z-20">
              <div
                class="px-4 py-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-xs font-bold uppercase tracking-widest text-white/60"
              >
                {isLucidMode ? "Lucid State" : "Dream State"}
              </div>
            </div>
          </div>
        </div>
      {/if}
    </div>
  </div>

  <!-- Full Screen Flash Overlay -->
  {#if showFlash}
    <div
      in:fade={{ duration: 100 }}
      out:fade={{ duration: 2000 }}
      class="fixed inset-0 bg-white z-100 flex items-center justify-center"
    ></div>
  {/if}
</div>

<style>
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
