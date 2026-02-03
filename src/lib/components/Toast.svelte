<script lang="ts">
  import { fly, fade } from "svelte/transition";
  import { toast } from "$lib/runes/toast.svelte";
  import CheckCircle from "@lucide/svelte/icons/check-circle";
  import AlertCircle from "@lucide/svelte/icons/alert-circle";
  import Info from "@lucide/svelte/icons/info";
  import X from "@lucide/svelte/icons/x";
  import { cn } from "$lib/utils";
</script>

{#if toast.isVisible}
  <div
    class="fixed bottom-8 left-1/2 -translate-x-1/2 z-100"
    in:fly={{ y: 20, duration: 400 }}
    out:fade={{ duration: 200 }}
  >
    <div
      class={cn(
        "flex items-center gap-3 px-6 py-4 rounded-2xl border backdrop-blur-xl shadow-2xl min-w-[320px]",
        toast.type === "success" &&
          "bg-emerald-500/10 border-emerald-500/20 text-emerald-300",
        toast.type === "error" &&
          "bg-red-500/10 border-red-500/20 text-red-300",
        toast.type === "info" &&
          "bg-indigo-500/10 border-indigo-500/20 text-indigo-300",
      )}
    >
      {#if toast.type === "success"}
        <CheckCircle class="w-5 h-5 shrink-0" />
      {:else if toast.type === "error"}
        <AlertCircle class="w-5 h-5 shrink-0" />
      {:else}
        <Info class="w-5 h-5 shrink-0" />
      {/if}

      <p class="text-sm font-bold tracking-wide flex-1">
        {toast.message}
      </p>

      <button
        onclick={() => toast.hide()}
        class="p-1 hover:bg-white/10 rounded-full transition-colors"
      >
        <X class="w-4 h-4" />
      </button>
    </div>
  </div>
{/if}
