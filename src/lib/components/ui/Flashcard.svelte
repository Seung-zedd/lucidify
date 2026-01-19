<script lang="ts">
  import Markdown from "./Markdown.svelte";
  import { cn } from "$lib/utils";

  interface Card {
    question: string;
    answer: string;
    page?: number;
  }

  let {
    card,
    viewMode = "grid",
    showPageInfo = true,
  } = $props<{
    card: Card;
    viewMode?: "grid" | "list";
    showPageInfo?: boolean;
  }>();
</script>

<div
  class={cn(
    "rounded-xl p-px bg-linear-to-br from-primary/50 to-primary hover:from-primary hover:to-primary transition-all duration-300 h-full",
    viewMode === "list" ? "w-full" : "",
  )}
>
  <div
    class={cn(
      "relative rounded-xl bg-card flex h-full",
      viewMode === "grid" ? "flex-col p-6 gap-6" : "items-start p-5 gap-4",
    )}
  >
    {#if showPageInfo && card.page}
      {#if viewMode === "grid"}
        <span
          class="absolute top-4 right-4 bg-primary/10 border border-primary/20 text-primary text-sm font-bold px-2 py-0.5 rounded-md transition-all"
        >
          P.{card.page}
        </span>
      {:else}
        <div class="shrink-0 pt-1 w-16">
          <span
            class="px-2 py-1 bg-primary/10 border border-primary/20 rounded text-primary text-[10px] font-black tracking-widest"
          >
            P.{card.page}
          </span>
        </div>
      {/if}
    {/if}

    {#if viewMode === "grid"}
      <div class="flex flex-col gap-2">
        <span class="text-xs font-bold uppercase tracking-wider text-primary">
          Question
        </span>
        <p class="text-foreground font-medium leading-relaxed text-lg">
          <Markdown text={card.question} />
        </p>
      </div>

      <div class="flex flex-col gap-2">
        <span
          class="text-muted-foreground text-xs font-bold uppercase tracking-wider"
        >
          Answer
        </span>
        <p class="text-muted-foreground text-base leading-relaxed">
          <Markdown text={card.answer} />
        </p>
      </div>
    {:else}
      <div class="flex-1 grid grid-cols-1 md:grid-cols-10 gap-6 w-full">
        <div class="flex flex-col gap-2 md:col-span-4">
          <span
            class="text-xs font-bold uppercase tracking-wider text-primary/80"
          >
            Question
          </span>
          <p class="text-foreground font-medium leading-relaxed text-base">
            <Markdown text={card.question} />
          </p>
        </div>

        <div
          class="flex flex-col gap-2 md:col-span-6 md:border-l md:border-border md:pl-6"
        >
          <span
            class="text-muted-foreground text-xs font-bold uppercase tracking-wider"
          >
            Answer
          </span>
          <p class="text-muted-foreground text-base leading-relaxed">
            <Markdown text={card.answer} />
          </p>
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  div {
    -webkit-tap-highlight-color: transparent;
  }
</style>
