<script lang="ts">
  let { progress = 0, status = "PROCESSING" } = $props<{
    progress: number;
    status: string;
  }>();

  let isCompleted = $derived(status === "COMPLETED" || progress >= 100);
</script>

<div class="pacer-wrapper" style="left: {progress}%">
  <span class="pacer-emoji" class:success={isCompleted}> 🏃 </span>
</div>

<style>
  .pacer-wrapper {
    position: absolute;
    top: -32px;
    transform: translateX(-50%);
    transition: left 300ms ease-out;
    z-index: 10;
    pointer-events: none;
  }

  .pacer-emoji {
    display: inline-block;
    font-size: 1.5rem;
    transform: scaleX(-1);
    animation: bounce 0.6s infinite ease-in-out;
  }

  .pacer-emoji.success {
    animation: victory 0.8s ease-in-out forwards;
  }

  @keyframes bounce {
    0%,
    100% {
      transform: scaleX(-1) translateY(0);
    }
    50% {
      transform: scaleX(-1) translateY(-8px);
    }
  }

  @keyframes victory {
    0% {
      transform: scaleX(-1) translateY(0) scale(1);
    }
    20% {
      transform: scaleX(-1) translateY(-25px) scale(1.2);
    }
    40% {
      transform: scaleX(-1) translateY(0) scale(1.2);
    }
    60% {
      transform: scaleX(-1) translateY(-15px) scale(1.2);
    }
    80% {
      transform: scaleX(-1) translateY(0) scale(1.2);
    }
    100% {
      transform: scaleX(-1) translateY(0) scale(1.4);
    }
  }
</style>
