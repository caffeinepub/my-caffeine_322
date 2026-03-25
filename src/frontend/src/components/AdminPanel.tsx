import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useActor } from "@/hooks/useActor";
import { useGovPrices, useSetGovPrice } from "@/hooks/useQueries";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Settings,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type ItemData = {
  name: string;
  govPrice: number;
  govUnit: string;
  govQty: number;
};

type SectorDef = {
  id: string;
  name: string;
  icon: string;
  items: ItemData[];
};

const sectorDefs: SectorDef[] = [
  {
    id: "crops",
    name: "শস্য ও ফসল",
    icon: "🌾",
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

type FieldState = {
  price: string;
  unit: string;
  qty: string;
  saved: boolean;
};

type FieldMap = Record<string, FieldState>;

function makeKey(sectorId: string, itemName: string) {
  return `${sectorId}#${itemName}`;
}

export function AdminPanel({ onBack }: { onBack: () => void }) {
  const { data: govPrices = [], isLoading } = useGovPrices();
  const { mutate: setGovPrice, isPending } = useSetGovPrice();

  const [fields, setFields] = useState<FieldMap>({});
  const [savingKey, setSavingKey] = useState<string | null>(null);

  // Initialize fields from backend prices merged with defaults
  useEffect(() => {
    const map: FieldMap = {};
    for (const sector of sectorDefs) {
      for (const item of sector.items) {
        const key = makeKey(sector.id, item.name);
        const backend = govPrices.find(
          (g) => g.sector === sector.id && g.item === item.name,
        );
        map[key] = {
          price: String(backend ? backend.price : item.govPrice),
          unit: backend ? backend.unit : item.govUnit,
          qty: String(backend ? backend.qty : item.govQty),
          saved: false,
        };
      }
    }
    setFields(map);
  }, [govPrices]);

  const updateField = (
    key: string,
    patch: Partial<Omit<FieldState, "saved">>,
  ) => {
    setFields((prev) => ({
      ...prev,
      [key]: { ...prev[key], ...patch, saved: false },
    }));
  };

  const handleSave = (sectorId: string, itemName: string) => {
    const key = makeKey(sectorId, itemName);
    const f = fields[key];
    if (!f) return;
    const price = Number.parseFloat(f.price);
    const qty = Number.parseFloat(f.qty);
    if (Number.isNaN(price) || Number.isNaN(qty) || !f.unit.trim()) {
      toast.error("সঠিক তথ্য দিন");
      return;
    }
    setSavingKey(key);
    setGovPrice(
      { sector: sectorId, item: itemName, price, unit: f.unit.trim(), qty },
      {
        onSuccess: () => {
          setFields((prev) => ({
            ...prev,
            [key]: { ...prev[key], saved: true },
          }));
          toast.success(`${itemName} — মূল্য সংরক্ষিত হয়েছে`);
          setSavingKey(null);
        },
        onError: () => {
          toast.error("সংরক্ষণ করতে সমস্যা হয়েছে");
          setSavingKey(null);
        },
      },
    );
  };

  const { actor } = useActor();
  const queryClient = useQueryClient();

  interface Feedback {
    id: bigint;
    name: string;
    rating: bigint;
    text: string;
    timestamp: bigint;
    approved: boolean;
  }

  interface Complaint {
    id: bigint;
    name: string;
    text: string;
    timestamp: bigint;
    status: string;
  }

  const { data: allFeedbacks = [], isLoading: fbLoading } = useQuery<
    Feedback[]
  >({
    queryKey: ["allFeedbacks"],
    queryFn: async () => {
      if (!actor) return [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (actor as any).getAllFeedbacks();
    },
    enabled: !!actor,
    staleTime: 10_000,
  });

  const { data: complaints = [], isLoading: cmpLoading } = useQuery<
    Complaint[]
  >({
    queryKey: ["complaints"],
    queryFn: async () => {
      if (!actor) return [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (actor as any).getComplaints();
    },
    enabled: !!actor,
    staleTime: 10_000,
  });

  const { mutate: deleteFeedback } = useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not ready");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (actor as any).deleteFeedback(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allFeedbacks"] });
      queryClient.invalidateQueries({ queryKey: ["approvedFeedbacks"] });
      toast.success("মতামত মুছে ফেলা হয়েছে");
    },
    onError: () => toast.error("মুছতে সমস্যা হয়েছে"),
  });

  const { mutate: updateStatus } = useMutation({
    mutationFn: async ({ id, status }: { id: bigint; status: string }) => {
      if (!actor) throw new Error("Actor not ready");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (actor as any).updateComplaintStatus(id, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["complaints"] });
      toast.success("স্ট্যাটাস আপডেট হয়েছে");
    },
    onError: () => toast.error("আপডেট করতে সমস্যা হয়েছে"),
  });

  const formatDate = (ts: bigint) => {
    const ms = Number(ts / 1_000_000n);
    return new Date(ms).toLocaleDateString("bn-BD", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const statusLabel: Record<string, string> = {
    pending: "অপেক্ষমাণ",
    reviewed: "পর্যালোচিত",
    resolved: "সমাধান হয়েছে",
  };

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    reviewed: "bg-blue-100 text-blue-800",
    resolved: "bg-green-100 text-green-800",
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white border-b-2 border-green-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              data-ocid="admin.back_button"
              onClick={onBack}
              className="p-2 rounded-xl hover:bg-green-50 transition-colors text-green-800"
              aria-label="পেছনে যান"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center">
              <Settings className="w-5 h-5 text-green-700" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-green-900">অ্যাডমিন প্যানেল</h1>
              <p className="text-xs text-muted-foreground">
                মূল্য, মতামত ও অভিযোগ পরিচালনা করুন
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-5">
        <Tabs defaultValue="prices" data-ocid="admin.tab">
          <TabsList className="w-full mb-5 bg-green-50 border border-green-200 rounded-xl p-1">
            <TabsTrigger
              value="prices"
              data-ocid="admin.prices_tab"
              className="flex-1 rounded-lg text-xs"
            >
              মূল্য নির্ধারণ
            </TabsTrigger>
            <TabsTrigger
              value="feedbacks"
              data-ocid="admin.feedbacks_tab"
              className="flex-1 rounded-lg text-xs"
            >
              মতামত
            </TabsTrigger>
            <TabsTrigger
              value="complaints"
              data-ocid="admin.complaints_tab"
              className="flex-1 rounded-lg text-xs"
            >
              অভিযোগ
            </TabsTrigger>
          </TabsList>

          <TabsContent value="feedbacks">
            {fbLoading ? (
              <div
                data-ocid="admin.feedbacks.loading_state"
                className="flex justify-center py-12"
              >
                <Loader2 className="w-6 h-6 animate-spin text-green-600" />
              </div>
            ) : allFeedbacks.length === 0 ? (
              <div
                data-ocid="admin.feedbacks.empty_state"
                className="text-center py-12 text-muted-foreground text-sm"
              >
                কোনো মতামত নেই
              </div>
            ) : (
              <div className="space-y-3">
                {allFeedbacks.map((fb, idx) => (
                  <div
                    key={String(fb.id)}
                    data-ocid={`admin.feedback.item.${idx + 1}`}
                    className="bg-white border border-border rounded-2xl p-4"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-sm text-foreground">
                            {fb.name}
                          </p>
                          <span className="text-yellow-500 text-xs">
                            {"★".repeat(Number(fb.rating))}
                          </span>
                          {fb.approved && (
                            <Badge className="bg-green-100 text-green-800 text-xs border-0">
                              অনুমোদিত
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-foreground/80">{fb.text}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDate(fb.timestamp)}
                        </p>
                      </div>
                      <button
                        type="button"
                        data-ocid={`admin.feedback.delete_button.${idx + 1}`}
                        onClick={() => deleteFeedback(fb.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="মুছুন"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="complaints">
            {cmpLoading ? (
              <div
                data-ocid="admin.complaints.loading_state"
                className="flex justify-center py-12"
              >
                <Loader2 className="w-6 h-6 animate-spin text-green-600" />
              </div>
            ) : complaints.length === 0 ? (
              <div
                data-ocid="admin.complaints.empty_state"
                className="text-center py-12 text-muted-foreground text-sm"
              >
                কোনো অভিযোগ নেই
              </div>
            ) : (
              <div className="space-y-3">
                {complaints.map((c, idx) => (
                  <div
                    key={String(c.id)}
                    data-ocid={`admin.complaint.item.${idx + 1}`}
                    className="bg-white border border-border rounded-2xl p-4"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <p className="font-semibold text-sm text-foreground">
                          {c.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(c.timestamp)}
                        </p>
                      </div>
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-full ${statusColors[c.status] ?? "bg-gray-100 text-gray-700"}`}
                      >
                        {statusLabel[c.status] ?? c.status}
                      </span>
                    </div>
                    <p className="text-sm text-foreground/80 mb-3">{c.text}</p>
                    <div className="flex gap-2 flex-wrap">
                      {["pending", "reviewed", "resolved"].map((s) => (
                        <button
                          key={s}
                          type="button"
                          data-ocid={`admin.complaint.status_button.${idx + 1}`}
                          onClick={() => updateStatus({ id: c.id, status: s })}
                          disabled={c.status === s}
                          className={`text-xs px-3 py-1.5 rounded-lg border transition-colors disabled:opacity-40 disabled:cursor-default ${
                            c.status === s
                              ? "bg-green-100 border-green-300 text-green-800"
                              : "border-border hover:bg-muted"
                          }`}
                        >
                          {statusLabel[s]}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="prices">
            {isLoading ? (
              <div
                data-ocid="admin.loading_state"
                className="flex items-center justify-center py-16 text-muted-foreground"
              >
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                <span>মূল্য তালিকা লোড হচ্ছে...</span>
              </div>
            ) : (
              <Accordion type="multiple" className="space-y-2">
                {sectorDefs.map((sector, sIdx) => (
                  <AccordionItem
                    key={sector.id}
                    value={sector.id}
                    data-ocid={`admin.sector_panel.${sIdx + 1}`}
                    className="border border-border rounded-xl overflow-hidden bg-white"
                  >
                    <AccordionTrigger
                      data-ocid={`admin.sector_toggle.${sIdx + 1}`}
                      className="px-4 py-3 hover:no-underline hover:bg-green-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{sector.icon}</span>
                        <div className="text-left">
                          <div className="font-semibold text-sm text-foreground">
                            {sector.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {sector.items.length}টি উপাদান
                          </div>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <div className="space-y-4 pt-2">
                        {sector.items.map((item, iIdx) => {
                          const key = makeKey(sector.id, item.name);
                          const f = fields[key] ?? {
                            price: String(item.govPrice),
                            unit: item.govUnit,
                            qty: String(item.govQty),
                            saved: false,
                          };
                          const isSaving = savingKey === key && isPending;
                          return (
                            <div
                              key={item.name}
                              data-ocid={`admin.item.${iIdx + 1}`}
                              className="p-3 bg-green-50 rounded-xl border border-green-100"
                            >
                              <div className="flex items-center justify-between mb-3">
                                <span className="font-medium text-sm text-green-900">
                                  {item.name}
                                </span>
                                {f.saved && (
                                  <span
                                    data-ocid={`admin.item_success_state.${iIdx + 1}`}
                                    className="flex items-center gap-1 text-xs text-green-700 font-medium"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    সংরক্ষিত
                                  </span>
                                )}
                              </div>
                              <div className="grid grid-cols-3 gap-2 mb-3">
                                <div>
                                  <Label className="text-xs text-muted-foreground mb-1 block">
                                    মূল্য (৳)
                                  </Label>
                                  <Input
                                    data-ocid={`admin.price_input.${iIdx + 1}`}
                                    type="number"
                                    value={f.price}
                                    onChange={(e) =>
                                      updateField(key, {
                                        price: e.target.value,
                                      })
                                    }
                                    className="h-8 text-sm"
                                    placeholder="০"
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs text-muted-foreground mb-1 block">
                                    একক
                                  </Label>
                                  <Input
                                    data-ocid={`admin.unit_input.${iIdx + 1}`}
                                    type="text"
                                    value={f.unit}
                                    onChange={(e) =>
                                      updateField(key, { unit: e.target.value })
                                    }
                                    className="h-8 text-sm"
                                    placeholder="কেজি"
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs text-muted-foreground mb-1 block">
                                    পরিমাণ
                                  </Label>
                                  <Input
                                    data-ocid={`admin.qty_input.${iIdx + 1}`}
                                    type="number"
                                    value={f.qty}
                                    onChange={(e) =>
                                      updateField(key, { qty: e.target.value })
                                    }
                                    className="h-8 text-sm"
                                    placeholder="১"
                                  />
                                </div>
                              </div>
                              <Button
                                data-ocid={`admin.save_button.${iIdx + 1}`}
                                size="sm"
                                onClick={() => handleSave(sector.id, item.name)}
                                disabled={isSaving}
                                className="w-full h-8 text-xs bg-green-600 hover:bg-green-700 text-white font-semibold"
                              >
                                {isSaving ? (
                                  <>
                                    <Loader2 className="w-3 h-3 animate-spin mr-1" />
                                    সংরক্ষণ হচ্ছে...
                                  </>
                                ) : (
                                  "সংরক্ষণ করুন"
                                )}
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
