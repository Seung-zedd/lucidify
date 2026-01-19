<script lang="ts">
  let { children } = $props();
</script>

<!-- Marketing Header could go here (e.g., transparent logo) -->
<div class="relative min-h-screen overflow-x-hidden">
  {@render children()}
</div>
