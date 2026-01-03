import { useQuery, useMutation } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type ProcessPaymentRequest } from "@shared/schema";

export function useTransactions() {
  return useQuery({
    queryKey: [api.transactions.list.path],
    queryFn: async () => {
      const res = await fetch(api.transactions.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch transactions");
      return api.transactions.list.responses[200].parse(await res.json());
    },
  });
}

// Public hook (no credentials needed usually, but simulation uses cookie session or public endpoint)
export function useProcessPayment() {
  return useMutation({
    mutationFn: async ({ transactionId, ...data }: ProcessPaymentRequest) => {
      const url = buildUrl(api.transactions.process.path, { id: transactionId });
      // In a real app, this wouldn't use cookies, but for this simulation we might
      // or it's purely public. The backend route is marked /api/public, so no auth check.
      const res = await fetch(url, {
        method: api.transactions.process.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!res.ok) {
        if (res.status === 400) {
           const error = api.transactions.process.responses[400].parse(await res.json());
           throw new Error(error.message);
        }
        if (res.status === 404) {
           throw new Error("Transaction not found");
        }
        throw new Error("Payment processing failed");
      }
      return api.transactions.process.responses[200].parse(await res.json());
    },
  });
}
