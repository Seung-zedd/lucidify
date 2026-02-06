<script lang="ts">
  import { cn } from "$lib/utils";
  import type { DreamEntry } from "$lib/utils/journal";
  import Copy from "@lucide/svelte/icons/copy";
  import Sparkles from "@lucide/svelte/icons/sparkles";
  import Video from "@lucide/svelte/icons/video";
  import Trash2 from "@lucide/svelte/icons/trash-2";
  import { toast } from "$lib/runes/toast.svelte";

  // Props definition
  let { entry, index, onremove } = $props<{
    entry: DreamEntry;
    index: number;
    onremove: () => void;
  }>();

  let isHovered = $state(false);

  // 🎨 Mystical Gradient Palette (The Chroma Aura System)
  const gradients = [
    ["#ff00cc", "#333399"], // Purple/Pink
    ["#00ff75", "#3700ff"], // Green/Blue
    ["#ff4d4d", "#f9cb28"], // Red/Gold
    ["#4facfe", "#00f2fe"], // Cyan/Blue
    ["#fa709a", "#fee140"], // Orange/Yellow
    ["#f77062", "#fe5196"], // Coral/Pink
    ["#a8edea", "#fed6e3"], // Teal/Pastel
    ["#8E2DE2", "#4A00E0"], // Deep Violet
  ];

  // Select color based on index
  const [startColor, endColor] = $derived(gradients[index % gradients.length]);

  // Date Formatting
  const formattedDate = $derived(
    new Date(entry.createdAt).toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    }),
  );

  // Copy Functions
  function copyToClipboard(e: MouseEvent, text: string, label: string) {
    e.stopPropagation();
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.show(`${label} copied to clipboard`, "success");
  }
</script>

<div
  class="group gallery-ticket-wrapper relative w-full h-[600px] cursor-default transition-all duration-500 ease-out"
  onmouseenter={() => (isHovered = true)}
  onmouseleave={() => (isHovered = false)}
  style="--glow-start: {startColor}; --glow-end: {endColor}; {isHovered
    ? 'transform: translateY(-10px);'
    : ''}"
  role="presentation"
