<script lang="ts">
  import { onMount } from "svelte";
  import { fade, fly } from "svelte/transition";
  import {
    getDreamEntries,
    deleteDreamEntry,
    type DreamEntry,
  } from "$lib/utils/journal";
  import DreamCard from "$lib/components/DreamCard.svelte";
  import ConfirmModal from "$lib/components/ui/ConfirmModal.svelte";
  import Sparkles from "@lucide/svelte/icons/sparkles";
  import BookOpen from "@lucide/svelte/icons/book-open";
  import { toast } from "$lib/runes/toast.svelte";

  let entries = $state<DreamEntry[]>([]);
  let isLoading = $state(true);
  let entryToDelete = $state<DreamEntry | null>(null);

  onMount(() => {
    // Load entries from Local Storage
    entries = getDreamEntries();
    isLoading = false;
  });

  function initiateDelete(entry: DreamEntry) {
    entryToDelete = entry;
  }

  function confirmDelete() {
    if (entryToDelete) {
      deleteDreamEntry(entryToDelete.id);
      entries = entries.filter((e) => e.id !== entryToDelete?.id);
      entryToDelete = null;
      toast.show("Dream entry removed from archives.", "success");
    }
  }
</script>

<svelte:head>
  <title>Dream Journal | Lucidify</title>
</svelte:head>

<div class="min-h-screen p-6 md:p-12 max-w-7xl mx-auto space-y-12">
  <!-- Header Section -->
  <header class="text-center space-y-4" in:fly={{ y: -20, duration: 800 }}>
    <div
      class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-linear-to-r from-indigo-500/10 to-purple-500/10 border border-white/10 text-indigo-300 text-sm font-bold mb-2 shadow-[0_0_20px_rgba(168,85,247,0.1)]"
    >
      <BookOpen class="w-4 h-4" />
      <span>The Subconscious Archives</span>
    </div>
    <h2
      class="text-4xl md:text-6xl font-black text-white tracking-tight font-serif"
    >
      Your Dream <span
        class="bg-linear-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
        >Journal</span
      >
    </h2>
    <p class="text-slate-400 text-lg max-w-xl mx-auto font-medium">
      A mystical collection of your recorded visions and subconscious insights.
    </p>
  </header>

  {#if isLoading}
    <div class="flex flex-col items-center justify-center py-24 space-y-4">
      <div
        class="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"
      ></div>
      <p class="text-slate-500 font-bold uppercase tracking-widest text-xs">
        Opening the archives...
      </p>
    </div>
  {:else if entries.length === 0}
    <div
      class="flex flex-col items-center justify-center py-32 space-y-6 text-center"
      in:fade={{ duration: 800 }}
    >
      <div
        class="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center border border-white/10 mb-4 animate-pulse"
      >
        <Sparkles class="w-10 h-10 text-slate-600" />
      </div>
      <h3 class="text-2xl font-serif font-bold text-white">
        No dreams recorded yet.
      </h3>
      <p class="text-slate-400 max-w-xs mx-auto">
        Your subconscious is waiting to be explored. Record your first dream to
        see it appear here.
      </p>
      <a
        href="/dream"
        class="px-8 py-3 rounded-xl bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-bold hover:scale-105 transition-all shadow-lg shadow-purple-500/20"
      >
        Start Dreaming
      </a>
    </div>
  {:else}
    <!-- Grid of Mystic Cards -->
    <div
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-24"
      in:fade={{ duration: 1000, delay: 200 }}
    >
      {#each entries as entry, i (entry.id)}
        <div in:fly={{ y: 30, duration: 600, delay: i * 100 }}>
          <DreamCard {entry} index={i} onremove={() => initiateDelete(entry)} />
        </div>
      {/each}
    </div>
  {/if}
</div>

{#if entryToDelete}
  <ConfirmModal
    title="Excise from Memory?"
    message="Are you certain you wish to delete this dream? Once lost to the void, it cannot be reclaimed."
    confirmText="Delete Forever"
    onconfirm={confirmDelete}
    oncancel={() => (entryToDelete = null)}
  />
{/if}

<style>
  /* Optional: Smooth page transition bg */
  :global(body) {
    background-color: #020617; /* Deep slate-950 */
  }
</style>
