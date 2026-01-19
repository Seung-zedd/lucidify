<script lang="ts">
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
      flex items-center gap-4 p-5 rounded-2xl border shadow-2xl backdrop-blur-2xl
      {type === 'error' ? 'bg-red-950/40 border-red-500/30 text-red-100' : ''}
      {type === 'success'
      ? 'bg-indigo-950/40 border-indigo-500/30 text-indigo-100'
      : ''}
      {type === 'info' ? 'bg-slate-900/40 border-white/10 text-slate-100' : ''}
    "
  >
    <div class="shrink-0">
      {#if type === "error"}
        <div class="p-2 rounded-lg bg-red-500/20">
          <CircleAlert class="w-5 h-5 text-red-400" />
        </div>
      {:else if type === "success"}
        <div class="p-2 rounded-lg bg-indigo-500/20">
          <CircleAlert class="w-5 h-5 text-indigo-400" />
        </div>
      {:else}
        <div class="p-2 rounded-lg bg-white/10">
          <CircleAlert class="w-5 h-5 text-slate-400" />
        </div>
      {/if}
    </div>

    <p class="flex-1 text-base font-bold leading-tight">
      {message}
    </p>

    <button
      onclick={onclose}
      class="shrink-0 p-2 rounded-xl hover:bg-white/10 transition-colors"
      aria-label="Close notification"
    >
      <X class="w-5 h-5 opacity-60 hover:opacity-100" />
    </button>
  </div>
</div>
