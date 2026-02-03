<script lang="ts">
  import { onMount } from "svelte";
  import { fade, fly } from "svelte/transition";
  import Sparkles from "@lucide/svelte/icons/sparkles";
  import Video from "@lucide/svelte/icons/video";
  import Zap from "@lucide/svelte/icons/zap";
  import Layers from "@lucide/svelte/icons/layers";
  import ShieldCheck from "@lucide/svelte/icons/shield-check";
  import ArrowLeft from "@lucide/svelte/icons/arrow-left";
  import Headset from "@lucide/svelte/icons/headset";

  let stars: {
    left: string;
    top: string;
    width: string;
    delay: string;
    twinkle: boolean;
  }[] = $state([]);

  onMount(() => {
    const newStars = [];
    for (let i = 0; i < 40; i++) {
      newStars.push({
        left: Math.random() * 100 + "%",
        top: Math.random() * 100 + "%",
        width: Math.random() * 2 + 1 + "px",
        delay: Math.random() * 3 + "s",
        twinkle: Math.random() > 0.5,
      });
    }
    stars = newStars;
  });

  const updates = [
    {
      date: "Feb 2026",
      title: "Major Release: Visualizing Dreams in Motion",
      description:
        "Successfully recorded and edited the comprehensive demo video showcasing the full immersive flow of Lucidify. From poetic dream descriptions to cinematic video manifestation.",
      icon: Video,
      color: "text-rose-400",
      bg: "bg-rose-400/10",
    },
    {
      date: "Jan 2026",
      title: "The Dream Engine: Poetry to Reality",
      description:
        "Integrated Gemini 2.5 Flash as the 'Dream Architect'. Implemented Hypnotic Writing and automated aesthetic sanitization to ensure every dream is both vivid and artistic.",
      icon: Sparkles,
      color: "text-amber-400",
      bg: "bg-amber-400/10",
    },
    {
      date: "Jan 2026",
      title: "Manifestation Overhaul & Dynamic Audio",
      description:
        "Deployed Multi-Model Orchestration featuring Google Veo 3.1 and Imagen 4.0. Added Smart Ambient Audio Matching with cinematic fading and zero-clash transitions.",
      icon: Headset,
      color: "text-indigo-400",
      bg: "bg-indigo-400/10",
    },
    {
      date: "Jan 2026",
      title: "Perfect Sync & Pacing",
      description:
        "Fixed audio-visual desync using Parallel Synthesis and aggressive SSML pacing (Neural2-F). The narrator now matches the generated script with hypnotic precision.",
      icon: Zap,
      color: "text-cyan-400",
      bg: "bg-cyan-400/10",
    },
    {
      date: "Dec 2025",
      title: "Lucid Mode & Swan Architecture",
      description:
        "Launched 'Take Control' flow allowing real-time dream modification. Established 'Swan Architecture' using SSE for a graceful, reactive frontend experience.",
      icon: Layers,
      color: "text-purple-400",
      bg: "bg-purple-400/10",
    },
    {
      date: "Dec 2025",
      title: "Technical Foundation & Reliability",
      description:
        "Full migration to Svelte 5 Runes. Implemented serverless reliability measures, GCP key isolation, and enhanced Vercel preview debugging protocols.",
      icon: ShieldCheck,
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
    },
  ];
</script>

<svelte:head>
  <title>What's New | Lucidify</title>
  <meta
    name="description"
    content="Explore the latest features and architectural updates of Lucidify."
  />
  <link
    href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;800;900&display=swap"
    rel="stylesheet"
  />
</svelte:head>

<div
  class="min-h-screen bg-black text-white selection:bg-purple-500/30 font-sans relative"
