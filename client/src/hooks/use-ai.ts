import { useMutation } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { z } from "zod";

type PrioritizeInput = z.infer<typeof api.ai.prioritize.input>;
type SummarizeInput = z.infer<typeof api.ai.summarize.input>;

export function useAI() {
  const prioritizeMutation = useMutation({
    mutationFn: async (data: PrioritizeInput) => {
      const res = await fetch(api.ai.prioritize.path, {
        method: api.ai.prioritize.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to get AI priority");
      return api.ai.prioritize.responses[200].parse(await res.json());
    },
  });

  const summarizeMutation = useMutation({
    mutationFn: async (data: SummarizeInput) => {
      const res = await fetch(api.ai.summarize.path, {
        method: api.ai.summarize.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to summarize task");
      return api.ai.summarize.responses[200].parse(await res.json());
    },
  });

  return {
    prioritize: prioritizeMutation,
    summarize: summarizeMutation,
  };
}
