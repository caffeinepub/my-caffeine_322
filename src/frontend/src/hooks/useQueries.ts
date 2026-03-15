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

export function useCalcHistory() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["calcHistory"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCalcHistory();
    },
    enabled: !!actor && !isFetching,
    staleTime: 10_000,
  });
}

export function useYearlySummary() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["yearlySummary"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getYearlySummary();
    },
    enabled: !!actor && !isFetching,
    staleTime: 10_000,
  });
}

export function useSaveCalcRecord() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      sector: string;
      item: string;
      investment: number;
      sales: number;
      difference: number;
      resultType: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.saveCalcRecord(
        params.sector,
        params.item,
        params.investment,
        params.sales,
        params.difference,
        params.resultType,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calcHistory"] });
      queryClient.invalidateQueries({ queryKey: ["yearlySummary"] });
    },
  });
}

export function useDeleteCalcRecord() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.deleteCalcRecord(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calcHistory"] });
      queryClient.invalidateQueries({ queryKey: ["yearlySummary"] });
    },
  });
}

export interface GovPriceEntry {
  sector: string;
  item: string;
  price: number;
  unit: string;
  qty: number;
}

export function useGovPrices() {
  const { actor, isFetching } = useActor();
  return useQuery<GovPriceEntry[]>({
    queryKey: ["govPrices"],
    queryFn: async () => {
      if (!actor) return [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await (actor as any).getGovPrices();
      return result as GovPriceEntry[];
    },
    enabled: !!actor && !isFetching,
    staleTime: 60_000,
  });
}

export function useSetGovPrice() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      sector: string;
      item: string;
      price: number;
      unit: string;
      qty: number;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (actor as any).setGovPrice(
        params.sector,
        params.item,
        params.price,
        params.unit,
        params.qty,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["govPrices"] });
    },
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
    staleTime: 60_000,
  });
}
