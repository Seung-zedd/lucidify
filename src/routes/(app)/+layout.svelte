<script lang="ts">
  import { fade } from "svelte/transition";
  let { children } = $props();
</script>

<div class="flex flex-col min-h-screen bg-zinc-950 text-zinc-100">
  <!-- App Header / Navigation -->
  <header class="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md px-6 py-4">
    <div class="max-w-4xl mx-auto flex justify-between items-center">
      <h1 class="text-xl font-bold tracking-tight text-primary">Lucidify</h1>
      <nav class="flex gap-6 text-sm font-medium text-zinc-400">
        <a href="/dream" class="hover:text-white transition-colors">Explore</a>
        <a href="/" class="hover:text-white transition-colors">About</a>
      </nav>
    </div>
  </header>

  <main class="flex-1">
    {@render children()}
  </main>

  <!-- Mobile Bottom Navigation (Optional/PWA style) -->
  <footer class="md:hidden sticky bottom-0 border-t border-zinc-800 bg-zinc-950 px-6 py-4">
     <!-- Add mobile nav icons here -->
  </footer>
</div>