import { useActor } from "@/hooks/useActor";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Star } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Feedback {
  id: bigint;
  name: string;
  rating: bigint;
  text: string;
  timestamp: bigint;
  approved: boolean;
}

function StarRating({
  value,
  onChange,
  readOnly = false,
}: {
  value: number;
  onChange?: (v: number) => void;
  readOnly?: boolean;
}) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          disabled={readOnly}
          onClick={() => onChange?.(s)}
          onMouseEnter={() => !readOnly && setHovered(s)}
          onMouseLeave={() => !readOnly && setHovered(0)}
          className="focus:outline-none disabled:cursor-default"
          aria-label={`${s} তারা`}
        >
          <Star
            className={`w-5 h-5 transition-colors ${
              s <= (hovered || value)
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

function formatDate(ts: bigint) {
  const ms = Number(ts / 1_000_000n);
  return new Date(ms).toLocaleDateString("bn-BD", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function FeedbackSection() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");

  const { data: feedbacks = [], isLoading } = useQuery<Feedback[]>({
    queryKey: ["approvedFeedbacks"],
    queryFn: async () => {
      if (!actor) return [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (actor as any).getApprovedFeedbacks();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });

  const { mutate: submit, isPending } = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      if (!name.trim()) throw new Error("নাম দিন");
      if (rating === 0) throw new Error("রেটিং দিন");
      if (!text.trim()) throw new Error("মতামত লিখুন");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (actor as any).submitFeedback(
        name.trim(),
        BigInt(rating),
        text.trim(),
      );
    },
    onSuccess: () => {
      toast.success("আপনার মতামত সফলভাবে জমা হয়েছে। অনুমোদনের পর দেখা যাবে।");
      setName("");
      setRating(0);
      setText("");
      queryClient.invalidateQueries({ queryKey: ["approvedFeedbacks"] });
    },
    onError: (e: Error) => {
      toast.error(e.message || "মতামত জমা দিতে সমস্যা হয়েছে");
    },
  });

  const avgRating =
    feedbacks.length > 0
      ? feedbacks.reduce((sum, f) => sum + Number(f.rating), 0) /
        feedbacks.length
      : 0;

  return (
    <section
      id="feedback-section"
      data-ocid="feedback.section"
      className="max-w-2xl mx-auto px-4 py-6"
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">গ্রাহকদের মতামত</h2>
          {feedbacks.length > 0 && (
            <div className="flex items-center gap-2 mt-1">
              <StarRating value={Math.round(avgRating)} readOnly />
              <span className="text-sm text-muted-foreground">
                {avgRating.toFixed(1)} ({feedbacks.length}টি মতামত)
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Submit form */}
      {identity ? (
        <div
          data-ocid="feedback.panel"
          className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-5"
        >
          <h3 className="font-semibold text-green-900 text-sm mb-3">
            আপনার মতামত দিন
          </h3>
          <div className="space-y-3">
            <input
              data-ocid="feedback.input"
              type="text"
              placeholder="আপনার নাম"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-green-200 bg-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            />
            <div>
              <p className="text-xs text-muted-foreground mb-1">রেটিং দিন</p>
              <StarRating value={rating} onChange={setRating} />
            </div>
            <textarea
              data-ocid="feedback.textarea"
              placeholder="আপনার মতামত লিখুন..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={3}
              className="w-full border border-green-200 bg-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
            />
            <button
              type="button"
              data-ocid="feedback.submit_button"
              onClick={() => submit()}
              disabled={isPending}
              className="flex items-center justify-center gap-2 w-full bg-green-600 text-white font-semibold text-sm py-2.5 rounded-xl hover:bg-green-700 transition-colors disabled:opacity-60"
            >
              {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              মতামত জমা দিন
            </button>
          </div>
        </div>
      ) : (
        <div
          data-ocid="feedback.login_state"
          className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-5 text-center text-sm text-green-800"
        >
          মতামত দিতে লগইন করুন
        </div>
      )}

      {/* Reviews list */}
      {isLoading ? (
        <div
          data-ocid="feedback.loading_state"
          className="flex justify-center py-8"
        >
          <Loader2 className="w-6 h-6 animate-spin text-green-600" />
        </div>
      ) : feedbacks.length === 0 ? (
        <div
          data-ocid="feedback.empty_state"
          className="text-center py-8 text-muted-foreground text-sm"
        >
          এখনো কোনো মতামত নেই। প্রথম মতামত দিন!
        </div>
      ) : (
        <div className="space-y-3">
          {feedbacks.map((fb, idx) => (
            <div
              key={String(fb.id)}
              data-ocid={`feedback.item.${idx + 1}`}
              className="bg-white border border-border rounded-2xl p-4"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <p className="font-semibold text-sm text-foreground">
                    {fb.name}
                  </p>
                  <StarRating value={Number(fb.rating)} readOnly />
                </div>
                <span className="text-xs text-muted-foreground shrink-0">
                  {formatDate(fb.timestamp)}
                </span>
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed">
                {fb.text}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
