<script lang="ts">
  import { fade, fly } from "svelte/transition";
  import Send from "@lucide/svelte/icons/send";
  import Sparkles from "@lucide/svelte/icons/sparkles";

  let message = $state("");
  let response = $state("");
  let loading = $state(false);

  async function handleSubmit() {
    if (!message.trim() || loading) return;

    loading = true;
    response = "";

    try {
      // Simulate API call to /api/dream
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Mock response
      response =
        "Your dream of flying over a neon-lit ocean suggests a deep desire for liberation and a connection to your creative subconscious. The vibrant colors represent untapped potential waiting to be explored.";
    } catch (e) {
      response =
        "The connection to your subconscious was interrupted. Please try again.";
    } finally {
      loading = false;
      message = "";
    }
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
              disabled={loading || !message.trim()}
              class="mb-2 mr-2 p-4 rounded-xl bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-bold hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 disabled:hover:scale-100 shadow-[0_0_20px_rgba(168,85,247,0.4)]"
              aria-label="Send to subconscious"
            >
              {#if loading}
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
      {#if loading || response}
        <div
          in:fly={{ y: 20, duration: 500 }}
          class="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl"
        >
          <div class="flex items-center gap-3 mb-6">
            <div
              class="w-10 h-10 rounded-xl bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg"
            >
              <Sparkles class="w-6 h-6 text-white" />
            </div>
            <h3
              class="text-sm font-bold uppercase tracking-widest text-indigo-300"
            >
              {loading ? "Analyzing Dream..." : "Subconscious Insight"}
            </h3>
          </div>

          {#if loading}
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
              <p class="text-slate-400 text-sm mt-4 animate-pulse font-medium">
                Connecting to subconscious...
              </p>
            </div>
          {:else}
            <p
              class="text-slate-100 text-xl leading-relaxed whitespace-pre-wrap font-medium"
            >
              {response}
            </p>

            <div class="mt-8 flex gap-4">
              <button
                class="px-8 py-3 rounded-xl bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-bold hover:scale-105 transition-all shadow-lg shadow-purple-500/20"
              >
                Generate Video
              </button>
              <button
                class="px-8 py-3 rounded-xl border border-white/10 text-slate-300 font-bold hover:text-white hover:border-white/20 transition-all"
              >
                Save to Journal
              </button>
            </div>
          {/if}
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
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
