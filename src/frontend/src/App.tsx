import { SubscriptionModal } from "@/components/SubscriptionModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Toaster } from "@/components/ui/sonner";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useCheckStripeSession, useIsSubscribed } from "@/hooks/useQueries";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Calculator,
  CheckCircle2,
  Download,
  LogIn,
  LogOut,
  Minus,
  RotateCcw,
  TrendingDown,
  TrendingUp,
  User,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

// PWA install prompt hook
function useInstallPrompt() {
  const [prompt, setPrompt] = useState<Event | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => setInstalled(true));
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const install = async () => {
    if (!prompt) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (prompt as any).prompt();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await (prompt as any).userChoice;
    if (result.outcome === "accepted") setInstalled(true);
    setPrompt(null);
  };

  return { canInstall: !!prompt && !installed, install, installed };
}

// Parse session_id from URL
function useSessionId() {
  return useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("session_id");
  }, []);
}

type SubSector = {
  id: string;
  name: string;
  icon: string;
  color: string;
  bgClass: string;
  borderClass: string;
  textClass: string;
  badgeClass: string;
  description: string;
  items: string[];
};

const subSectors: SubSector[] = [
  {
    id: "crops",
    name: "শস্য ও ফসল",
    icon: "🌾",
    color: "green",
    bgClass: "bg-green-50 hover:bg-green-100",
    borderClass: "border-green-200",
    textClass: "text-green-800",
    badgeClass: "bg-green-100 text-green-800",
    description: "ধান, গম, পাট ও অন্যান্য ফসল",
    items: [
      "ধান (আউশ)",
      "ধান (আমন)",
      "ধান (বোরো)",
      "গম",
      "পাট",
      "ভুট্টা",
      "আলু",
      "সরিষা",
      "মসুর ডাল",
      "ছোলা",
    ],
  },
  {
    id: "vegetables",
    name: "সবজি ও ফল",
    icon: "🥦",
    color: "emerald",
    bgClass: "bg-emerald-50 hover:bg-emerald-100",
    borderClass: "border-emerald-200",
    textClass: "text-emerald-800",
    badgeClass: "bg-emerald-100 text-emerald-800",
    description: "শাকসবজি, ফলমূল ও মসলা",
    items: [
      "টমেটো",
      "বেগুন",
      "লাউ",
      "কুমড়া",
      "শিম",
      "আম",
      "কলা",
      "পেঁপে",
      "কাঁঠাল",
      "পেঁয়াজ",
      "রসুন",
      "আদা",
    ],
  },
  {
    id: "fisheries",
    name: "মৎস্য সম্পদ",
    icon: "🐟",
    color: "blue",
    bgClass: "bg-blue-50 hover:bg-blue-100",
    borderClass: "border-blue-200",
    textClass: "text-blue-800",
    badgeClass: "bg-blue-100 text-blue-800",
    description: "মাছ চাষ ও মৎস্য আহরণ",
    items: [
      "রুই মাছ",
      "কাতলা মাছ",
      "তেলাপিয়া",
      "পাঙ্গাস",
      "চিংড়ি (গলদা)",
      "চিংড়ি (বাগদা)",
      "কই মাছ",
      "শিং মাছ",
      "মাগুর মাছ",
    ],
  },
  {
    id: "livestock",
    name: "প্রাণিসম্পদ",
    icon: "🐄",
    color: "amber",
    bgClass: "bg-amber-50 hover:bg-amber-100",
    borderClass: "border-amber-200",
    textClass: "text-amber-800",
    badgeClass: "bg-amber-100 text-amber-800",
    description: "গরু, ছাগল, মুরগি ও হাঁস পালন",
    items: [
      "দেশি গরু",
      "শংকর গরু",
      "ছাগল",
      "ভেড়া",
      "দেশি মুরগি",
      "ব্রয়লার মুরগি",
      "লেয়ার মুরগি",
      "হাঁস",
      "কোয়েল পাখি",
    ],
  },
  {
    id: "tea",
    name: "চা ও বাগান",
    icon: "🍵",
    color: "teal",
    bgClass: "bg-teal-50 hover:bg-teal-100",
    borderClass: "border-teal-200",
    textClass: "text-teal-800",
    badgeClass: "bg-teal-100 text-teal-800",
    description: "চা, ফুল ও ফল বাগান",
    items: [
      "চা (সিলেট)",
      "চা (পঞ্চগড়)",
      "ফুল চাষ",
      "গোলাপ",
      "রজনীগন্ধা",
      "লেবু বাগান",
      "লিচু বাগান",
    ],
  },
  {
    id: "forestry",
    name: "বনজ সম্পদ",
    icon: "🌳",
    color: "lime",
    bgClass: "bg-lime-50 hover:bg-lime-100",
    borderClass: "border-lime-200",
    textClass: "text-lime-800",
    badgeClass: "bg-lime-100 text-lime-800",
    description: "সুন্দরবন, সামাজিক বন ও বাগান",
    items: ["সুন্দরবন", "গোলপাতা", "শাল বন", "সামাজিক বনায়ন", "বাঁশ", "বেত", "ঔষধি গাছ"],
  },
  {
    id: "inputs",
    name: "কৃষি উপকরণ",
    icon: "🌱",
    color: "orange",
    bgClass: "bg-orange-50 hover:bg-orange-100",
    borderClass: "border-orange-200",
    textClass: "text-orange-800",
    badgeClass: "bg-orange-100 text-orange-800",
    description: "সার, বীজ, কীটনাশক ও সেচ",
    items: [
      "ইউরিয়া সার",
      "টিএসপি সার",
      "এমওপি সার",
      "জৈব সার",
      "হাইব্রিড বীজ",
      "দেশি বীজ",
      "কীটনাশক",
      "ছত্রাকনাশক",
      "সেচ ব্যবস্থাপনা",
    ],
  },
  {
    id: "machinery",
    name: "কৃষি যন্ত্রপাতি",
    icon: "🚜",
    color: "red",
    bgClass: "bg-red-50 hover:bg-red-100",
    borderClass: "border-red-200",
    textClass: "text-red-800",
    badgeClass: "bg-red-100 text-red-800",
    description: "ট্রাক্টর, হার্ভেস্টার ও সরঞ্জাম",
    items: [
      "পাওয়ার টিলার",
      "ট্রাক্টর",
      "কম্বাইন হার্ভেস্টার",
      "রাইস ট্রান্সপ্লান্টার",
      "সেচ পাম্প",
      "থ্রেশার মেশিন",
      "স্প্রেয়ার মেশিন",
    ],
  },
];

