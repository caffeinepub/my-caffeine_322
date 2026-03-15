import type { CalcRecord } from "@/backend";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import {
  useCalcHistory,
  useDeleteCalcRecord,
  useIsSubscribed,
  useYearlySummary,
} from "@/hooks/useQueries";
import {
  ArrowLeft,
  BookOpen,
  LogIn,
  Trash2,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

const BENGALI_MONTHS = [
  "জানুয়ারি",
  "ফেব্রুয়ারি",
  "মার্চ",
  "এপ্রিল",
  "মে",
  "জুন",
  "জুলাই",
  "আগস্ট",
  "সেপ্টেম্বর",
  "অক্টোবর",
  "নভেম্বর",
  "ডিসেম্বর",
];

const SECTOR_ICONS: Record<string, string> = {
  crops: "🌾",
  vegetables: "🥦",
  fisheries: "🐟",
  livestock: "🐄",
  tea: "🍵",
  forestry: "🌳",
  inputs: "🌱",
  machinery: "🚜",
};

const SECTOR_NAMES: Record<string, string> = {
  crops: "শস্য ও ফসল",
  vegetables: "সবজি ও ফল",
  fisheries: "মৎস্য সম্পদ",
  livestock: "প্রাণিসম্পদ",
  tea: "চা ও বাগান",
  forestry: "বনজ সম্পদ",
  inputs: "কৃষি উপকরণ",
  machinery: "কৃষি যন্ত্রপাতি",
};

const ALL_SECTORS = [
  "crops",
  "vegetables",
  "fisheries",
  "livestock",
  "tea",
  "forestry",
  "inputs",
  "machinery",
];

function toBengaliDate(timestamp: bigint): string {
  const ms = Number(timestamp / 1_000_000n);
  const d = new Date(ms);
  const day = d.getDate();
  const month = BENGALI_MONTHS[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

function getMonthKey(timestamp: bigint): string {
  const ms = Number(timestamp / 1_000_000n);
  const d = new Date(ms);
  return `${d.getFullYear()}-${d.getMonth()}`;
}

function getMonthLabel(timestamp: bigint): string {
  const ms = Number(timestamp / 1_000_000n);
  const d = new Date(ms);
  return `${BENGALI_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function formatAmount(n: number): string {
  return n.toLocaleString("bn-BD");
}

function SummaryCard({
  label,
  amount,
  colorClass,
}: {
  label: string;
  amount: number;
  colorClass: string;
}) {
  return (
    <div className={`rounded-xl p-3 ${colorClass}`}>
      <p className="text-xs opacity-75 mb-1">{label}</p>
      <p className="font-bold text-base">৳ {formatAmount(amount)}</p>
    </div>
  );
}

function RecordCard({
  record,
  index,
  onDelete,
  isDeleting,
}: {
  record: CalcRecord;
  index: number;
  onDelete: () => void;
  isDeleting: boolean;
}) {
  const icon = SECTOR_ICONS[record.sector] ?? "🌿";
  const isProfit = record.resultType === "profit";
  const isLoss = record.resultType === "loss";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.25 }}
      data-ocid={`history.item.${index}`}
      className="bg-white rounded-xl border border-border shadow-xs p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-green-50 border border-green-100 flex items-center justify-center text-xl shrink-0">
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-foreground truncate">
              {record.item}
            </p>
            <p className="text-xs text-muted-foreground">
              {SECTOR_NAMES[record.sector] ?? record.sector}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {toBengaliDate(record.timestamp)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="text-right">
            <div
              className={`font-bold text-sm ${
                isProfit
                  ? "text-green-700"
                  : isLoss
                    ? "text-red-600"
                    : "text-amber-600"
              }`}
            >
              {isProfit ? "+" : isLoss ? "-" : ""}৳{" "}
              {formatAmount(record.difference)}
            </div>
            <div className="text-xs text-muted-foreground">
              {isProfit ? "লাভ" : isLoss ? "লোকসান" : "সমান"}
            </div>
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                type="button"
                data-ocid={`history.delete_button.${index}`}
                disabled={isDeleting}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40"
                aria-label="মুছুন"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent data-ocid="history.delete.dialog">
              <AlertDialogHeader>
                <AlertDialogTitle>হিসাব মুছে ফেলবেন?</AlertDialogTitle>
                <AlertDialogDescription>
                  এই হিসাবটি স্থায়ীভাবে মুছে যাবে। এটি পূর্বাবস্থায় ফেরানো যাবে না।
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel data-ocid="history.delete.cancel_button">
                  বাতিল
                </AlertDialogCancel>
                <AlertDialogAction
                  data-ocid="history.delete.confirm_button"
                  onClick={onDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  মুছুন
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="bg-muted/50 rounded-lg px-3 py-2 text-xs">
          <span className="text-muted-foreground">বিনিয়োগ: </span>
          <span className="font-medium">
            ৳ {formatAmount(record.investment)}
          </span>
        </div>
        <div className="bg-muted/50 rounded-lg px-3 py-2 text-xs">
          <span className="text-muted-foreground">আয়: </span>
          <span className="font-medium">৳ {formatAmount(record.sales)}</span>
        </div>
      </div>
    </motion.div>
  );
}

export function HistoryPage({ onBack }: { onBack: () => void }) {
  const { identity, login, isLoggingIn } = useInternetIdentity();
  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();
  const { data: isSubscribed } = useIsSubscribed();
  const { data: records, isLoading: histLoading } = useCalcHistory();
  const { data: summary, isLoading: sumLoading } = useYearlySummary();
  const { mutate: deleteRecord, isPending: isDeleting } = useDeleteCalcRecord();
  const [activeFilter, setActiveFilter] = useState("all");

  const handleDelete = (id: bigint) => {
    deleteRecord(id, {
      onSuccess: () => toast.success("হিসাব মুছে ফেলা হয়েছে"),
      onError: () => toast.error("মুছতে সমস্যা হয়েছে"),
    });
  };

  const filteredRecords =
    records?.filter(
      (r) => activeFilter === "all" || r.sector === activeFilter,
    ) ?? [];

  // Group by month
  const groupedByMonth: {
    key: string;
    label: string;
    records: CalcRecord[];
  }[] = [];
  for (const record of filteredRecords) {
    const key = getMonthKey(record.timestamp);
    let group = groupedByMonth.find((g) => g.key === key);
    if (!group) {
      group = { key, label: getMonthLabel(record.timestamp), records: [] };
      groupedByMonth.push(group);
    }
    group.records.push(record);
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-white/80 backdrop-blur-sm sticky top-0 z-10 border-b border-border shadow-xs">
          <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
            <button
              type="button"
              data-ocid="history.back_button"
              onClick={onBack}
              className="p-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold text-foreground">হিসাবের ইতিহাস</h1>
          </div>
        </header>
        <div className="max-w-2xl mx-auto px-4 py-12 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <LogIn className="w-8 h-8 text-green-700" />
          </div>
          <h2 className="text-lg font-bold mb-2">লগইন করুন</h2>
          <p className="text-sm text-muted-foreground mb-6">
            হিসাবের ইতিহাস দেখতে লগইন করতে হবে
          </p>
          <Button
            data-ocid="history.login.primary_button"
            onClick={login}
            disabled={isLoggingIn}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {isLoggingIn ? "লগইন হচ্ছে..." : "লগইন করুন"}
          </Button>
        </div>
      </div>
    );
  }

  if (!isSubscribed) {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-white/80 backdrop-blur-sm sticky top-0 z-10 border-b border-border shadow-xs">
          <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
            <button
              type="button"
              data-ocid="history.back_button"
              onClick={onBack}
              className="p-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold text-foreground">হিসাবের ইতিহাস</h1>
          </div>
        </header>
        <div className="max-w-2xl mx-auto px-4 py-12 text-center">
          <div className="text-5xl mb-4">📊</div>
          <h2 className="text-lg font-bold mb-2">প্রিমিয়াম ফিচার</h2>
          <p className="text-sm text-muted-foreground mb-6">
            হিসাবের ইতিহাস দেখতে সদস্যতা নিতে হবে
          </p>
          <Button
            data-ocid="history.subscribe.primary_button"
            onClick={onBack}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            সদস্যতা নিন
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white/80 backdrop-blur-sm sticky top-0 z-10 border-b border-border shadow-xs">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              data-ocid="history.back_button"
              onClick={onBack}
              className="p-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 flex-1">
              <BookOpen className="w-5 h-5 text-primary" />
              <h1 className="text-lg font-bold text-foreground">
                ১ বছরের হিসাব
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-5 space-y-5">
        {/* Yearly Summary */}
        {sumLoading ? (
          <div
            data-ocid="history.summary.loading_state"
            className="grid grid-cols-2 gap-3"
          >
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-16 rounded-xl" />
            ))}
          </div>
        ) : summary ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 gap-3"
          >
            <SummaryCard
              label="মোট বিনিয়োগ"
              amount={summary.totalInvestment}
              colorClass="bg-blue-50 text-blue-900 border border-blue-100"
            />
            <SummaryCard
              label="মোট আয়"
              amount={summary.totalSales}
              colorClass="bg-indigo-50 text-indigo-900 border border-indigo-100"
            />
            <SummaryCard
              label="মোট লাভ"
              amount={summary.totalProfit}
              colorClass="bg-green-50 text-green-900 border border-green-100"
            />
            <SummaryCard
              label="মোট লোকসান"
              amount={summary.totalLoss}
              colorClass="bg-red-50 text-red-900 border border-red-100"
            />
          </motion.div>
        ) : null}

        {/* Sector filter tabs */}
        <div className="overflow-x-auto -mx-4 px-4">
          <div className="flex gap-2 pb-1" style={{ minWidth: "max-content" }}>
            <button
              type="button"
              data-ocid="history.filter.tab"
              onClick={() => setActiveFilter("all")}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors border ${
                activeFilter === "all"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-white text-muted-foreground border-border hover:border-primary/40"
              }`}
            >
              সব
            </button>
            {ALL_SECTORS.map((s) => (
              <button
                type="button"
                key={s}
                data-ocid={`history.${s}.tab`}
                onClick={() => setActiveFilter(s)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors border whitespace-nowrap ${
                  activeFilter === s
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-white text-muted-foreground border-border hover:border-primary/40"
                }`}
              >
                {SECTOR_ICONS[s]} {SECTOR_NAMES[s]}
              </button>
            ))}
          </div>
        </div>

        {/* Records list */}
        {histLoading ? (
          <div data-ocid="history.records.loading_state" className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
        ) : groupedByMonth.length === 0 ? (
          <motion.div
            data-ocid="history.empty_state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-5xl mb-3">📋</div>
            <h3 className="font-semibold text-foreground mb-1">
              কোনো হিসাব নেই
            </h3>
            <p className="text-sm text-muted-foreground">
              ক্যালকুলেটরে হিসাব করে সংরক্ষণ করলে এখানে দেখাবে
            </p>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {groupedByMonth.map((group) => (
              <div key={group.key}>
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span className="h-px bg-border flex-1" />
                  {group.label}
                  <span className="h-px bg-border flex-1" />
                </h3>
                <AnimatePresence>
                  <div className="space-y-3">
                    {group.records.map((record, idx) => (
                      <RecordCard
                        key={record.id.toString()}
                        record={record}
                        index={idx + 1}
                        onDelete={() => handleDelete(record.id)}
                        isDeleting={isDeleting}
                      />
                    ))}
                  </div>
                </AnimatePresence>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
