import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getDashboard } from "@/lib/heartguard.functions";

export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: () => getDashboard(),
    staleTime: 10_000,
  });
}

/** Mutation qui rafraîchit automatiquement les données centralisées. */
export function useApiMutation<TInput, TResult>(fn: (args: { data: TInput }) => Promise<TResult>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: TInput) => fn({ data: input }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
  });
}
