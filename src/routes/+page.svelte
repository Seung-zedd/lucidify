<script lang="ts">
  import { onMount } from "svelte";
  import { fade, fly } from "svelte/transition";

  let message = $state("");
  let response = $state("");
  let loading = $state(false);

  async function handleSubmit() {
    if (!message.trim()) return;
    loading = true;
    response = "";

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const data = await res.json();
      response = data.text || data.error;
    } catch (e) {
      response = "Failed to connect to the dream realm.";
    } finally {
      loading = false;
    }
  }
</script>

<main
  class="max-w-4xl mx-auto px-6 py-20 flex flex-col items-center justify-center min-h-screen"
>
  <div in:fly={{ y: 20, duration: 800 }} class="text-center mb-12">
    <h1
      class="text-6xl font-extrabold tracking-tight mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent"
    >
      Lucidify
    </h1>
    <p class="text-xl text-muted-foreground max-w-lg mx-auto">
      Unlock the secrets of your subconscious. Your AI-powered companion for the
      dream world.
    </p>
  </div>

  <div
    in:fade={{ delay: 400, duration: 800 }}
    class="w-full max-w-2xl space-y-6"
  >
    <div class="relative group">
      <div
        class="absolute -inset-1 bg-gradient-to-r from-primary to-primary/30 rounded-2xl blur opacity-25 group-focus-within:opacity-50 transition duration-1000"
      ></div>
      <div
        class="relative bg-card border border-border rounded-xl p-2 flex items-center shadow-2xl"
      >
        <input
          type="text"
          bind:value={message}
          placeholder="Describe your dream or ask a question..."
          class="flex-1 bg-transparent border-none focus:ring-0 px-4 py-3 text-lg outline-none"
          onkeydown={(e) => e.key === "Enter" && handleSubmit()}
        />
        <button
          onclick={handleSubmit}
          disabled={loading}
          class="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-bold hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
        >
          {loading ? "Consulting..." : "Explore"}
        </button>
      </div>
    </div>

    {#if response}
      <div
        in:fly={{ y: 10, duration: 400 }}
        class="bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl p-8 shadow-xl"
      >
        <h2
          class="text-sm font-bold uppercase tracking-widest text-primary mb-4"
        >
          Insight
        </h2>
        <p class="text-lg leading-relaxed whitespace-pre-wrap">
          {response}
        </p>
      </div>
    {/if}
  </div>

  <footer class="mt-20 text-muted-foreground text-sm">
    &copy; 2026 Lucidify. Powered by Gemini.
  </footer>
</main>

<style>
  :global(body) {
    background-image: radial-gradient(
        circle at 20% 20%,
        rgba(250, 204, 21, 0.05) 0%,
        transparent 40%
      ),
      radial-gradient(
        circle at 80% 80%,
        rgba(250, 204, 21, 0.05) 0%,
        transparent 40%
      );
  }
</style>