>
  <!-- Dedicated Glow Element (Outside overflow:hidden) -->
  <div class="gallery-glow"></div>

  <!-- Content Container (Handles clipping) -->
  <div
    class="ticket-content relative z-1 w-full h-full rounded-4xl overflow-hidden border border-white/10 flex flex-col bg-[#0a0a0a] shadow-2xl"
  >
    <!-- Top Section (40%): The Art -->
    <div
      class="h-[40%] relative flex flex-col justify-between p-6 overflow-hidden"
    >
      <!-- Background Gradient -->
      <div
        class="absolute inset-0 opacity-100 transition-opacity duration-500"
        style="background: linear-gradient(135deg, {startColor}, {endColor});"
      ></div>

      <!-- Noise Texture -->
      <div class="absolute inset-0 bg-noise opacity-30 mix-blend-overlay"></div>

      <!-- Delete Button (Top Right) -->
      <button
        class="absolute top-4 right-4 z-30 p-2.5 rounded-xl bg-black/20 backdrop-blur-md border border-white/10 text-white/50 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/30 transition-all duration-300 hover:scale-110 active:scale-95 group/trash"
        onclick={(e) => {
          e.stopPropagation();
          onremove();
        }}
        title="Remove Dream"
      >
        <Trash2
          class="w-4 h-4 transition-transform group-hover/trash:rotate-12"
        />
      </button>

      <!-- Content -->
      <div
        class="relative z-10 flex flex-col justify-between h-full text-white"
      >
        <div
          class="text-[10px] font-black tracking-[0.4em] opacity-80 uppercase font-sans drop-shadow-md"
        >
          {formattedDate}
        </div>

        <div class="flex-1 flex items-center justify-center py-2">
          <h3
            class="text-2xl md:text-3xl font-serif font-black text-center leading-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)] line-clamp-2"
          >
            {entry.analysisResult?.title || "Untitled Dream"}
          </h3>
        </div>

        <div class="flex flex-wrap gap-2 justify-center">
          {#each entry.analysisResult?.keywords?.slice(0, 3) || [] as tag}
            <span
              class="px-3 py-1 text-[9px] font-bold bg-black/30 backdrop-blur-md rounded-full border border-white/10 uppercase tracking-widest"
            >
              #{tag}
            </span>
          {/each}
        </div>
      </div>
    </div>

    <!-- Bottom Section (60%): The Details -->
    <div class="flex-1 min-h-0 relative flex flex-col bg-zinc-950">
      <!-- Gradient Fade Overlays for Depth -->
      <div
        class="absolute top-0 left-0 right-0 h-10 bg-linear-to-b from-zinc-950 to-transparent z-20 pointer-events-none"
      ></div>
      <div
        class="absolute bottom-0 left-0 right-0 h-10 bg-linear-to-t from-zinc-950 to-transparent z-20 pointer-events-none"
      ></div>

      <!-- Scrollable Content Area -->
      <div
        class="flex-1 overflow-y-auto ticket-scrollbar p-6 space-y-6"
        onclick={(e) => e.stopPropagation()}
        role="presentation"
      >
        <!-- Section: Insight -->
        <div class="relative">
          <div
            class="sticky top-0 z-10 flex items-center justify-between py-3 mb-2 bg-zinc-950/80 backdrop-blur-md -mx-6 px-6"
          >
            <h4
              class="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-transparent bg-clip-text bg-linear-to-r from-amber-200 to-yellow-400"
            >
              <Sparkles class="w-3.5 h-3.5 text-yellow-400" />
              Manifestation
            </h4>
            <button
              class="p-2 rounded-full bg-white/5 hover:bg-yellow-500/20 text-white/60 hover:text-yellow-400 transition-all hover:scale-110 active:scale-95"
              onclick={(e) =>
                copyToClipboard(e, entry.analysisResult?.insight, "Insight")}
              title="Copy Insight"
            >
              <Copy class="w-3.5 h-3.5" />
            </button>
          </div>

          <p
            class="text-[15px] text-gray-300 leading-relaxed font-light px-1 pb-2"
          >
            {entry.analysisResult?.insight}
          </p>
        </div>

        <div class="w-full h-px bg-white/5"></div>

        <!-- Section: Video Prompt -->
        <div class="relative pb-6">
          <div
            class="sticky top-0 z-10 flex items-center justify-between py-3 mb-2 bg-zinc-950/80 backdrop-blur-md -mx-6 px-6"
          >
            <h4
              class="flex items-center gap-2 text-[10px] font-black text-indigo-300 uppercase tracking-[0.35em]"
            >
              <Video class="w-3.5 h-3.5 font-bold" />
              Director Choice
            </h4>
            <button
              class="p-2 rounded-full bg-white/5 hover:bg-indigo-500/20 text-white/60 hover:text-indigo-400 transition-all hover:scale-110 active:scale-95"
              onclick={(e) =>
                copyToClipboard(e, entry.videoGenerationPrompt, "Prompt")}
              title="Copy Prompt"
            >
              <Copy class="w-3.5 h-3.5" />
            </button>
          </div>

          <div
            class="p-4 rounded-xl bg-black/40 border border-white/5 font-mono text-[11px] text-slate-400 leading-relaxed wrap-break-word select-text mx-1"
          >
            {entry.videoGenerationPrompt || "No prompt recorded."}
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  /* 🌟 The Gallery Glow - Logic Update 🌟 */
  .gallery-glow {
    position: absolute;
    z-index: -1; /* Behind the card */

    /* Positioning */
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;

    /* Gradient */
    background: linear-gradient(to bottom, var(--glow-start), var(--glow-end));

    /* ✅ IMPORTANT: Default State (Resting on Floor) */
    /* Push it DOWN (translateY) so it is visible below the card bottom */
    transform: translateY(25px) scale(0.9);
    filter: blur(25px);
    opacity: 0.6; /* Make sure it's visible! */
    border-radius: 2rem;

    /* Smooth Transition */
    transition: all 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);
  }

  /* 🚀 Hover State (Awakening) */
  .group:hover .gallery-glow {
    /* Expand to surround the card */
    transform: translateY(0) scale(1.05); /* Centered & Slightly larger than card */
    filter: blur(45px); /* Intense Blur */
    opacity: 0.8; /* Brighter */
  }

  /* Custom Ticket Scrollbar */
  .ticket-scrollbar::-webkit-scrollbar {
    width: 8px;
  }
  .ticket-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .ticket-scrollbar::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.25);
    border-radius: 20px;
    border: 2px solid transparent;
    background-clip: content-box;
  }
  .ticket-scrollbar::-webkit-scrollbar-thumb:hover {
    background-color: rgba(255, 255, 255, 0.4);
  }

  /* Noise Texture */
  .bg-noise {
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E");
    pointer-events: none;
  }
</style>
