<script lang="ts">
  import ThePacer from "../ThePacer.svelte";
  let { progress = 0, status = "PROCESSING" } = $props();
</script>

<div class="relative pt-8">
  <ThePacer {progress} {status} />
  <div class="w-full bg-zinc-800 rounded-full h-4 mb-4">
    <div
      class="bg-primary h-4 rounded-full transition-all duration-500 ease-out"
      style="width: {progress}%"
    ></div>
  </div>
</div>

<div class="flex justify-between text-sm text-zinc-400">
  <span>
    {#if status === "PROCESSING"}
      Analyzing... {progress}%
    {:else if status === "COMPLETED"}
      <span class="text-primary">Complete!</span>
    {:else if status === "FAILED"}
      <span class="text-red-500">Failed</span>
    {/if}
  </span>
  <span>{progress}%</span>
</div>
