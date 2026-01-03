import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertApiKey } from "@shared/schema";

export function useApiKeys() {
  return useQuery({
    queryKey: [api.apiKeys.list.path],
    queryFn: async () => {
      const res = await fetch(api.apiKeys.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch API keys");
      return api.apiKeys.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateApiKey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertApiKey) => {
      const validated = api.apiKeys.create.input.parse(data);
      const res = await fetch(api.apiKeys.create.path, {
        method: api.apiKeys.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      if (!res.ok) {
        if (res.status === 400) {
          const error = api.apiKeys.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to create API key");
      }
      return api.apiKeys.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.apiKeys.list.path] });
    },
  });
}

export function useDeleteApiKey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.apiKeys.delete.path, { id });
      const res = await fetch(url, {
        method: api.apiKeys.delete.method,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete API key");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.apiKeys.list.path] });
    },
  });
}
