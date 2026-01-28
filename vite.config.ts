import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { SvelteKitPWA } from "@vite-pwa/sveltekit";

export default defineConfig({
  plugins: [
    tailwindcss(),
    sveltekit(),
    SvelteKitPWA({
      registerType: "autoUpdate",
      manifest: {
        name: "Lucidify - AI Dream Architect",
        short_name: "Lucidify",
        description:
          "Visualize and control your dreams. Generate cinematic videos of your subconscious using Google Veo.",
        theme_color: "#8b5cf6",
        background_color: "#020617",
        display: "standalone",
        icons: [
          {
            src: "/icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/icon-512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,webp,woff,woff2}"],
        globIgnores: ["**/node_modules/**/*", "sw.js", "workbox-*.js"],
      },
    }),
  ] as any,
});
