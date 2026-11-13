import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  // One client per request: a module-level QueryClient leaks cached data between SSR requests.
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    // Lets Query own freshness; set caching defaults on the QueryClient, not the router.
    defaultPreloadStaleTime: 0,
    // GitHub Pages build (BASE_URL is a sub-folder) serves each page as <route>/index.html at
    // "<route>/", so URLs keep the trailing slash there. Lovable (BASE_URL "/") keeps the default.
    trailingSlash: import.meta.env.BASE_URL === "/" ? "never" : "always",
  });

  return router;
};
