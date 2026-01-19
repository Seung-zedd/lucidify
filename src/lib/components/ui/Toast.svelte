<script lang="ts">;
  import { fade, fly } from "svelte/transition";
  import CircleAlert from "@lucide/svelte/icons/circle-alert";
  import X from "@lucide/svelte/icons/x";

  let {
    message,
    type = "error",
    onclose,
  } = $props<{
    message: string;
    type?: "error" | "success" | "info";
    onclose: () => void;
  }>();

  $effect(() => {
    const timer = setTimeout(() => {
      onclose();
    }, 5000);
    return () => clearTimeout(timer);
  });
</script>

<div
  class="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 min-w-[320px] max-w-md"
  in:fly={{ y: 20, duration: 400 }}
  out:fade={{ duration: 200 }}
>
  <div
    class="
      flex items-center gap-3 p-4 rounded-xl border shadow-2xl backdrop-blur-md
      {type === 'error' ? 'bg-red-950/80 border-red-500/50 text-red-200' : ''}
      {type === 'success'
      ? 'bg-green-950/80 border-green-500/50 text-green-200'
      : ''}
      {type === 'info' ? 'bg-zinc-900/80 border-zinc-700/50 text-zinc-200' : ''}
    "
  >
    <div class="shrink-0">
      {#if type === "error"}
        <CircleAlert class="w-5 h-5 text-red-400" />
      {:else if type === "success"}
        <CircleAlert class="w-5 h-5 text-green-400" />
      {:else}
        <CircleAlert class="w-5 h-5 text-zinc-400" />
      {/if}
    </div>

    <p class="flex-1 text-sm font-medium leading-tight">
      {message}
    </p>

    <button
      onclick={onclose}
      class="shrink-0 p-1 rounded-lg hover:bg-white/10 transition-colors"
      aria-label="Close notification"
    >
      <X class="w-4 h-4 opacity-60 hover:opacity-100" />
    </button>
  </div>
</div>
