<script lang="ts">
  import "../app.css";
  let { children } = $props();
</script>

<svelte:head>
  <title>Lucidify - AI Dream Companion</title>
  <meta
    name="description"
    content="Master your dreams with AI-powered insights and lucid dreaming techniques."
  />
</svelte:head>

{@render children()}
