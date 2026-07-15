// Single QueryClient shared by every admin module. Created once at module load so
// the cache survives route changes within the admin (but not a full page reload).
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Admin data is edited constantly; keep it fresh but avoid refetch storms.
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
