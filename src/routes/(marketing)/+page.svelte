<script lang="ts">
  import { onMount } from "svelte";
  import { browser } from "$app/environment";

  let scrollPercent = $state(0);
  let stars: {
    left: string;
    top: string;
    width: string;
    delay: string;
    twinkle: boolean;
  }[] = $state([]);

  onMount(() => {
    // Create stars
    const newStars = [];
    for (let i = 0; i < 50; i++) {
      newStars.push({
        left: Math.random() * 100 + "%",
        top: Math.random() * 100 + "%",
        width: Math.random() * 3 + "px",
        delay: Math.random() * 3 + "s",
        twinkle: Math.random() > 0.5,
      });
    }
    stars = newStars;

    const handleScroll = () => {
      const scrollPos = window.scrollY;
      const windowHeight = window.innerHeight;
      const docHeight = document.body.scrollHeight;
      scrollPercent = scrollPos / (docHeight - windowHeight);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Initial check

    return () => window.removeEventListener("scroll", handleScroll);
  });

  let sunsetOpacity = $derived(scrollPercent < 0.2 ? 0 : 1);
  let nightOpacity = $derived(scrollPercent < 0.5 ? 0 : 1);
  let starOpacity = $derived(
    scrollPercent < 0.2 ? 0 : scrollPercent < 0.5 ? 0.3 : 1,
  );
  let textColor = $derived(
    scrollPercent < 0.2 ? "text-slate-800" : "text-white",
  );
  let twilightTextColor = $derived(
    scrollPercent < 0.2 ? "text-slate-800" : "text-white",
  );
  let twilightDescColor = $derived(
    scrollPercent < 0.2 ? "text-slate-600" : "text-slate-300",
  );
</script>

<svelte:head>
  <title>Lucidify - Visualize Your Dreams</title>
  <link
    href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;800;900&display=swap"
    rel="stylesheet"
  />
</svelte:head>

<div class="marketing-page {textColor} transition-colors duration-1000">
  <!-- Stacked Background Layers -->
  <div id="bg-day" class="bg-layer"></div>
  <div id="bg-sunset" class="bg-layer" style="opacity: {sunsetOpacity}"></div>
  <div id="bg-night" class="bg-layer" style="opacity: {nightOpacity}"></div>

  <!-- Stars Layer -->
  <div id="stars-container" class="fixed inset-0 z-0 pointer-events-none">
    {#each stars as star}
      <div
        class="star"
        class:twinkle={star.twinkle}
        style:left={star.left}
        style:top={star.top}
        style:width={star.width}
        style:height={star.width}
        style:animation-delay={star.delay}
        style:opacity={starOpacity}
      ></div>
    {/each}
  </div>

  <!-- Section 1: Sunset (Introduction) -->
  <section id="sec1" class="section">
    <h1
      class="text-6xl md:text-8xl font-black mb-4 tracking-tighter text-center"
    >
      Dreams <span
        class="bg-linear-to-r from-[#ff9966] to-[#ff5e62] bg-clip-text text-transparent"
        >Never Fade.</span
      >
    </h1>
    <p
      class="text-xl md:text-2xl font-light text-center max-w-2xl leading-relaxed mt-6"
    >
      Every night, the subconscious world calls.<br />
      But upon waking, memories vanish like smoke.
    </p>
    <div class="scroll-down text-slate-500">
      <p class="mb-2 uppercase tracking-widest font-semibold text-xs">
        Scroll to Sleep
      </p>
      <svg
        class="w-6 h-6 mx-auto"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M19 14l-7 7m0 0l-7-7m7 7V3"
        ></path>
      </svg>
    </div>
  </section>

  <!-- Section 2: Twilight (Transition) -->
  <section id="sec2" class="section">
    <div class="float mb-8">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="80"
        height="80"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#6366f1"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
      </svg>
    </div>
    <h2
      class="text-4xl md:text-6xl font-bold text-center mb-6 transition-colors duration-1000 {twilightTextColor}"
    >
      When Reality<br />Blurs
    </h2>
    <p
      class="text-lg md:text-xl text-center max-w-xl transition-colors duration-1000 {twilightDescColor}"
    >
      Lucidify captures your hazy memories<br />
      into vivid cinematic videos.
    </p>
  </section>

  <!-- Section 3: Night (Features) -->
  <section id="sec3" class="section">
    <div
      class="grid grid-cols-1 md:grid-cols-2 gap-12 w-full max-w-5xl items-center"
    >
      <div class="space-y-8">
        <div
          class="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20 hover:bg-white/20 transition-all duration-300"
        >
          <h3
            class="text-2xl font-bold bg-linear-to-r from-[#a18cd1] to-[#fbc2eb] bg-clip-text text-transparent mb-2"
          >
            AI Dream Architect
          </h3>
          <p class="text-gray-300">
            Just say "I was flying,"<br />and AI crafts a perfect cinematic
            video.
          </p>
        </div>
        <div
          class="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20 hover:bg-white/20 transition-all duration-300"
        >
          <h3
            class="text-2xl font-bold bg-linear-to-r from-[#a18cd1] to-[#fbc2eb] bg-clip-text text-transparent mb-2"
          >
            Lucid Mode
          </h3>
          <p class="text-gray-300">
            Realized you're dreaming?<br />Tap the button to rewrite the ending.
          </p>
        </div>
      </div>
      <div class="flex justify-center float-delayed">
        <!-- Abstract Phone Mockup -->
        <div
          class="w-64 h-[500px] bg-linear-to-b from-indigo-900 to-purple-900 rounded-[3rem] border-8 border-slate-800 shadow-2xl relative overflow-hidden flex items-center justify-center"
        >
          <div
            class="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1000&auto=format&fit=crop')] bg-cover opacity-60"
          ></div>
          <div
            class="absolute bottom-8 w-16 h-16 bg-yellow-400 rounded-full blur-xl opacity-50 animate-pulse"
          ></div>
          <div
            class="relative z-10 w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(250,204,21,0.8)]"
          >
            <svg
              class="w-6 h-6 text-indigo-900"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-5.82 3.25L7.36 14.14 2.36 9.27l6.91-1.01L12 2z"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Section 4: Deep Sleep (CTA) -->
  <section id="sec4" class="section">
    <div
      class="absolute inset-0 bg-linear-to-t from-black via-transparent to-transparent z-0"
    ></div>

    <div class="relative z-10 text-center">
      <h2
        class="text-5xl md:text-7xl font-black mb-8 text-white tracking-tight"
      >
        Now, Close Your Eyes<br />
        <span class="text-yellow-400">And Dream.</span>
      </h2>
      <p class="text-slate-400 mb-12 text-lg">
        Record your dreams tonight with Lucidify.
      </p>

      <button
        class="group relative inline-flex items-center justify-center px-8 py-5 text-lg font-bold text-slate-900 transition-all duration-200 bg-yellow-400 font-pj rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 btn-glow"
      >
        <span
          class="absolute top-0 right-0 w-4 h-4 -mt-1 -mr-1 rounded-full bg-red-500 animate-ping"
        ></span>
        Enter the Dream
        <svg
          class="w-5 h-5 ml-2 -mr-1 transition-transform group-hover:translate-x-1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
            clip-rule="evenodd"
          />
        </svg>
      </button>

      <!-- Bed/Sleep Metaphor -->
      <div class="mt-16 opacity-50">
        <p class="text-xs text-slate-600 uppercase tracking-[0.3em]">
          PWA Mode Available
        </p>
      </div>
    </div>
  </section>
</div>

<style>
  :global(body) {
    font-family: "Inter", sans-serif;
    overflow-x: hidden;
    margin: 0;
    padding: 0;
  }

  .marketing-page {
    position: relative;
    min-height: 100vh;
  }

  /* --- Layered Backgrounds for Smooth Fade Effect --- */
  .bg-layer {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    transition: opacity 1.5s cubic-bezier(0.4, 0, 0.2, 1);
    will-change: opacity;
  }

  /* Layer 1: Day (Base) - Always visible initially */
  #bg-day {
    z-index: -3;
    background: linear-gradient(to bottom, #f5f7fa, #c3cfe2);
  }

  /* Layer 2: Sunset - Overlays Day */
  #bg-sunset {
    z-index: -2;
    background: linear-gradient(to bottom, #4b6cb7, #182848);
  }

  /* Layer 3: Night - Overlays Sunset */
  #bg-night {
    z-index: -1;
    background: linear-gradient(to bottom, #0f172a, #020617);
  }

  /* Scroll Sections */
  .section {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 2rem;
    position: relative;
    z-index: 10;
  }

  /* Floating Elements Animation */
  .float {
    animation: float 6s ease-in-out infinite;
  }
  .float-delayed {
    animation: float 6s ease-in-out 3s infinite;
  }

  @keyframes float {
    0% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-20px);
    }
    100% {
      transform: translateY(0px);
    }
  }

  /* Star Twinkle */
  .star {
    position: absolute;
    background: white;
    border-radius: 50%;
    transition: opacity 2s ease;
  }

  .twinkle {
    animation: twinkle 3s infinite;
  }
  @keyframes twinkle {
    0%,
    100% {
      opacity: 0.2;
    }
    50% {
      opacity: 1;
    }
  }

  /* CTA Button Glow */
  .btn-glow {
    box-shadow: 0 0 15px rgba(250, 204, 21, 0.3);
    transition: all 0.3s ease;
  }
  .btn-glow:hover {
    box-shadow: 0 0 30px rgba(250, 204, 21, 0.6);
    transform: scale(1.05);
  }

  /* Scroll Indicator */
  .scroll-down {
    position: absolute;
    bottom: 30px;
    animation: bounce 2s infinite;
  }
  @keyframes bounce {
    0%,
    20%,
    50%,
    80%,
    100% {
      transform: translateY(0);
    }
    40% {
      transform: translateY(-10px);
    }
    60% {
      transform: translateY(-5px);
    }
  }
</style>