type CalcResult = {
  investment: number;
  sales: number;
  difference: number;
  type: "profit" | "loss" | "neutral";
};

type CalcState = {
  investment: string;
  sales: string;
  result: CalcResult | null;
};

function InstallBanner() {
  const { canInstall, install } = useInstallPrompt();
  const [dismissed, setDismissed] = useState(false);

  if (!canInstall || dismissed) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-green-600 text-white px-4 py-3 flex items-center justify-between gap-3"
    >
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <Download className="w-4 h-4 shrink-0" />
        <span className="text-sm font-medium">
          অ্যাপটি মোবাইলে ইনস্টল করুন — ইন্টারনেট ছাড়াও চলবে
        </span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          data-ocid="install.primary_button"
          onClick={install}
          className="bg-white text-green-700 text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-green-50 transition-colors"
        >
          ইনস্টল করুন
        </button>
        <button
          type="button"
          data-ocid="install.close_button"
          onClick={() => setDismissed(true)}
          className="text-white/80 hover:text-white transition-colors"
          aria-label="বন্ধ করুন"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}

function CalculatorPanel(props: {
  state: CalcState;
  onChange: (s: CalcState) => void;
  onClose: () => void;
}) {
  const { state, onChange, onClose } = props;

  const calculate = () => {
    const inv = Number.parseFloat(state.investment);
    const sal = Number.parseFloat(state.sales);
    if (Number.isNaN(inv) || Number.isNaN(sal)) return;
    const diff = sal - inv;
    onChange({
      ...state,
      result: {
        investment: inv,
        sales: sal,
        difference: Math.abs(diff),
        type: diff > 0 ? "profit" : diff < 0 ? "loss" : "neutral",
      },
    });
  };

  const resultConfig = state.result
    ? {
        profit: {
          cls: "result-profit",
          icon: <TrendingUp className="w-5 h-5" />,
          label: "লাভ হয়েছে",
        },
        loss: {
          cls: "result-loss",
          icon: <TrendingDown className="w-5 h-5" />,
          label: "লোকসান হয়েছে",
        },
        neutral: {
          cls: "result-neutral",
          icon: <Minus className="w-5 h-5" />,
          label: "সমান হয়েছে",
        },
      }[state.result.type]
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="overflow-hidden"
    >
      <div className="mt-3 p-4 bg-white rounded-xl border border-border shadow-inner">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-sm text-foreground flex items-center gap-2">
            <Calculator className="w-4 h-4 text-primary" />
            লাভ-লোকসান হিসাব
          </h4>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="বন্ধ করুন"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label
              htmlFor="calc-investment"
              className="block text-xs text-muted-foreground mb-1"
            >
              বিনিয়োগ/খরচ (টাকা)
            </label>
            <Input
              id="calc-investment"
              data-ocid="calc.investment_input"
              type="number"
              placeholder="০"
              value={state.investment}
              onChange={(e) =>
                onChange({ ...state, investment: e.target.value, result: null })
              }
              className="h-9 text-sm"
            />
          </div>
          <div>
            <label
              htmlFor="calc-sales"
              className="block text-xs text-muted-foreground mb-1"
            >
              আয়/বিক্রয় (টাকা)
            </label>
            <Input
              id="calc-sales"
              data-ocid="calc.sales_input"
              type="number"
              placeholder="০"
              value={state.sales}
              onChange={(e) =>
                onChange({ ...state, sales: e.target.value, result: null })
              }
              className="h-9 text-sm"
            />
          </div>
        </div>

        <Button
          data-ocid="calc.submit_button"
          onClick={calculate}
          className="w-full h-9 text-sm font-semibold"
          disabled={!state.investment || !state.sales}
        >
          হিসাব করুন
        </Button>

        <AnimatePresence>
          {state.result && resultConfig && (
            <motion.div
              data-ocid="calc.result_panel"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className={`mt-3 p-3 rounded-lg border-2 ${resultConfig.cls}`}
            >
              <div className="flex items-center gap-2 font-bold text-sm mb-2">
                {resultConfig.icon}
                <span>{resultConfig.label}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center">
                  <div className="opacity-70">মোট খরচ</div>
                  <div className="font-bold text-sm">
                    ৳ {state.result.investment.toLocaleString("bn-BD")}
                  </div>
                </div>
                <div className="text-center">
                  <div className="opacity-70">মোট আয়</div>
                  <div className="font-bold text-sm">
                    ৳ {state.result.sales.toLocaleString("bn-BD")}
                  </div>
                </div>
                <div className="text-center">
                  <div className="opacity-70">
                    {state.result.type === "profit"
                      ? "নিট লাভ"
                      : state.result.type === "loss"
                        ? "নিট লোকসান"
                        : "পার্থক্য"}
                  </div>
                  <div className="font-bold text-sm">
                    ৳ {state.result.difference.toLocaleString("bn-BD")}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// Auth header button
function AuthHeaderButton() {
  const { identity, login, clear, isLoggingIn, isInitializing } =
    useInternetIdentity();
  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();

  if (isInitializing) return null;

  if (isAuthenticated) {
    const principal = identity.getPrincipal().toString();
    const shortPrincipal = `${principal.slice(0, 5)}...${principal.slice(-3)}`;
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 bg-green-50 border border-green-200 rounded-xl px-2.5 py-1.5">
          <User className="w-3.5 h-3.5 text-green-700" />
          <span className="text-xs font-medium text-green-800">
            {shortPrincipal}
          </span>
        </div>
        <button
          type="button"
          data-ocid="header.logout_button"
          onClick={clear}
          className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label="লগআউট"
          title="লগআউট"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      data-ocid="header.login_button"
      onClick={login}
      disabled={isLoggingIn}
      className="flex items-center gap-1.5 bg-green-600 text-white text-xs font-semibold px-3 py-2 rounded-xl hover:bg-green-700 transition-colors disabled:opacity-60 shrink-0"
    >
      <LogIn className="w-3.5 h-3.5" />
      {isLoggingIn ? "লগইন..." : "লগইন"}
    </button>
  );
}

function HomePage({ onSelect }: { onSelect: (s: SubSector) => void }) {
  const { canInstall, install } = useInstallPrompt();

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.07 } },
  };
  const cardVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.35, ease: "easeOut" as const },
    },
  };

  return (
    <div className="min-h-screen field-pattern">
      <header className="bg-white/80 backdrop-blur-sm sticky top-0 z-10 border-b border-border shadow-xs">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <img
                src="/assets/generated/krishi-logo-transparent.dim_200x200.png"
                alt="বাংলাদেশের কৃষি লোগো"
                className="w-12 h-12 object-contain"
              />
              <div>
                <h1 className="text-xl font-bold text-primary leading-tight">
                  বাংলাদেশের কৃষি
                </h1>
                <p className="text-xs text-muted-foreground">
                  কৃষি উপখাত ভিত্তিক তথ্য ও হিসাব
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {canInstall && (
                <button
                  type="button"
                  data-ocid="header.install.primary_button"
                  onClick={install}
                  className="flex items-center gap-1.5 bg-green-600 text-white text-xs font-semibold px-3 py-2 rounded-xl hover:bg-green-700 transition-colors shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  ইনস্টল
                </button>
              )}
              <AuthHeaderButton />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="mb-5">
          <h2 className="text-lg font-bold text-foreground mb-1">
            কৃষির উপখাতসমূহ
          </h2>
          <p className="text-sm text-muted-foreground">
            আপনার পছন্দের উপখাত বেছে নিন
          </p>
        </div>

        <motion.div
          className="grid grid-cols-2 gap-3"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {subSectors.map((sector, i) => (
            <motion.button
              key={sector.id}
              type="button"
              data-ocid={`home.sector_card.${i + 1}`}
              variants={cardVariants}
              whileHover={{ scale: 1.02, transition: { duration: 0.15 } }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect(sector)}
              className={`text-left p-4 rounded-2xl border-2 transition-colors cursor-pointer ${sector.bgClass} ${sector.borderClass}`}
            >
              <div className="text-4xl mb-2">{sector.icon}</div>
              <h3
                className={`font-bold text-sm leading-tight mb-1 ${sector.textClass}`}
              >
                {sector.name}
              </h3>
              <p className="text-xs text-muted-foreground leading-snug mb-2">
                {sector.description}
              </p>
              <Badge
                className={`text-xs font-medium ${sector.badgeClass} border-0`}
              >
                {sector.items.length}টি উপাদান
              </Badge>
            </motion.button>
          ))}
        </motion.div>
      </main>

      <footer className="text-center py-6 text-xs text-muted-foreground">
        © {new Date().getFullYear()}.{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-foreground transition-colors"
        >
          caffeine.ai দিয়ে তৈরি ❤️
        </a>
      </footer>
    </div>
  );
}

function LoginPromptDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { login, isLoggingIn } = useInternetIdentity();
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent data-ocid="login.dialog" className="max-w-xs text-center">
        <DialogHeader>
          <div className="flex justify-center mb-3">
            <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center">
              <LogIn className="w-7 h-7 text-green-700" />
            </div>
          </div>
          <DialogTitle className="text-lg">লগইন করুন</DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            হিসাব করতে প্রথমে লগইন করুন
          </p>
        </DialogHeader>
        <div className="flex flex-col gap-3 mt-2">
          <Button
            data-ocid="login.primary_button"
            onClick={login}
            disabled={isLoggingIn}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold"
          >
            {isLoggingIn ? (
              <>
                <span className="animate-pulse">লগইন হচ্ছে...</span>
              </>
            ) : (
              "ইন্টারনেট আইডি দিয়ে লগইন"
            )}
          </Button>
          <button
            type="button"
            data-ocid="login.cancel_button"
            onClick={onClose}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            পরে করব
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SubSectorPage({
  sector,
  onBack,
}: { sector: SubSector; onBack: () => void }) {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();
  const { data: isSubscribed, isLoading: subLoading } = useIsSubscribed();

  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const [calcStates, setCalcStates] = useState<Record<number, CalcState>>({});
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  const getCalcState = (idx: number): CalcState =>
    calcStates[idx] ?? { investment: "", sales: "", result: null };

  const handleExpand = (idx: number) => {
    if (!isAuthenticated) {
      setShowLoginDialog(true);
      return;
    }
    if (!isSubscribed && !subLoading) {
      setShowSubscriptionModal(true);
      return;
    }
    setExpandedIdx((prev) => (prev === idx ? null : idx));
  };

  const handleCalcChange = (idx: number, state: CalcState) => {
    setCalcStates((prev) => ({ ...prev, [idx]: state }));
  };

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.05 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, x: -16 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3, ease: "easeOut" as const },
    },
  };

  return (
    <div className="min-h-screen bg-background">
      <header
        className={`${sector.bgClass.split(" ")[0]} border-b-2 ${sector.borderClass} sticky top-0 z-10`}
      >
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              data-ocid="sector.back_button"
              onClick={onBack}
              className={`p-2 rounded-xl hover:bg-white/60 transition-colors ${sector.textClass}`}
              aria-label="পেছনে যান"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <img
              src="/assets/generated/krishi-logo-transparent.dim_200x200.png"
              alt="লোগো"
              className="w-9 h-9 object-contain"
            />
            <div className="text-3xl">{sector.icon}</div>
            <div className="flex-1">
              <h1 className={`text-lg font-bold ${sector.textClass}`}>
                {sector.name}
              </h1>
              <p className="text-xs text-muted-foreground">
                {sector.description}
              </p>
            </div>
            <AuthHeaderButton />
          </div>
        </div>
      </header>

      {/* Subscription status badge */}
      {isAuthenticated && !subLoading && !isSubscribed && (
        <div className="max-w-2xl mx-auto px-4 pt-3">
          <button
            type="button"
            data-ocid="subscription.open_modal_button"
            onClick={() => setShowSubscriptionModal(true)}
            className="w-full flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 text-sm text-amber-800 hover:bg-amber-100 transition-colors"
          >
            <span>প্রিমিয়াম সদস্যতা নিন — সব ক্যালকুলেটর ব্যবহার করুন</span>
            <span className="font-bold text-amber-700 shrink-0">৳৫০/মাস →</span>
          </button>
        </div>
      )}

      {isAuthenticated && isSubscribed && (
        <div className="max-w-2xl mx-auto px-4 pt-3">
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-2 text-sm text-green-800">
            <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
            <span>সক্রিয় সদস্যতা — সকল হিসাব উপলব্ধ</span>
          </div>
        </div>
      )}

      <main className="max-w-2xl mx-auto px-4 py-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-muted-foreground">
            সকল উপাদান
          </h2>
          <Badge className={`${sector.badgeClass} border-0`}>
            {sector.items.length}টি উপাদান
          </Badge>
        </div>

        <motion.div
          className="space-y-2"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {sector.items.map((item, idx) => (
            <motion.div
              key={item}
              data-ocid={`sector.item.${idx + 1}`}
              variants={itemVariants}
              className="bg-white rounded-xl border border-border shadow-xs overflow-hidden"
            >
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg ${sector.bgClass.split(" ")[0]}`}
                  >
                    {sector.icon}
                  </div>
                  <span className="font-medium text-sm text-foreground">
                    {item}
                  </span>
                </div>
                <Button
                  size="sm"
                  variant={expandedIdx === idx ? "secondary" : "outline"}
                  className={`text-xs h-7 px-3 gap-1.5 ${
                    expandedIdx === idx
                      ? ""
                      : `border-2 ${sector.borderClass} ${sector.textClass}`
                  }`}
                  onClick={() => handleExpand(idx)}
                >
                  <Calculator className="w-3 h-3" />
                  {expandedIdx === idx ? "বন্ধ করুন" : "হিসাব করুন"}
                </Button>
              </div>

              <AnimatePresence>
                {expandedIdx === idx && (
                  <div className="px-4 pb-4">
                    <CalculatorPanel
                      state={getCalcState(idx)}
                      onChange={(s) => handleCalcChange(idx, s)}
                      onClose={() => setExpandedIdx(null)}
                    />
                  </div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>
      </main>

      <LoginPromptDialog
        open={showLoginDialog}
        onClose={() => setShowLoginDialog(false)}
      />
      <SubscriptionModal
        open={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
      />
    </div>
  );
}

// Handle Stripe payment return
function PaymentReturnHandler() {
  const sessionId = useSessionId();
  const { data: sessionStatus } = useCheckStripeSession(sessionId);
  const queryClient = useQueryClient();
  const [handled, setHandled] = useState(false);

  useEffect(() => {
    if (!sessionStatus || handled) return;
    setHandled(true);
    if (sessionStatus.__kind__ === "completed") {
      toast.success("সাবস্ক্রিপশন সফল! আপনি এখন সকল হিসাব ব্যবহার করতে পারবেন।", {
        duration: 6000,
      });
      queryClient.invalidateQueries({ queryKey: ["isSubscribed"] });
      // Clean URL
      const url = new URL(window.location.href);
      url.searchParams.delete("session_id");
      window.history.replaceState({}, "", url.toString());
    } else if (sessionStatus.__kind__ === "failed") {
      toast.error("পেমেন্ট সম্পন্ন হয়নি। আবার চেষ্টা করুন।");
    }
  }, [sessionStatus, handled, queryClient]);

  return null;
}

export default function App() {
  const [selectedSector, setSelectedSector] = useState<SubSector | null>(null);

  return (
    <>
      <Toaster richColors position="top-center" />
      <PaymentReturnHandler />
      <InstallBanner />
      <AnimatePresence mode="wait">
        {!selectedSector ? (
          <motion.div
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.2 }}
          >
            <HomePage onSelect={(s) => setSelectedSector(s)} />
          </motion.div>
        ) : (
          <motion.div
            key={selectedSector.id}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 30 }}
            transition={{ duration: 0.2 }}
          >
            <SubSectorPage
              sector={selectedSector}
              onBack={() => setSelectedSector(null)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
