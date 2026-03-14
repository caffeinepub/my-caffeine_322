import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useSubmitManualPayment } from "@/hooks/useQueries";
import {
  CheckCircle2,
  Copy,
  CreditCard,
  Fish,
  Leaf,
  Loader2,
  PawPrint,
  Smartphone,
  Sprout,
  Star,
  Tractor,
  TreePine,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

interface SubscriptionModalProps {
  open: boolean;
  onClose: () => void;
}

const features = [
  { icon: <Sprout className="w-4 h-4" />, label: "শস্য ও ফসল হিসাব" },
  { icon: <Fish className="w-4 h-4" />, label: "মৎস্য সম্পদ হিসাব" },
  { icon: <PawPrint className="w-4 h-4" />, label: "প্রাণিসম্পদ হিসাব" },
  { icon: <TreePine className="w-4 h-4" />, label: "বনজ সম্পদ হিসাব" },
  { icon: <Leaf className="w-4 h-4" />, label: "সবজি ও ফল হিসাব" },
  { icon: <Tractor className="w-4 h-4" />, label: "যন্ত্রপাতি হিসাব" },
  { icon: <CheckCircle2 className="w-4 h-4" />, label: "অসীমিত হিসাব" },
  { icon: <CheckCircle2 className="w-4 h-4" />, label: "অফলাইন ব্যবহার" },
];

type PaymentMethod = "bkash" | "nagad" | "visa";

const BKASH_NUMBER = "01516539960";
const NAGAD_NUMBER = "01516539960";

const paymentMethods: {
  id: PaymentMethod;
  label: string;
  color: string;
  textColor: string;
  borderColor: string;
  icon: string;
  number?: string;
  instructions: string[];
}[] = [
  {
    id: "bkash",
    label: "বিকাশ",
    color: "bg-pink-50 hover:bg-pink-100",
    textColor: "text-pink-700",
    borderColor: "border-pink-300",
    icon: "📱",
    number: BKASH_NUMBER,
    instructions: [
      "বিকাশ অ্যাপ খুলুন",
      `"Send Money" বা "পাঠান" চাপুন`,
      `নম্বরে ${BKASH_NUMBER} লিখুন`,
      "৳৫০ পাঠান এবং রেফারেন্সে আপনার নাম লিখুন",
      "পেমেন্ট সম্পন্ন হলে নিচে ট্রানজেকশন আইডি দিন",
    ],
  },
  {
    id: "nagad",
    label: "নগদ",
    color: "bg-orange-50 hover:bg-orange-100",
    textColor: "text-orange-700",
    borderColor: "border-orange-300",
    icon: "💳",
    number: NAGAD_NUMBER,
    instructions: [
      "নগদ অ্যাপ খুলুন",
      `"Send Money" বা "পাঠান" চাপুন`,
      `নম্বরে ${NAGAD_NUMBER} লিখুন`,
      "৳৫০ পাঠান এবং রেফারেন্সে আপনার নাম লিখুন",
      "পেমেন্ট সম্পন্ন হলে নিচে ট্রানজেকশন আইডি দিন",
    ],
  },
  {
    id: "visa",
    label: "ভিসা কার্ড",
    color: "bg-blue-50 hover:bg-blue-100",
    textColor: "text-blue-700",
    borderColor: "border-blue-300",
    icon: "🏦",
    instructions: [
      "ব্যাংক ট্রান্সফার বা কার্ড পেমেন্টের জন্য বিকাশে যোগাযোগ করুন",
      `বিকাশ: ${BKASH_NUMBER}`,
    ],
  },
];

export function SubscriptionModal({ open, onClose }: SubscriptionModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("bkash");
  const [copied, setCopied] = useState(false);
  const [transactionId, setTransactionId] = useState("");
  const [step, setStep] = useState<"info" | "confirm">("info");

  const submitPayment = useSubmitManualPayment();
  const selected = paymentMethods.find((m) => m.id === selectedMethod)!;

  const copyNumber = () => {
    if (selected.number) {
      navigator.clipboard.writeText(selected.number);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleConfirm = async () => {
    if (selectedMethod === "visa") {
      onClose();
      return;
    }
    if (transactionId.trim().length < 4) {
      toast.error("সঠিক ট্রানজেকশন আইডি দিন");
      return;
    }
    try {
      await submitPayment.mutateAsync({
        transactionId: transactionId.trim(),
        method: selectedMethod,
      });
      toast.success("সাবস্ক্রিপশন সক্রিয় হয়েছে! এখন সব হিসাব ব্যবহার করতে পারবেন।", {
        duration: 5000,
      });
      setTransactionId("");
      setStep("info");
      onClose();
    } catch {
      toast.error("কিছু সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    }
  };

  const handleClose = () => {
    setTransactionId("");
    setStep("info");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent
        data-ocid="subscription.dialog"
        className="p-0 overflow-hidden max-w-sm border-0 shadow-2xl"
      >
        {/* Premium green gradient header */}
        <div className="bg-gradient-to-br from-green-700 via-green-600 to-emerald-500 px-6 pt-7 pb-8 relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "radial-gradient(circle at 30% 20%, oklch(0.9 0.15 150) 0%, transparent 60%), radial-gradient(circle at 80% 80%, oklch(0.5 0.1 160) 0%, transparent 50%)",
            }}
          />
          <DialogHeader className="relative">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Star className="w-5 h-5 text-yellow-300 fill-yellow-300" />
              </div>
              <span className="text-white/80 text-sm font-medium">প্রিমিয়াম</span>
            </div>
            <DialogTitle className="text-white text-2xl font-bold leading-tight">
              প্রিমিয়াম সদস্যতা
            </DialogTitle>
            <p className="text-white/80 text-sm mt-1.5 leading-relaxed">
              সকল কৃষি ক্যালকুলেটর ব্যবহার করতে মাসিক সাবস্ক্রিপশন নিন
            </p>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-4xl font-bold text-white">৳৫০</span>
              <span className="text-white/70 text-sm">/ মাস</span>
            </div>
          </DialogHeader>
        </div>

        <div className="px-6 py-5">
          {step === "info" ? (
            <>
              {/* Features list */}
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                সুবিধাসমূহ
              </p>
              <motion.ul
                className="grid grid-cols-2 gap-2 mb-5"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: {},
                  visible: { transition: { staggerChildren: 0.05 } },
                }}
              >
                {features.map((f) => (
                  <motion.li
                    key={f.label}
                    variants={{
                      hidden: { opacity: 0, y: 6 },
                      visible: { opacity: 1, y: 0 },
                    }}
                    className="flex items-center gap-2 text-sm text-foreground"
                  >
                    <span className="text-primary shrink-0">{f.icon}</span>
                    <span>{f.label}</span>
                  </motion.li>
                ))}
              </motion.ul>

              {/* Payment method selection */}
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                পেমেন্ট পদ্ধতি
              </p>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    type="button"
                    data-ocid={`subscription.payment_method.${method.id}`}
                    onClick={() => setSelectedMethod(method.id)}
                    className={`flex flex-col items-center gap-1 py-2.5 px-2 rounded-xl border-2 transition-colors text-center ${
                      selectedMethod === method.id
                        ? `${method.color} ${method.borderColor} ${method.textColor} font-semibold`
                        : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100"
                    }`}
                  >
                    <span className="text-xl">{method.icon}</span>
                    <span className="text-xs leading-tight">
                      {method.label}
                    </span>
                    {selectedMethod === method.id && (
                      <CheckCircle2 className="w-3 h-3" />
                    )}
                  </button>
                ))}
              </div>

              {/* Payment instructions */}
              {selected.number && (
                <div className="mb-4 bg-pink-50 border border-pink-200 rounded-xl p-3">
                  <p className="text-xs font-semibold text-pink-700 mb-1">
                    {selected.label} নম্বর
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-pink-800 tracking-widest">
                      {selected.number}
                    </span>
                    <button
                      type="button"
                      data-ocid="subscription.copy_button"
                      onClick={copyNumber}
                      className="ml-auto flex items-center gap-1 text-xs text-pink-600 hover:text-pink-800 border border-pink-300 rounded-lg px-2 py-1"
                    >
                      <Copy className="w-3 h-3" />
                      {copied ? "কপি হয়েছে" : "কপি করুন"}
                    </button>
                  </div>
                </div>
              )}

              <div className="mb-4 bg-gray-50 rounded-xl p-3">
                <p className="text-xs font-semibold text-muted-foreground mb-2">
                  পেমেন্ট পদ্ধতি:
                </p>
                <ol className="space-y-1">
                  {selected.instructions.map((step, i) => (
                    <li
                      key={step}
                      className="text-xs text-foreground flex gap-2"
                    >
                      <span className="text-primary font-bold shrink-0">
                        {i + 1}.
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Payment icons row */}
              <div className="flex items-center gap-2 mb-4 bg-gray-50 rounded-xl px-3 py-2">
                <Smartphone className="w-3.5 h-3.5 text-pink-500 shrink-0" />
                <span className="text-xs text-muted-foreground">গ্রহণযোগ্য:</span>
                <span className="text-xs font-medium text-pink-600">বিকাশ</span>
                <span className="text-muted-foreground text-xs">·</span>
                <span className="text-xs font-medium text-orange-600">নগদ</span>
                <span className="text-muted-foreground text-xs">·</span>
                <CreditCard className="w-3 h-3 text-blue-500" />
                <span className="text-xs font-medium text-blue-600">ভিসা</span>
              </div>

              {selectedMethod !== "visa" ? (
                <Button
                  data-ocid="subscription.primary_button"
                  onClick={() => setStep("confirm")}
                  className="w-full h-11 text-base font-bold bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-200"
                >
                  পেমেন্ট করেছি →
                </Button>
              ) : (
                <Button
                  data-ocid="subscription.primary_button"
                  onClick={handleClose}
                  className="w-full h-11 text-base font-bold bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-200"
                >
                  ঠিক আছে
                </Button>
              )}
            </>
          ) : (
            <>
              <div className="mb-4">
                <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-4">
                  <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                  <p className="text-sm text-green-800 font-medium">
                    পেমেন্ট সম্পন্ন হয়েছে?
                  </p>
                </div>
                <p className="text-sm text-foreground mb-2">
                  {selected.label} থেকে পাঠানোর পর ট্রানজেকশন আইডি (TxID) লিখুন:
                </p>
                <Input
                  data-ocid="subscription.transaction_input"
                  type="text"
                  placeholder="যেমন: 8N7A2B3C4D"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  className="h-11 text-base font-mono"
                  autoFocus
                />
                <p className="text-xs text-muted-foreground mt-2">
                  {selected.label} অ্যাপে পেমেন্টের পর "Transaction ID" বা "TxID"
                  দেখতে পাবেন।
                </p>
              </div>

              <Button
                data-ocid="subscription.confirm_button"
                onClick={handleConfirm}
                disabled={
                  submitPayment.isPending || transactionId.trim().length < 4
                }
                className="w-full h-11 text-base font-bold bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-200 mb-3"
              >
                {submitPayment.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    যাচাই হচ্ছে...
                  </>
                ) : (
                  "সাবস্ক্রিপশন সক্রিয় করুন"
                )}
              </Button>

              <button
                type="button"
                data-ocid="subscription.cancel_button"
                onClick={() => setStep("info")}
                className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                ← পেছনে যান
              </button>
            </>
          )}

          {step === "info" && (
            <button
              type="button"
              data-ocid="subscription.close_button"
              onClick={handleClose}
              className="w-full text-center text-xs text-muted-foreground mt-3 hover:text-foreground transition-colors"
            >
              পরে করব
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
