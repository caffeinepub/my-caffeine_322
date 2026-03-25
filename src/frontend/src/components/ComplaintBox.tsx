import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useActor } from "@/hooks/useActor";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useMutation } from "@tanstack/react-query";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function ComplaintBox({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const { mutate: submit, isPending } = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      if (!name.trim()) throw new Error("নাম দিন");
      if (text.trim().length < 5)
        throw new Error("অভিযোগ কমপক্ষে ৫ অক্ষরের হতে হবে");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (actor as any).submitComplaint(name.trim(), text.trim());
    },
    onSuccess: () => {
      setSubmitted(true);
    },
    onError: (e: Error) => {
      toast.error(e.message || "অভিযোগ জমা দিতে সমস্যা হয়েছে");
    },
  });

  const handleClose = () => {
    setName("");
    setText("");
    setSubmitted(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent
        data-ocid="complaint.dialog"
        className="max-w-md rounded-2xl"
      >
        <DialogHeader>
          <DialogTitle className="text-green-900 text-lg">
            অভিযোগ বাক্স
          </DialogTitle>
        </DialogHeader>

        {!identity ? (
          <div
            data-ocid="complaint.login_state"
            className="py-6 text-center text-sm text-muted-foreground"
          >
            অভিযোগ দিতে লগইন করুন
          </div>
        ) : submitted ? (
          <div
            data-ocid="complaint.success_state"
            className="py-8 flex flex-col items-center gap-3 text-center"
          >
            <CheckCircle2 className="w-12 h-12 text-green-600" />
            <p className="font-semibold text-green-800">
              আপনার অভিযোগ সফলভাবে জমা হয়েছে
            </p>
            <p className="text-xs text-muted-foreground">
              আমরা শীঘ্রই পর্যালোচনা করব
            </p>
            <button
              type="button"
              data-ocid="complaint.close_button"
              onClick={handleClose}
              className="mt-2 bg-green-600 text-white font-semibold text-sm px-6 py-2.5 rounded-xl hover:bg-green-700 transition-colors"
            >
              বন্ধ করুন
            </button>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            <div>
              <label
                className="block text-xs text-muted-foreground mb-1"
                htmlFor="complaint-name"
              >
                আপনার নাম
              </label>
              <input
                id="complaint-name"
                data-ocid="complaint.input"
                type="text"
                placeholder="নাম লিখুন"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>
            <div>
              <label
                className="block text-xs text-muted-foreground mb-1"
                htmlFor="complaint-text"
              >
                অভিযোগের বিবরণ
              </label>
              <textarea
                id="complaint-text"
                data-ocid="complaint.textarea"
                placeholder="আপনার অভিযোগ বিস্তারিত লিখুন..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={4}
                className="w-full border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
              />
            </div>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                data-ocid="complaint.cancel_button"
                onClick={handleClose}
                className="flex-1 border border-border text-foreground font-semibold text-sm py-2.5 rounded-xl hover:bg-muted transition-colors"
              >
                বাতিল
              </button>
              <button
                type="button"
                data-ocid="complaint.submit_button"
                onClick={() => submit()}
                disabled={isPending}
                className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white font-semibold text-sm py-2.5 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-60"
              >
                {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                জমা দিন
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
