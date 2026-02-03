<script lang="ts">
  import { fade, fly, scale } from "svelte/transition";
  import Sparkles from "@lucide/svelte/icons/sparkles";
  import Bookmark from "@lucide/svelte/icons/bookmark";
  import Check from "@lucide/svelte/icons/check";
  import {
    saveDreamEntry,
    isDreamSaved,
    deleteDreamEntryByPrompt,
  } from "$lib/utils/journal";
  import { toast } from "$lib/runes/toast.svelte";
  import { cn } from "$lib/utils";

  let {
    analysisResult,
    userPrompt,
    videoGenerationPrompt,
    isAnalyzing = false,
    isReadyToEnter = false,
    isAudioFinished = false,
    isGenerating = false,
    onGenerateVideo,
    onEnterDream,
    onReset,
  } = $props<{
    analysisResult: {
      title: string;
      insight: string;
      video_prompt: string;
      keywords: string[];
    } | null;
    userPrompt: string;
    videoGenerationPrompt: string;
    isAnalyzing?: boolean;
    isReadyToEnter?: boolean;
    isAudioFinished?: boolean;
    isGenerating?: boolean;
    onGenerateVideo: () => void;
    onEnterDream: () => void;
    onReset: () => void;
  }>();

  let isSaved = $state(false);

  // Sync saved state when analysis result changes
  $effect(() => {
    if (userPrompt) {
      isSaved = isDreamSaved(userPrompt);
    }
  });

  function handleBookmark() {
    if (!analysisResult) return;

    try {
      if (isSaved) {
        // Handle Removal
        deleteDreamEntryByPrompt(userPrompt);
        isSaved = false;
        toast.show("Insight removed from Journal.", "info");
      } else {
        // Handle Saving
        saveDreamEntry({
          userPrompt,
          analysisResult: {
            title: analysisResult.title,
            insight: analysisResult.insight,
            keywords: analysisResult.keywords,
          },
          videoGenerationPrompt,
        });
        isSaved = true;
        toast.show("Insight saved to Journal.", "success");
      }
    } catch (e) {
      toast.show("Failed to update journal.", "error");
    }
  }
</script>

<div
  class="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl transition-all duration-700 ease-in-out relative group"
>
  <!-- Bookmark Button -->
  {#if analysisResult && !isAnalyzing}
    <div class="absolute top-6 right-6 z-10" in:fade={{ duration: 400 }}>
      <button
        onclick={handleBookmark}
        class={cn(
          "p-3 rounded-xl transition-all duration-300 border group/btn",
          isSaved
            ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400 hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400"
            : "bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10 hover:scale-110 active:scale-95 shadow-lg",
        )}
        aria-label={isSaved ? "Remove from journal" : "Save to journal"}
      >
        {#if isSaved}
          <div in:scale>
            <Check class="w-5 h-5 block group-hover/btn:hidden" />
            <Bookmark
              class="w-5 h-5 hidden group-hover/btn:block fill-current"
            />
          </div>
        {:else}
          <Bookmark class="w-5 h-5" />
        {/if}
      </button>
    </div>
  {/if}

  <div in:fade={{ duration: 400, delay: 300 }}>
    <div class="flex items-center gap-3 mb-6">
      <div
        class="w-10 h-10 rounded-xl bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg"
      >
        <Sparkles class="w-6 h-6 text-white" />
      </div>
      <h3 class="text-sm font-bold uppercase tracking-widest text-indigo-300">
        {isAnalyzing ? "Analyzing Dream..." : "Subconscious Insight"}
      </h3>
    </div>

    {#if isAnalyzing}
      <div class="space-y-3">
        <div class="h-4 bg-white/10 rounded-full w-3/4 animate-pulse"></div>
        <div class="h-4 bg-white/10 rounded-full w-full animate-pulse"></div>
        <div class="h-4 bg-white/10 rounded-full w-5/6 animate-pulse"></div>
        <p class="text-slate-400 text-sm mt-4 animate-pulse font-medium">
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
            class="text-slate-100 text-lg leading-relaxed whitespace-pre-wrap font-medium pr-8"
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
              onclick={onEnterDream}
              class="px-8 py-3 rounded-xl bg-linear-to-r from-emerald-500 to-teal-500 text-white font-bold hover:scale-105 transition-all shadow-lg shadow-emerald-500/20 animate-pulse"
            >
              Enter Dream
            </button>
          {:else}
            <button
              onclick={onGenerateVideo}
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
            onclick={onReset}
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
