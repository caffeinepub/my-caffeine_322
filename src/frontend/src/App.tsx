import { AdminPanel } from "@/components/AdminPanel";
import { ComplaintBox } from "@/components/ComplaintBox";
import { EKrishiPage } from "@/components/EKrishiPage";
import { FeaturesPage } from "@/components/FeaturesPage";
import { FeedbackSection } from "@/components/FeedbackSection";
import { HistoryPage } from "@/components/HistoryPage";
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
import {
  useCheckStripeSession,
  useGovPrices,
  useIsAdmin,
  useIsSubscribed,
  useSaveCalcRecord,
} from "@/hooks/useQueries";
import { useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  Calculator,
  CheckCircle2,
  Clock,
  Download,
  LogIn,
  LogOut,
  MessageSquare,
  Minus,
  QrCode,
  RotateCcw,
  Save,
  Settings,
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

type ItemData = {
  name: string;
  govPrice: number;
  govUnit: string;
  govQty: number;
};

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
  items: ItemData[];
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
      { name: "ধান (আউশ)", govPrice: 28, govUnit: "কেজি", govQty: 1 },
      { name: "ধান (আমন)", govPrice: 28, govUnit: "কেজি", govQty: 1 },
      { name: "ধান (বোরো)", govPrice: 30, govUnit: "কেজি", govQty: 1 },
      { name: "গম", govPrice: 35, govUnit: "কেজি", govQty: 1 },
      { name: "পাট", govPrice: 3500, govUnit: "মণ (৪০ কেজি)", govQty: 1 },
      { name: "ভুট্টা", govPrice: 30, govUnit: "কেজি", govQty: 1 },
      { name: "আলু", govPrice: 30, govUnit: "কেজি", govQty: 1 },
      { name: "সরিষা", govPrice: 70, govUnit: "কেজি", govQty: 1 },
      { name: "মসুর ডাল", govPrice: 85, govUnit: "কেজি", govQty: 1 },
      { name: "ছোলা", govPrice: 80, govUnit: "কেজি", govQty: 1 },
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
      { name: "টমেটো", govPrice: 40, govUnit: "কেজি", govQty: 1 },
      { name: "বেগুন", govPrice: 40, govUnit: "কেজি", govQty: 1 },
      { name: "লাউ", govPrice: 35, govUnit: "কেজি", govQty: 1 },
      { name: "কুমড়া", govPrice: 35, govUnit: "কেজি", govQty: 1 },
      { name: "শিম", govPrice: 60, govUnit: "কেজি", govQty: 1 },
      { name: "আম", govPrice: 80, govUnit: "কেজি", govQty: 1 },
      { name: "কলা", govPrice: 40, govUnit: "ডজন", govQty: 1 },
      { name: "পেঁপে", govPrice: 35, govUnit: "কেজি", govQty: 1 },
      { name: "কাঁঠাল", govPrice: 50, govUnit: "কেজি", govQty: 1 },
      { name: "পেঁয়াজ", govPrice: 65, govUnit: "কেজি", govQty: 1 },
      { name: "রসুন", govPrice: 150, govUnit: "কেজি", govQty: 1 },
      { name: "আদা", govPrice: 200, govUnit: "কেজি", govQty: 1 },
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
      { name: "রুই মাছ", govPrice: 300, govUnit: "কেজি", govQty: 1 },
      { name: "কাতলা মাছ", govPrice: 300, govUnit: "কেজি", govQty: 1 },
      { name: "তেলাপিয়া", govPrice: 220, govUnit: "কেজি", govQty: 1 },
      { name: "পাঙ্গাস", govPrice: 220, govUnit: "কেজি", govQty: 1 },
      { name: "চিংড়ি (গলদা)", govPrice: 800, govUnit: "কেজি", govQty: 1 },
      { name: "চিংড়ি (বাগদা)", govPrice: 600, govUnit: "কেজি", govQty: 1 },
      { name: "কই মাছ", govPrice: 350, govUnit: "কেজি", govQty: 1 },
      { name: "শিং মাছ", govPrice: 450, govUnit: "কেজি", govQty: 1 },
      { name: "মাগুর মাছ", govPrice: 500, govUnit: "কেজি", govQty: 1 },
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
      { name: "দেশি গরু", govPrice: 450, govUnit: "কেজি", govQty: 1 },
      { name: "শংকর গরু", govPrice: 500, govUnit: "কেজি", govQty: 1 },
      { name: "ছাগল", govPrice: 600, govUnit: "কেজি", govQty: 1 },
      { name: "ভেড়া", govPrice: 550, govUnit: "কেজি", govQty: 1 },
      { name: "দেশি মুরগি", govPrice: 450, govUnit: "কেজি", govQty: 1 },
      { name: "ব্রয়লার মুরগি", govPrice: 190, govUnit: "কেজি", govQty: 1 },
      { name: "লেয়ার মুরগি", govPrice: 300, govUnit: "কেজি", govQty: 1 },
      { name: "হাঁস", govPrice: 350, govUnit: "কেজি", govQty: 1 },
      { name: "কোয়েল পাখি", govPrice: 300, govUnit: "কেজি", govQty: 1 },
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
      { name: "চা (সিলেট)", govPrice: 300, govUnit: "কেজি", govQty: 1 },
      { name: "চা (পঞ্চগড়)", govPrice: 280, govUnit: "কেজি", govQty: 1 },
      { name: "ফুল চাষ", govPrice: 30, govUnit: "কেজি", govQty: 1 },
      { name: "গোলাপ", govPrice: 30, govUnit: "পিস", govQty: 1 },
      { name: "রজনীগন্ধা", govPrice: 20, govUnit: "পিস", govQty: 1 },
      { name: "লেবু বাগান", govPrice: 60, govUnit: "কেজি", govQty: 1 },
      { name: "লিচু বাগান", govPrice: 150, govUnit: "কেজি", govQty: 1 },
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
    items: [
      { name: "সুন্দরবন", govPrice: 50, govUnit: "কেজি", govQty: 1 },
      { name: "গোলপাতা", govPrice: 5, govUnit: "পিস", govQty: 1 },
      { name: "শাল বন", govPrice: 80, govUnit: "কেজি", govQty: 1 },
      { name: "সামাজিক বনায়ন", govPrice: 60, govUnit: "কেজি", govQty: 1 },
      { name: "বাঁশ", govPrice: 100, govUnit: "পিস", govQty: 1 },
      { name: "বেত", govPrice: 50, govUnit: "পিস", govQty: 1 },
      { name: "ঔষধি গাছ", govPrice: 200, govUnit: "কেজি", govQty: 1 },
    ],
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
      { name: "ইউরিয়া সার", govPrice: 22, govUnit: "কেজি", govQty: 1 },
      { name: "টিএসপি সার", govPrice: 27, govUnit: "কেজি", govQty: 1 },
      { name: "এমওপি সার", govPrice: 15, govUnit: "কেজি", govQty: 1 },
      { name: "জৈব সার", govPrice: 8, govUnit: "কেজি", govQty: 1 },
      { name: "হাইব্রিড বীজ", govPrice: 500, govUnit: "কেজি", govQty: 1 },
      { name: "দেশি বীজ", govPrice: 200, govUnit: "কেজি", govQty: 1 },
      { name: "কীটনাশক", govPrice: 300, govUnit: "লিটার", govQty: 1 },
      { name: "ছত্রাকনাশক", govPrice: 250, govUnit: "লিটার", govQty: 1 },
      { name: "সেচ ব্যবস্থাপনা", govPrice: 500, govUnit: "ঘন্টা", govQty: 1 },
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
      { name: "পাওয়ার টিলার", govPrice: 500, govUnit: "ঘন্টা", govQty: 1 },
      { name: "ট্রাক্টর", govPrice: 800, govUnit: "ঘন্টা", govQty: 1 },
      { name: "কম্বাইন হার্ভেস্টার", govPrice: 1200, govUnit: "ঘন্টা", govQty: 1 },
      { name: "রাইস ট্রান্সপ্লান্টার", govPrice: 600, govUnit: "ঘন্টা", govQty: 1 },
      { name: "সেচ পাম্প", govPrice: 300, govUnit: "ঘন্টা", govQty: 1 },
      { name: "থ্রেশার মেশিন", govPrice: 400, govUnit: "ঘন্টা", govQty: 1 },
      { name: "স্প্রেয়ার মেশিন", govPrice: 200, govUnit: "ঘন্টা", govQty: 1 },
    ],
  },
];