>
  <!-- Immersive Background Layers -->
  <div class="fixed inset-0 z-0">
    <div
      class="absolute inset-0 bg-radial-at-t from-indigo-900/40 via-black to-black"
    ></div>
    <div
      class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10"
    ></div>
  </div>

  <!-- Stars Layer -->
  <div class="fixed inset-0 z-0 pointer-events-none">
    {#each stars as star}
      <div
        class="star"
        class:twinkle={star.twinkle}
        style:left={star.left}
        style:top={star.top}
        style:width={star.width}
        style:height={star.width}
        style:animation-delay={star.delay}
      ></div>
    {/each}
  </div>

  <div class="relative z-10 max-w-4xl mx-auto px-6 py-24">
    <!-- Header -->
    <header class="mb-24 text-center" in:fade={{ duration: 1000 }}>
      <div
        class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-900/50 backdrop-blur-md border border-white/10 text-[10px] font-bold tracking-[0.2em] text-purple-400 mb-8 uppercase"
      >
        <Sparkles class="w-3 h-3" />
        <span>Project Chronicles</span>
      </div>
      <h1
        class="text-6xl md:text-8xl font-black mb-6 tracking-tighter font-serif"
      >
        What's <span
          class="bg-linear-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
          >New.</span
        >
      </h1>
      <p
        class="text-zinc-400 text-xl max-w-2xl mx-auto leading-relaxed font-light"
      >
        Witness the evolution of the Dream Engine as we blur the lines between
        subconscious thoughts and cinematic reality.
      </p>
    </header>

    <!-- Timeline -->
    <div class="space-y-16">
      {#each updates as update, i}
        <div
          class="relative group"
          in:fly={{ y: 30, delay: 150 * i, duration: 800 }}
        >
          <!-- Vertical Line -->
          {#if i !== updates.length - 1}
            <div
              class="absolute left-6 top-20 bottom-[-32px] w-px bg-linear-to-b from-zinc-800 to-transparent opacity-50"
            ></div>
          {/if}

          <div class="flex gap-10">
            <!-- Icon/Node -->
            <div class="shrink-0 relative">
              <div
                class="w-14 h-14 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center group-hover:border-purple-500/50 transition-all duration-500 shadow-2xl group-hover:shadow-purple-500/20 group-hover:scale-110"
              >
                <update.icon class="w-7 h-7 {update.color}" />
              </div>
            </div>

            <!-- Content -->
            <div
              class="pb-16 border-b border-white/5 group-hover:border-white/10 transition-colors w-full"
            >
              <div class="flex items-center gap-4 mb-3">
                <span
                  class="text-xs font-bold tracking-widest text-zinc-500 uppercase"
                  >{update.date}</span
                >
                {#if i === 0}
                  <div
                    class="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/20"
                  >
                    <div
                      class="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"
                    ></div>
                    <span
                      class="text-rose-500 text-[10px] font-black uppercase tracking-wider"
                      >Latest</span
                    >
                  </div>
                {/if}
              </div>
              <h2
                class="text-3xl font-bold mb-4 text-white font-serif group-hover:translate-x-1 transition-transform duration-300"
              >
                {update.title}
              </h2>
              <p class="text-zinc-400 leading-relaxed text-lg font-light">
                {update.description}
              </p>
            </div>
          </div>
        </div>
      {/each}
    </div>

    <!-- CTA & Back -->
    <div class="mt-32 text-center" in:fade={{ delay: 1000 }}>
      <a
        href="/dream"
        class="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-all text-sm font-bold uppercase tracking-widest group"
      >
        <ArrowLeft
          class="w-4 h-4 transition-transform group-hover:-translate-x-1"
        />
        Back to the Waking World
      </a>
    </div>
  </div>
</div>

<style>
  :global(body) {
    background-color: black;
    font-family: "Inter", sans-serif;
  }

  /* Star Twinkle */
  .star {
    position: absolute;
    background: white;
    border-radius: 50%;
    transition: opacity 2s ease;
    opacity: 0.4;
  }

  .twinkle {
    animation: twinkle 4s infinite;
  }
  @keyframes twinkle {
    0%,
    100% {
      opacity: 0.1;
    }
    50% {
      opacity: 0.8;
    }
  }

  .font-serif {
    font-family: "Inter", sans-serif; /* We want the Inter heavy weight which looks serif-like or actually use a serif if preferred, but Inter is used in homepage */
    /* Homepage uses Inter with font-black for headings. Let's stick to Inter for consistency but use font-black */
  }

  h1,
  h2 {
    letter-spacing: -0.05em;
  }
</style>
