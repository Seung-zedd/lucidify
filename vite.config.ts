import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    tailwindcss(),
    sveltekit(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "Lucidify",
        short_name: "Lucidify",
        description: "AI-powered study and dream companion",
        theme_color: "#FACC15",
        background_color: "#0F172A",
        display: "standalone",
        icons: [
          {
            src: "/logo-gold.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/logo-gold.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
  ] as any,
});
