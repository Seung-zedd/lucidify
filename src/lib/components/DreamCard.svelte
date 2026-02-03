<script lang="ts">
  import { cn } from "$lib/utils";
  import type { DreamEntry } from "$lib/utils/journal";
  import Copy from "@lucide/svelte/icons/copy";
  import Sparkles from "@lucide/svelte/icons/sparkles";
  import Video from "@lucide/svelte/icons/video";
  import { toast } from "$lib/runes/toast.svelte";

  // Props definition
  let { entry, index } = $props<{
    entry: DreamEntry;
    index: number;
  }>();

  let isFlipped = $state(false);
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
    e.stopPropagation(); // Explicitly stop bubbling for copy buttons
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.show(`${label} copied to clipboard`, "success");
  }

  function toggleFlip(e: MouseEvent) {
    // Prevent flipping when a button is clicked
    if ((e.target as HTMLElement).closest("button")) return;
    isFlipped = !isFlipped;
  }
</script>

<div
  class="group relative w-full h-[500px] perspective-1000 cursor-pointer"
  onmouseenter={() => (isHovered = true)}
  onmouseleave={() => (isHovered = false)}
  onclick={toggleFlip}
  style="--glow-start: {startColor}; --glow-end: {endColor};"
  role="button"
  tabindex="0"
  onkeydown={(e) => e.key === "Enter" && (isFlipped = !isFlipped)}
>
  <div
    class={cn(
      "relative w-full h-full transition-all duration-600 ease-out transform-style-3d shadow-2xl",
      isFlipped && "rotate-y-180",
    )}
    style="transform: {isHovered && !isFlipped
      ? 'translateY(-15px)'
      : ''} {isFlipped ? 'rotateY(180deg)' : 'rotateY(0)'};"
  >
    <!-- Front Face -->
    <div
      class="absolute inset-0 w-full h-full backface-hidden rounded-2xl overflow-hidden border border-white/10"
    >
      <div
        class="absolute inset-0 opacity-80 transition-opacity duration-500 group-hover:opacity-100"
        style="background: linear-gradient(135deg, {startColor}, {endColor});"
      ></div>

      <div class="absolute inset-0 bg-noise opacity-20 mix-blend-overlay"></div>

      <div
        class="relative z-10 flex flex-col justify-between h-full p-8 text-white"
      >
        <div
          class="text-xs font-bold tracking-[0.3em] opacity-80 uppercase border-b border-white/20 pb-2 inline-block self-start font-sans"
        >
          {formattedDate}
        </div>

        <div class="flex-1 flex items-center justify-center">
          <h3
            class="text-4xl font-serif font-black text-center leading-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
          >
            {entry.analysisResult?.title || "Untitled Dream"}
          </h3>
        </div>

        <div class="flex flex-wrap gap-2 justify-center">
          {#each entry.analysisResult?.keywords?.slice(0, 3) || [] as tag}
            <span
              class="px-3 py-1 text-[10px] font-bold bg-black/20 backdrop-blur-md rounded-full border border-white/10 uppercase tracking-widest"
            >
              #{tag}
            </span>
          {/each}
        </div>
      </div>

      <div
        class="absolute inset-0 rounded-2xl ring-1 ring-white/30 group-hover:ring-white/50 transition-all pointer-events-none"
      ></div>
    </div>

    <!-- Back Face -->
    <div
      class="absolute inset-0 w-full h-full backface-hidden rounded-2xl overflow-hidden bg-[#0a0a0a] border border-white/10 text-left flex flex-col"
      style="transform: rotateY(180deg);"
    >
      <!-- Gradient Fade Overlays for Depth -->
      <div
        class="absolute top-0 left-0 right-0 h-12 bg-linear-to-b from-black to-transparent z-40 pointer-events-none"
      ></div>
      <div
        class="absolute bottom-0 left-0 right-0 h-12 bg-linear-to-t from-black to-transparent z-40 pointer-events-none"
      ></div>

      <!-- Scrollable Container -->
      <div
        class="flex-1 overflow-y-auto custom-scrollbar p-6 pt-4 space-y-8"
        onclick={(e) => e.stopPropagation()}
        role="presentation"
      >
        <!-- Section: Insight -->
        <div class="relative group/section">
          <div
            class="sticky top-0 z-30 flex items-center justify-between py-4 mb-2 bg-[#0a0a0a]/80 backdrop-blur-md -mx-6 px-6"
          >
            <h4
              class="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-transparent bg-clip-text bg-linear-to-r from-amber-200 to-yellow-400"
            >
              <Sparkles class="w-4 h-4 text-yellow-400" />
              Subconscious Insight
            </h4>
            <button
              class="p-2 rounded-full bg-white/5 hover:bg-yellow-500/20 text-white/60 hover:text-yellow-400 transition-all hover:scale-110 active:scale-95 z-50"
              onclick={(e) =>
                copyToClipboard(e, entry.analysisResult?.insight, "Insight")}
              title="Copy Insight"
            >
              <Copy class="w-4 h-4" />
            </button>
          </div>

          <p class="text-base text-gray-300 leading-relaxed font-light px-1">
            {entry.analysisResult?.insight}
          </p>
        </div>

        <div class="w-full h-px bg-white/10"></div>

        <!-- Section: Prompt -->
        <div class="relative group/section pb-8">
          <div
            class="sticky top-0 z-30 flex items-center justify-between py-4 mb-2 bg-[#0a0a0a]/80 backdrop-blur-md -mx-6 px-6"
          >
            <h4
              class="flex items-center gap-2 text-[10px] font-black text-indigo-300 uppercase tracking-[0.3em]"
            >
              <Video class="w-3.5 h-3.5" />
              Video Prompt
            </h4>
            <button
              class="p-2 rounded-full bg-white/5 hover:bg-purple-500/20 text-white/60 hover:text-purple-400 transition-all hover:scale-110 active:scale-95 z-50"
              onclick={(e) =>
                copyToClipboard(e, entry.videoGenerationPrompt, "Prompt")}
              title="Copy Prompt"
            >
              <Copy class="w-4 h-4" />
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
  /* 3D Perspective Utilities */
  .perspective-1000 {
    perspective: 1000px;
  }
  .transform-style-3d {
    transform-style: preserve-3d;
  }
  .backface-hidden {
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
  }

  /* Custom Scrollbar */
  .custom-scrollbar::-webkit-scrollbar {
    width: 8px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.3);
    border-radius: 20px;
    border: 2px solid transparent; /* Gives it some 'air' */
    background-clip: content-box;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background-color: rgba(255, 255, 255, 0.5);
  }

  /* Noise Texture */
  .bg-noise {
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E");
  }
</style>
