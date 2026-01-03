import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertMerchant } from "@shared/schema";

export function useMerchant() {
  return useQuery({
    queryKey: [api.merchants.me.path],
    queryFn: async () => {
      const res = await fetch(api.merchants.me.path, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch merchant profile");
      return api.merchants.me.responses[200].parse(await res.json());
    },
    retry: false, // Don't retry 404s as they mean "not onboarded"
  });
}

export function useCreateMerchant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertMerchant) => {
      const validated = api.merchants.create.input.parse(data);
      const res = await fetch(api.merchants.create.path, {
        method: api.merchants.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      if (!res.ok) {
        if (res.status === 400) {
          const error = api.merchants.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to create merchant profile");
      }
      return api.merchants.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.merchants.me.path] });
    },
  });
}
