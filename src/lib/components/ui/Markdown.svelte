<script lang="ts">
  let { text = "" } = $props<{ text?: string }>();

  // Helper to parse text into tokens for safe rendering
  let tokens = $derived.by(() => {
    if (!text) return [];

    // 1. Handle Anki-style cloze deletions: {{c1::text}} -> ______
    let processed = text.replace(/\{\{c\d+::(.*?)\}\}/g, "______");

    // 2. Split by Markdown Bold markers: **text**
    const parts = processed.split(/(\*\*.*?\*\*)/g);

    return parts.map((part: string) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return {
          type: "bold",
          content: part.slice(2, -2),
        };
      }
      return {
        type: "text",
        content: part,
      };
    });
  });
</script>

<span class="whitespace-pre-wrap">
  {#each tokens as token}
    {#if token.type === "bold"}
      <strong class="text-primary font-bold">{token.content}</strong>
    {:else}
      {token.content}
    {/if}
  {/each}
</span>