type GovPriceMap = Record<string, { price: number; unit: string; qty: number }>;

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
  const { canInstall, install, installed } = useInstallPrompt();
  const [dismissed, setDismissed] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);

  if (dismissed || installed) return null;

  return (
    <>
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
          {canInstall ? (
            <button
              type="button"
              data-ocid="install.primary_button"
              onClick={install}
              className="bg-white text-green-700 text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-green-50 transition-colors"
            >
              ইনস্টল করুন
            </button>
          ) : (
            <button
              type="button"
              data-ocid="install.manual_button"
              onClick={() => setShowManual(true)}
              className="bg-white text-green-700 text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-green-50 transition-colors"
            >
              কিভাবে ইনস্টল করবেন?
            </button>
          )}
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
      {showManual && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h2 className="text-lg font-bold text-green-800 mb-4">
              📲 ইনস্টল করার নিয়ম
            </h2>
            {isIOS ? (
              <ol className="space-y-3 text-sm text-gray-700">
                <li className="flex gap-2">
                  <span className="font-bold text-green-700">১.</span> Safari
                  browser-এ অ্যাপের লিংক খুলুন
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-green-700">২.</span> নিচে
                  Share বাটন (বর্গক্ষেত্র + তীর) ট্যাপ করুন
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-green-700">৩.</span> "Add to
                  Home Screen" সিলেক্ট করুন
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-green-700">৪.</span> "Add" ট্যাপ
                  করুন
                </li>
              </ol>
            ) : (
              <ol className="space-y-3 text-sm text-gray-700">
                <li className="flex gap-2">
                  <span className="font-bold text-green-700">১.</span> Chrome
                  browser-এ অ্যাপের লিংক খুলুন
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-green-700">২.</span> উপরের ডান
                  কোণে তিন-ডট মেনু (⋮) ট্যাপ করুন
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-green-700">৩.</span> "Add to
                  Home screen" বা "হোম স্ক্রিনে যোগ করুন" সিলেক্ট করুন
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-green-700">৪.</span> "Add" ট্যাপ
                  করুন
                </li>
              </ol>
            )}
            <button
              type="button"
              onClick={() => setShowManual(false)}
              className="mt-5 w-full bg-green-600 text-white font-bold py-2.5 rounded-xl hover:bg-green-700 transition-colors"
            >
              বন্ধ করুন
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function CalculatorPanel(props: {
  state: CalcState;
  onChange: (s: CalcState) => void;
  onClose: () => void;
  sector: string;
  item: string;
}) {
  const { state, onChange, onClose, sector, item } = props;
  const { mutate: saveRecord, isPending: isSaving } = useSaveCalcRecord();
  const [saved, setSaved] = useState(false);

  const calculate = () => {
    const inv = Number.parseFloat(state.investment);
    const sal = Number.parseFloat(state.sales);
    if (Number.isNaN(inv) || Number.isNaN(sal)) return;
    const diff = sal - inv;
    setSaved(false);
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

  const handleSave = () => {
    if (!state.result) return;
    saveRecord(
      {
        sector,
        item,
        investment: state.result.investment,
        sales: state.result.sales,
        difference: state.result.difference,
        resultType: state.result.type,
      },
      {
        onSuccess: () => {
          toast.success("হিসাব সংরক্ষিত হয়েছে");
          setSaved(true);
        },
        onError: () => toast.error("সংরক্ষণ করতে সমস্যা হয়েছে"),
      },
    );
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
              htmlFor={`calc-investment-${item}`}
              className="block text-xs text-muted-foreground mb-1"
            >
              বিনিয়োগ/খরচ (টাকা)
            </label>
            <Input
              id={`calc-investment-${item}`}
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
              htmlFor={`calc-sales-${item}`}
              className="block text-xs text-muted-foreground mb-1"
            >
              আয়/বিক্রয় (টাকা)
            </label>
            <Input
              id={`calc-sales-${item}`}
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

              <Button
                data-ocid="calc.save_button"
                size="sm"
                variant="outline"
                onClick={handleSave}
                disabled={isSaving || saved}
                className="mt-3 w-full h-8 text-xs gap-1.5 border-current"
              >
                <Save className="w-3 h-3" />
                {isSaving
                  ? "সংরক্ষণ হচ্ছে..."
                  : saved
                    ? "✓ সংরক্ষিত"
                    : "সংরক্ষণ করুন"}
              </Button>
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

function QRShareDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const appUrl = window.location.origin + window.location.pathname;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent data-ocid="qr.dialog" className="max-w-xs text-center">
        <DialogHeader>
          <DialogTitle className="text-lg">অ্যাপ শেয়ার করুন</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-2">
          <div className="p-3 bg-white rounded-2xl border-2 border-green-100 shadow-sm">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(appUrl)}&color=16a34a`}
              alt="QR Code"
              width={200}
              height={200}
              className="rounded-lg"
            />
          </div>
          <p className="text-xs text-muted-foreground break-all px-2">
            {appUrl}
          </p>
          <Button
            data-ocid="qr.close_button"
            variant="outline"
            onClick={onClose}
            className="w-full border-green-200 text-green-800 hover:bg-green-50"
          >
            বন্ধ করুন
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function HomePage({
  onSelect,
  onHistory,
  onAdmin,
  onEKrishi,
  onFeatures,
  govPricesMap,
}: {
  onSelect: (s: SubSector) => void;
  onHistory: () => void;
  onAdmin: () => void;
  onEKrishi: () => void;
  onFeatures: () => void;
  govPricesMap: GovPriceMap;
}) {
  const { canInstall, install } = useInstallPrompt();
  const [showQR, setShowQR] = useState(false);
  const [showInstallHelp, setShowInstallHelp] = useState(false);
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const [showComplaint, setShowComplaint] = useState(false);
  const { data: isAdmin } = useIsAdmin();

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

  // Merge govPricesMap into subSectors for display
  const mergedSectors = subSectors.map((sector) => ({
    ...sector,
    items: sector.items.map((item) => {
      const key = `${sector.id}#${item.name}`;
      const override = govPricesMap[key];
      return override
        ? {
            ...item,
            govPrice: override.price,
            govUnit: override.unit,
            govQty: override.qty,
          }
        : item;
    }),
  }));

  return (
    <div className="min-h-screen field-pattern">
      <header className="bg-white/80 backdrop-blur-sm sticky top-0 z-10 border-b border-border shadow-xs">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <img
                src="/assets/generated/krishi-logo-new-transparent.dim_400x400.png"
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
            <div className="flex items-center gap-2 flex-wrap justify-end">
              <button
                type="button"
                data-ocid="header.install.primary_button"
                onClick={canInstall ? install : () => setShowInstallHelp(true)}
                className="flex items-center gap-1.5 bg-green-600 text-white text-xs font-semibold px-3 py-2 rounded-xl hover:bg-green-700 transition-colors shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                ইনস্টল
              </button>
              <button
                type="button"
                data-ocid="header.ekrishi_button"
                onClick={onEKrishi}
                className="flex items-center gap-1.5 bg-green-50 border border-green-200 text-green-800 text-xs font-semibold px-3 py-2 rounded-xl hover:bg-green-100 transition-colors shrink-0"
                title="ই-কৃষি সেবা"
              >
                <BookOpen className="w-3.5 h-3.5" />
                ই-কৃষি
              </button>
              <button
                type="button"
                data-ocid="header.features_button"
                onClick={onFeatures}
                className="flex items-center gap-1.5 bg-emerald-600 text-white text-xs font-semibold px-3 py-2 rounded-xl hover:bg-emerald-700 transition-colors shrink-0"
                title="স্মার্ট সেবাসমূহ"
              >
                🌟 সেবাসমূহ
              </button>
              <button
                type="button"
                data-ocid="header.history_button"
                onClick={onHistory}
                className="flex items-center gap-1.5 bg-green-50 border border-green-200 text-green-800 text-xs font-semibold px-3 py-2 rounded-xl hover:bg-green-100 transition-colors shrink-0"
                title="ইতিহাস"
              >
                <Clock className="w-3.5 h-3.5" />
                ইতিহাস
              </button>
              <button
                type="button"
                data-ocid="header.qr_button"
                onClick={() => setShowQR(true)}
                className="flex items-center gap-1.5 bg-green-50 border border-green-200 text-green-800 text-xs font-semibold px-3 py-2 rounded-xl hover:bg-green-100 transition-colors shrink-0"
                title="শেয়ার QR"
              >
                <QrCode className="w-3.5 h-3.5" />
                QR
              </button>
              {isAdmin && (
                <button
                  type="button"
                  data-ocid="header.admin_button"
                  onClick={onAdmin}
                  className="flex items-center gap-1.5 bg-green-700 text-white text-xs font-semibold px-3 py-2 rounded-xl hover:bg-green-800 transition-colors shrink-0"
                  title="অ্যাডমিন প্যানেল"
                >
                  <Settings className="w-3.5 h-3.5" />
                  অ্যাডমিন
                </button>
              )}
              <button
                type="button"
                data-ocid="header.feedback_button"
                onClick={() =>
                  document
                    .getElementById("feedback-section")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="flex items-center gap-1.5 bg-green-50 border border-green-200 text-green-800 text-xs font-semibold px-3 py-2 rounded-xl hover:bg-green-100 transition-colors shrink-0"
                title="মতামত"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                মতামত
              </button>
              <button
                type="button"
                data-ocid="header.complaint_button"
                onClick={() => setShowComplaint(true)}
                className="flex items-center gap-1.5 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold px-3 py-2 rounded-xl hover:bg-red-100 transition-colors shrink-0"
                title="অভিযোগ করুন"
              >
                <AlertCircle className="w-3.5 h-3.5" />
                অভিযোগ
              </button>
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
          {mergedSectors.map((sector, i) => (
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

        {/* E-Krishi Banner */}
        <motion.button
          type="button"
          data-ocid="home.ekrishi_button"
          onClick={onEKrishi}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="mt-4 w-full text-left p-4 rounded-2xl bg-gradient-to-r from-green-700 to-emerald-600 text-white border-0 cursor-pointer shadow-md"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">ই-কৃষি সেবা</h3>
              <p className="text-xs text-green-100 mt-0.5">
                বাংলাদেশ ও আন্তর্জাতিক উন্নয়নমূলক কৃষি তথ্য
              </p>
              <p className="text-xs text-green-200 mt-1">
                ১৫+ তথ্যসূত্র • FAO • BRRI • World Bank
              </p>
            </div>
          </div>
        </motion.button>
      </main>

      <FeedbackSection />

      <footer className="text-center py-6 text-xs text-muted-foreground">
        © {new Date().getFullYear()} স্বনির্ভর কৃষি
      </footer>

      <QRShareDialog open={showQR} onClose={() => setShowQR(false)} />
      {showInstallHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h2 className="text-lg font-bold text-green-800 mb-4">
              📲 ইনস্টল করার নিয়ম
            </h2>
            {isIOS ? (
              <ol className="space-y-3 text-sm text-gray-700">
                <li className="flex gap-2">
                  <span className="font-bold text-green-700">১.</span> Safari
                  browser-এ অ্যাপের লিংক খুলুন
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-green-700">২.</span> নিচে
                  Share বাটন (বর্গক্ষেত্র + তীর চিহ্ন) ট্যাপ করুন
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-green-700">৩.</span> "Add to
                  Home Screen" সিলেক্ট করুন
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-green-700">৪.</span> উপরে
                  "Add" ট্যাপ করুন
                </li>
              </ol>
            ) : (
              <ol className="space-y-3 text-sm text-gray-700">
                <li className="flex gap-2">
                  <span className="font-bold text-green-700">১.</span> Chrome
                  browser-এ অ্যাপের লিংক খুলুন
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-green-700">২.</span> উপরের ডান
                  কোণে তিন-ডট মেনু (⋮) ট্যাপ করুন
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-green-700">৩.</span> "Add to
                  Home screen" বা "হোম স্ক্রিনে যোগ করুন" ট্যাপ করুন
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-green-700">৪.</span> "Add" ট্যাপ
                  করুন — হোম স্ক্রিনে "স্বনির্ভর কৃষি" আইকন যোগ হবে
                </li>
              </ol>
            )}
            <button
              type="button"
              onClick={() => setShowInstallHelp(false)}
              className="mt-5 w-full bg-green-600 text-white font-bold py-2.5 rounded-xl hover:bg-green-700 transition-colors"
            >
              বন্ধ করুন
            </button>
          </div>
        </div>
      )}
      <ComplaintBox
        open={showComplaint}
        onClose={() => setShowComplaint(false)}
      />
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
  govPricesMap,
}: { sector: SubSector; onBack: () => void; govPricesMap: GovPriceMap }) {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();
  const { data: isSubscribed, isLoading: subLoading } = useIsSubscribed();

  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const [calcStates, setCalcStates] = useState<Record<number, CalcState>>({});
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  // Merge gov prices for this sector
  const mergedItems = sector.items.map((item) => {
    const key = `${sector.id}#${item.name}`;
    const override = govPricesMap[key];
    return override
      ? {
          ...item,
          govPrice: override.price,
          govUnit: override.unit,
          govQty: override.qty,
        }
      : item;
  });

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
              src="/assets/generated/krishi-logo-new-transparent.dim_400x400.png"
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
            {mergedItems.length}টি উপাদান
          </Badge>
        </div>

        <motion.div
          className="space-y-2"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {mergedItems.map((item, idx) => (
            <motion.div
              key={item.name}
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
                  <div>
                    <span className="font-medium text-sm text-foreground block">
                      {item.name}
                    </span>
                    <span className="text-xs text-green-700 font-medium">
                      সরকারি দাম: ৳{item.govPrice} / {item.govQty} {item.govUnit}
                    </span>
                  </div>
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
                      sector={sector.id}
                      item={item.name}
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

type AppView = "home" | "sector" | "history" | "admin" | "ekrishi" | "features";

export default function App() {
  const [view, setView] = useState<AppView>("home");
  const [selectedSector, setSelectedSector] = useState<SubSector | null>(null);

  // Fetch government prices from backend
  const { data: govPricesRaw = [] } = useGovPrices();

  // Build lookup map: "sectorId#itemName" -> { price, unit, qty }
  const govPricesMap: GovPriceMap = useMemo(() => {
    const map: GovPriceMap = {};
    for (const entry of govPricesRaw) {
      map[`${entry.sector}#${entry.item}`] = {
        price: entry.price,
        unit: entry.unit,
        qty: entry.qty,
      };
    }
    return map;
  }, [govPricesRaw]);

  const goHome = () => {
    setView("home");
    setSelectedSector(null);
  };

  return (
    <>
      <Toaster richColors position="top-center" />
      <PaymentReturnHandler />
      <InstallBanner />
      <AnimatePresence mode="wait">
        {view === "admin" ? (
          <motion.div
            key="admin"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 30 }}
            transition={{ duration: 0.2 }}
          >
            <AdminPanel onBack={goHome} />
          </motion.div>
        ) : view === "history" ? (
          <motion.div
            key="history"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 30 }}
            transition={{ duration: 0.2 }}
          >
            <HistoryPage onBack={goHome} />
          </motion.div>
        ) : view === "ekrishi" ? (
          <motion.div
            key="ekrishi"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 30 }}
            transition={{ duration: 0.2 }}
          >
            <EKrishiPage onBack={goHome} />
          </motion.div>
        ) : view === "features" ? (
          <motion.div
            key="features"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 30 }}
            transition={{ duration: 0.2 }}
          >
            <FeaturesPage onBack={goHome} />
          </motion.div>
        ) : view === "sector" && selectedSector ? (
          <motion.div
            key={selectedSector.id}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 30 }}
            transition={{ duration: 0.2 }}
          >
            <SubSectorPage
              sector={selectedSector}
              onBack={goHome}
              govPricesMap={govPricesMap}
            />
          </motion.div>
        ) : (
          <motion.div
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.2 }}
          >
            <HomePage
              onSelect={(s) => {
                setSelectedSector(s);
                setView("sector");
              }}
              onHistory={() => setView("history")}
              onAdmin={() => setView("admin")}
              onEKrishi={() => setView("ekrishi")}
              onFeatures={() => setView("features")}
              govPricesMap={govPricesMap}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
