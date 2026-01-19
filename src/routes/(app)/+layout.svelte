<script lang="ts">
  import { fade } from "svelte/transition";
  let { children } = $props();
</script>

<div class="flex flex-col min-h-screen bg-slate-950 text-slate-100 font-sans">
  <!-- App Header / Navigation -->
  <header
    class="sticky top-0 z-50 border-b border-white/10 bg-slate-950/40 backdrop-blur-xl px-6 py-4 shadow-2xl"
  >
    <div class="max-w-4xl mx-auto flex justify-between items-center">
      <h1
        class="text-2xl font-black tracking-tighter bg-linear-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent font-serif"
      >
        Lucidify
      </h1>
      <nav
        class="flex gap-8 text-sm font-bold uppercase tracking-widest text-slate-400"
      >
        <a href="/dream" class="hover:text-white transition-colors">Explore</a>
        <a href="/" class="hover:text-white transition-colors">About</a>
      </nav>
    </div>
  </header>

  <main class="flex-1">
    {@render children()}
  </main>

  <!-- Mobile Bottom Navigation (Optional/PWA style) -->
  <footer
    class="md:hidden sticky bottom-0 border-t border-white/10 bg-slate-950/80 backdrop-blur-xl px-6 py-4"
  >
    <!-- Add mobile nav icons here -->
  </footer>
</div>
