<script lang="ts">
  import { cn } from "$lib/utils";
  import type { DreamEntry } from "$lib/utils/journal";
  import Sparkles from "@lucide/svelte/icons/sparkles";

  let { entry, index } = $props<{
    entry: DreamEntry;
    index: number;
  }>();

  let isFlipped = $state(false);

  const mysticalGradients = [
    ["#ff00cc", "#333399"], // Purple/Pink
    ["#00ff75", "#3700ff"], // Green/Blue
    ["#ff4d4d", "#f9cb28"], // Red/Gold
    ["#4facfe", "#00f2fe"], // Cyan/Blue
    ["#fa709a", "#fee140"], // Orange/Yellow
    ["#f77062", "#fe5196"], // Coral/Pink
    ["#a8edea", "#fed6e3"], // Teal/Pastel
    ["#434343", "#000000"], // Dark Mystic
  ];

  const selectedColors = $derived(
    mysticalGradients[index % mysticalGradients.length],
  );

  const formattedDate = $derived(
    new Date(entry.createdAt).toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    }),
  );

  function toggleFlip() {
    isFlipped = !isFlipped;
  }
</script>

<!-- Card Container (Interactivity Layer) -->
<div
  role="button"
  tabindex="0"
  onclick={toggleFlip}
  onkeydown={(e) => e.key === "Enter" && toggleFlip()}
  class="card-container group relative w-full h-[400px] cursor-pointer"
  style="--glow-start: {selectedColors[0]}; --glow-end: {selectedColors[1]};"
>
  <!-- Flip Inner Container -->
  <div
    class={cn(
      "flip-card-inner relative w-full h-full transition-all duration-600 ease-out",
      isFlipped && "is-flipped",
    )}
  >
    <!-- Front Face -->
    <div
      class="card-face card-front absolute inset-0 w-full h-full p-6 rounded-2xl flex flex-col justify-between overflow-hidden"
    >
      <div class="z-10 flex flex-col items-start gap-2">
        <span
          class="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400"
        >
          {formattedDate}
        </span>
        <h3
          class="text-3xl font-serif font-black text-white leading-tight drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]"
        >
          {entry.analysisResult.title}
        </h3>
      </div>

      <div class="z-10 flex flex-wrap gap-2 pt-4 border-t border-white/10">
        {#each entry.analysisResult.keywords as keyword}
          <span
            class="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-slate-300 font-medium"
          >
            #{keyword}
          </span>
        {/each}
      </div>
    </div>

    <!-- Back Face -->
    <div
      class="card-face card-back absolute inset-0 w-full h-full p-6 rounded-2xl flex flex-col overflow-hidden"
    >
      <div class="flex items-center gap-2 mb-4 shrink-0">
        <Sparkles class="w-4 h-4 text-yellow-400" />
        <h4 class="text-xs font-bold uppercase tracking-widest text-yellow-400">
          Subconscious Insight
        </h4>
      </div>

      <div class="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <p class="text-sm leading-relaxed text-slate-100 font-medium">
          {entry.analysisResult.insight}
        </p>
      </div>

      <div class="mt-4 pt-4 border-t border-white/20 shrink-0">
        <span
          class="text-[10px] font-bold uppercase tracking-widest text-indigo-400 mb-2 block"
        >
          Video Prompt
        </span>
        <div
          class="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20"
        >
          <p class="text-[10px] font-mono leading-tight text-slate-300 italic">
            "{entry.videoGenerationPrompt}"
          </p>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .card-container {
    perspective: 1000px;
  }

  .flip-card-inner {
    transform-style: preserve-3d;
  }

  /* Hover Anticipation: Levitation & Aura Boost */
  .card-container:hover .flip-card-inner {
    transform: translateY(-15px);
  }

  .flip-card-inner.is-flipped {
    transform: rotateY(180deg);
  }

  /* Keep levitation when flipped if hovered */
  .card-container:hover .flip-card-inner.is-flipped {
    transform: translateY(-15px) rotateY(180deg);
  }

  .card-face {
    backface-visibility: hidden;
    background: #1a1a1a;
  }

  .card-back {
    transform: rotateY(180deg);
    background: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(12px);
  }

  /* The Mystical Aura Border Effect */
  .card-face::before {
    content: "";
    position: absolute;
    inset: -3px;
    background: linear-gradient(163deg, var(--glow-start), var(--glow-end));
    z-index: -1;
    border-radius: inherit;
    opacity: 0.3;
    transition: all 0.6s ease-out;
  }

  .card-container:hover .card-face::before {
    opacity: 1;
    filter: blur(8px);
  }

  /* Custom Scrollbar */
  .custom-scrollbar::-webkit-scrollbar {
    width: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 10px;
  }
</style>
