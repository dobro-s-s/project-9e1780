// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// Never set ssr.external or resolve.external: the Worker has no runtime module resolution, so
// the build fails. Never add compression (compressPublicAssets, vite-plugin-compression):
// hosting already compresses at the edge.
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// GitHub Pages mode: only when GITHUB_PAGES_BASE is set (e.g. "/project-9e1780/").
// Without it the config is exactly the Lovable one (SSR on Cloudflare), so preview and
// Lovable publishing are unaffected.
const pagesBase = process.env.GITHUB_PAGES_BASE;

export default pagesBase
  ? defineConfig({
      // Static files only: no server bundle to deploy.
      nitro: false,
      // Vite prefixes every asset URL with this; TanStack Start derives router.basepath from it.
      vite: { base: pagesBase },
      tanstackStart: {
        server: { entry: "server" },
        pages: [{ path: "/" }, { path: "/tasks" }],
        prerender: { enabled: true, autoStaticPathsDiscovery: false, crawlLinks: false },
        // App shell for unknown URLs: GitHub Pages serves 404.html, the router then renders the route.
        spa: { enabled: true, prerender: { outputPath: "/404.html" } },
      },
    })
  : defineConfig({
      tanstackStart: {
        // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
        // nitro/vite builds from this
        server: { entry: "server" },
      },
    });
