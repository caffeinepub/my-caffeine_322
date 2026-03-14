import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";

export function useIsSubscribed() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isSubscribed"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerSubscribed();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}

export function useCheckStripeSession(sessionId: string | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["stripeSession", sessionId],
    queryFn: async () => {
      if (!actor || !sessionId) return null;
      return actor.getStripeSessionStatus(sessionId);
    },
    enabled: !!actor && !isFetching && !!sessionId,
    retry: false,
    staleTime: Number.POSITIVE_INFINITY,
  });
}

export function useCreateCheckoutSession() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      successUrl,
      cancelUrl,
    }: {
      successUrl: string;
      cancelUrl: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      const url = await actor.createCheckoutSession(
        [
          {
            productName: "কৃষি হিসাব প্রিমিয়াম",
            currency: "bdt",
            quantity: 1n,
            priceInCents: 5000n,
            productDescription: "মাসিক সাবস্ক্রিপশন",
          },
        ],
        successUrl,
        cancelUrl,
      );
      return url;
    },
  });
}

export function useSubmitManualPayment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      transactionId,
      method,
    }: {
      transactionId: string;
      method: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (actor as any).submitManualPayment(transactionId, method);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["isSubscribed"] });
    },
  });
}
