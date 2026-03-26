import { ArrowLeft, BookOpen } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

type Article = {
  title: string;
  summary: string;
  category: "বাংলাদেশ" | "আন্তর্জাতিক" | "আধুনিক কৃষি" | "সরকারি সেবা";
  country: string;
  tags: string[];
  source: string;
};

const articles: Article[] = [
  // বাংলাদেশ
  {
    title: "বাংলাদেশে বোরো ধানের হাইব্রিড জাতের সফলতা",
    summary:
      "বাংলাদেশ ধান গবেষণা ইনস্টিটিউট (BRRI) উদ্ভাবিত হাইব্রিড বোরো ধানের নতুন জাত চাষে একর প্রতি ৮-১০ টন পর্যন্ত ফলন পাওয়া যাচ্ছে। সঠিক পরিচর্যা ও সার ব্যবস্থাপনায় কৃষকরা আগের তুলনায় ৩০% বেশি আয় করছেন। এই প্রযুক্তি দেশের খাদ্য নিরাপত্তায় বড় ভূমিকা রাখছে।",
    category: "বাংলাদেশ",
    country: "🇧🇩 বাংলাদেশ",
    tags: ["#ধান", "#হাইব্রিড", "#বোরো", "#BRRI"],
    source: "BRRI",
  },
  {
    title: "সরকারের সমন্বিত কৃষি উন্নয়ন কার্যক্রম — বিনামূল্যে বীজ ও সার",
    summary:
      "বাংলাদেশ কৃষি মন্ত্রণালয় প্রান্তিক কৃষকদের জন্য বিনামূল্যে হাইব্রিড বীজ ও সার সরবরাহ করছে। চলতি বছর ৫০ লক্ষ কৃষক এই সুবিধা পাচ্ছেন। উন্নত কৃষি প্রশিক্ষণ ও আধুনিক চাষপদ্ধতি সম্পর্কে সচেতনতা বাড়াতে বিভিন্ন প্রকল্পও চলছে।",
    category: "বাংলাদেশ",
    country: "🇧🇩 বাংলাদেশ",
    tags: ["#বীজ", "#সার", "#সরকারি", "#কৃষিমন্ত্রণালয়"],
    source: "কৃষি মন্ত্রণালয়",
  },
  {
    title: "সুন্দরবনে জলবায়ু সহিষ্ণু কৃষির নতুন পদ্ধতি",
    summary:
      "উপকূলীয় অঞ্চলে লবণাক্ত জমিতে চাষাবাদের জন্য বাংলাদেশ কৃষি উন্নয়ন কর্তৃপক্ষ (BARDA) নতুন কৌশল চালু করেছে। লবণ-সহিষ্ণু ধান ও সবজির জাত ব্যবহার করে কৃষকরা ক্ষতিকর আবহাওয়ায়ও ফসল উৎপাদন করতে পারছেন। জলবায়ু পরিবর্তনের বিরুদ্ধে এই প্রকল্প দক্ষিণ এশিয়ায় মডেল হিসেবে বিবেচিত।",
    category: "বাংলাদেশ",
    country: "🇧🇩 বাংলাদেশ",
    tags: ["#সুন্দরবন", "#জলবায়ু", "#লবণাক্তজমি", "#BARDA"],
    source: "BARDA",
  },
  {
    title: "ই-কৃষি সেবা: মোবাইলে কৃষি পরামর্শ 'কৃষি বাতায়ন' অ্যাপ",
    summary:
      "কৃষি সম্প্রসারণ অধিদপ্তর (DAE) এর 'কৃষি বাতায়ন' অ্যাপের মাধ্যমে কৃষকরা ঘরে বসেই বিশেষজ্ঞ পরামর্শ পাচ্ছেন। ফসলের রোগবালাই, আবহাওয়ার পূর্বাভাস এবং সরকারি সেবার তথ্য এক প্ল্যাটফর্মে পাওয়া যাচ্ছে। ইতিমধ্যে ৩০ লক্ষের বেশি কৃষক এই সেবা গ্রহণ করেছেন।",
    category: "বাংলাদেশ",
    country: "🇧🇩 বাংলাদেশ",
    tags: ["#ডিজিটাল", "#অ্যাপ", "#পরামর্শ", "#DAE"],
    source: "DAE Bangladesh",
  },
  // আন্তর্জাতিক
  {
    title: "ভারতে ড্রিপ ইরিগেশনে জলের ব্যবহার ৪০% হ্রাস",
    summary:
      "ভারত সরকারের 'প্রধানমন্ত্রী কৃষি সিঞ্চাই যোজনা' (PMKSY) প্রকল্পের আওতায় ড্রিপ ও স্প্রিংকলার সেচ পদ্ধতি সারা দেশে ছড়িয়ে পড়েছে। এই পদ্ধতিতে সনাতন সেচের তুলনায় ৪০% কম পানি ব্যবহার হচ্ছে এবং ফলন বাড়ছে ২০-৩০%। বাংলাদেশেও এই প্রযুক্তি প্রয়োগের সুযোগ রয়েছে।",
    category: "আন্তর্জাতিক",
    country: "🇮🇳 ভারত",
    tags: ["#সেচ", "#ড্রিপ", "#জলসংরক্ষণ", "#PMKSY"],
    source: "PMKSY India",
  },
  {
    title: "চীনের IoT কৃষি পদ্ধতি — সেন্সর, ড্রোন স্প্রে ও AI",
    summary:
      "চীন ইন্টারনেট অব থিংস (IoT) প্রযুক্তি ব্যবহার করে স্মার্ট ফার্মিং বিপ্লব এনেছে। মাটি ও আবহাওয়া সেন্সর, ড্রোন দিয়ে কীটনাশক স্প্রে এবং AI ভিত্তিক ফলন পূর্বাভাস দিয়ে উৎপাদন খরচ ৩৫% কমেছে। FAO চীনের এই মডেল বিশ্বের উন্নয়নশীল দেশে প্রয়োগের সুপারিশ করেছে।",
    category: "আন্তর্জাতিক",
    country: "🇨🇳 চীন",
    tags: ["#IoT", "#AI", "#ড্রোন", "#স্মার্টফার্মিং"],
    source: "FAO China",
  },
  {
    title: "নেদারল্যান্ডের জৈব পদ্ধতিতে কার্বন ফুটপ্রিন্ট হ্রাস",
    summary:
      "ওয়াগেনিনগেন বিশ্ববিদ্যালয়ের গবেষণায় দেখা গেছে জৈব কৃষি পদ্ধতিতে কার্বন নিঃসরণ ৫০% পর্যন্ত কমানো সম্ভব। নেদারল্যান্ড এখন ইউরোপের সবচেয়ে টেকসই কৃষি মডেল দেশ হিসেবে স্বীকৃত। ছোট আয়তনে সর্বাধিক উৎপাদন ও পরিবেশ রক্ষার এই ভারসাম্য বিশ্বে অনুকরণীয়।",
    category: "আন্তর্জাতিক",
    country: "🇳🇱 নেদারল্যান্ড",
    tags: ["#জৈবকৃষি", "#কার্বন", "#পরিবেশ", "#Wageningen"],
    source: "Wageningen University",
  },
  {
    title: "জাপানে ইনডোর ফার্মিং বিপ্লব — হাইড্রোপনিক্স ও লম্বার্ব",
    summary:
      "জাপানের কৃষি মন্ত্রণালয় (MAFF) কৃত্রিম আলো ও নিয়ন্ত্রিত পরিবেশে ইনডোর ফার্মিং বিশেষজ্ঞতা অর্জন করেছে। হাইড্রোপনিক্স পদ্ধতিতে সালাদ, স্ট্রবেরি ও ভেষজ গাছ উৎপাদন হচ্ছে — মাটি, সার বা কীটনাশক ছাড়াই। এই প্রযুক্তি ভবিষ্যৎ শহুরে কৃষির পথ দেখাচ্ছে।",
    category: "আন্তর্জাতিক",
    country: "🇯🇵 জাপান",
    tags: ["#হাইড্রোপনিক্স", "#ইনডোর", "#শহুরেকৃষি", "#MAFF"],
    source: "MAFF Japan",
  },
  // আধুনিক কৃষি
  {
    title: "আধুনিক হাইড্রোপনিক্স পদ্ধতিতে শাকসবজি — মাটি লাগে না",
    summary:
      "পানির মধ্যে দ্রবীভূত পুষ্টিতে গাছ জন্মানোর হাইড্রোপনিক্স পদ্ধতি বাংলাদেশেও জনপ্রিয় হচ্ছে। এই পদ্ধতিতে মাটির প্রয়োজন নেই, পানি কম লাগে এবং ৩০-৫০ দিনে ফলন পাওয়া যায়। ছাদ বাগান বা ছোট জায়গায় বাণিজ্যিক উৎপাদন সম্ভব।",
    category: "আধুনিক কৃষি",
    country: "🌍 বৈশ্বিক",
    tags: ["#হাইড্রোপনিক্স", "#ছাদকৃষি", "#আধুনিক", "#পানিচাষ"],
    source: "FAO",
  },
  {
    title: "ভার্টিক্যাল ফার্মিং: ভূমিস্বল্প দেশের সমাধান",
    summary:
      "উল্লম্ব বা ভার্টিক্যাল ফার্মিংয়ে একটি বহুতল ভবনে হাজার হেক্টর জমির সমতুল্য ফসল ফলানো সম্ভব। কৃত্রিম আলো, তাপমাত্রা নিয়ন্ত্রণ ও পানি পুনর্ব্যবহারে এই পদ্ধতি শতভাগ কার্যকর। জনবহুল ও ভূমিস্বল্প বাংলাদেশের জন্য এটি ভবিষ্যতের কৃষি সমাধান হতে পারে।",
    category: "আধুনিক কৃষি",
    country: "🌍 বৈশ্বিক",
    tags: ["#ভার্টিক্যাল", "#স্মার্টফার্মিং", "#উদ্ভাবন", "#ভবিষ্যৎ"],
    source: "World Bank",
  },
  {
    title: "AI ও ড্রোন দিয়ে ফসলের রোগ শনাক্তকরণ",
    summary:
      "কৃত্রিম বুদ্ধিমত্তা (AI) ও ড্রোন ক্যামেরার সমন্বয়ে ফসলের পাতা বিশ্লেষণ করে রোগবালাই আগেভাগে চিহ্নিত করা যাচ্ছে। এতে কীটনাশকের ব্যবহার ৬০% কমেছে এবং ফলন ক্ষতি প্রায় শূন্যে নেমে এসেছে। বাংলাদেশের কৃষি বিভাগ এই প্রযুক্তি পাইলট প্রকল্পে পরীক্ষা করছে।",
    category: "আধুনিক কৃষি",
    country: "🌍 বৈশ্বিক",
    tags: ["#AI", "#ড্রোন", "#রোগশনাক্ত", "#প্রযুক্তি"],
    source: "FAO",
  },
  // সরকারি সেবা
  {
    title: "কৃষি কার্ড — ২ কোটি কৃষককে ডিজিটাল পরিচয়",
    summary:
      "বাংলাদেশ সরকার ২ কোটি কৃষককে ডিজিটাল কৃষি কার্ড দিচ্ছে যা দিয়ে সরকারি সুবিধা, ভর্তুকি ও ঋণ সহজে পাওয়া যাবে। স্মার্ট কার্ডের মাধ্যমে কৃষকের তথ্য যাচাই ও সেবা প্রদান ডিজিটাল পদ্ধতিতে হবে। এটি কৃষি খাতে দুর্নীতি কমাতে ও প্রকৃত কৃষকের কাছে সুবিধা পৌঁছে দিতে সহায়ক।",
    category: "সরকারি সেবা",
    country: "🇧🇩 বাংলাদেশ",
    tags: ["#কৃষিকার্ড", "#ডিজিটাল", "#ভর্তুকি", "#সরকার"],
    source: "কৃষি মন্ত্রণালয়",
  },
  {
    title: "UN FAO: বিশ্ব খাদ্য নিরাপত্তা পরিকল্পনা ২০৩০",
    summary:
      "জাতিসংঘের খাদ্য ও কৃষি সংস্থা (FAO) ২০৩০ সালের মধ্যে বিশ্বের ক্ষুধামুক্তির লক্ষ্যে কৃষি উৎপাদন দ্বিগুণ করার পরিকল্পনা ঘোষণা করেছে। এই পরিকল্পনায় বাংলাদেশসহ ৫০টি দেশের কৃষি খাতে বিনিয়োগ বাড়ানো হবে। টেকসই কৃষি, জলবায়ু সহিষ্ণুতা ও ডিজিটাল কৃষি প্রযুক্তিকে অগ্রাধিকার দেওয়া হয়েছে।",
    category: "সরকারি সেবা",
    country: "🌍 আন্তর্জাতিক",
    tags: ["#FAO", "#খাদ্যনিরাপত্তা", "#UN", "#২০৩০"],
    source: "UN FAO",
  },
  {
    title: "বিশ্ব ব্যাংকের বাংলাদেশ কৃষি উন্নয়ন অর্থায়ন",
    summary:
      "বিশ্ব ব্যাংক বাংলাদেশের কৃষি আধুনিকায়নে ৫০ কোটি মার্কিন ডলার বিনিয়োগ করছে। এই অর্থায়নে সেচ অবকাঠামো উন্নয়ন, কৃষি গবেষণা এবং কৃষকদের প্রশিক্ষণ কর্মসূচি পরিচালিত হবে। আগামী ৫ বছরে ৫০ লক্ষ কৃষক উপকৃত হবেন এবং দেশের কৃষি উৎপাদনশীলতা ২৫% বৃদ্ধি পাবে বলে আশা করা হচ্ছে।",
    category: "সরকারি সেবা",
    country: "🇧🇩 বাংলাদেশ",
    tags: ["#WorldBank", "#অর্থায়ন", "#উন্নয়ন", "#বিনিয়োগ"],
    source: "World Bank",
  },
];

const categories = [
  "সব",
  "বাংলাদেশ",
  "আন্তর্জাতিক",
  "আধুনিক কৃষি",
  "সরকারি সেবা",
] as const;

const categoryBadge: Record<string, string> = {
  বাংলাদেশ: "bg-green-100 text-green-800 border-green-200",
  আন্তর্জাতিক: "bg-blue-100 text-blue-800 border-blue-200",
  "আধুনিক কৃষি": "bg-emerald-100 text-emerald-800 border-emerald-200",
  "সরকারি সেবা": "bg-amber-100 text-amber-800 border-amber-200",
};

export function EKrishiPage({ onBack }: { onBack: () => void }) {
  const [activeCategory, setActiveCategory] = useState<string>("সব");
  const [expanded, setExpanded] = useState<number | null>(null);

  const filtered =
    activeCategory === "সব"
      ? articles
      : articles.filter((a) => a.category === activeCategory);

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.07 } },
  };
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.35, ease: "easeOut" as const },
    },
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-green-700 text-white sticky top-0 z-10 shadow-md">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              data-ocid="ekrishi.back_button"
              onClick={onBack}
              className="p-2 rounded-xl hover:bg-white/20 transition-colors"
              aria-label="পেছনে যান"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h1 className="text-lg font-bold leading-tight">ই-কৃষি সেবা</h1>
              <p className="text-xs text-green-100">
                বাংলাদেশ ও আন্তর্জাতিক উন্নয়নমূলক কৃষি তথ্য
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Category Filter Tabs */}
      <div className="sticky top-[73px] z-10 bg-white border-b border-border shadow-xs">
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex gap-2 overflow-x-auto py-3 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                data-ocid="ekrishi.filter.tab"
                onClick={() => {
                  setActiveCategory(cat);
                  setExpanded(null);
                }}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                  activeCategory === cat
                    ? "bg-green-700 text-white border-green-700 shadow-sm"
                    : "bg-white text-muted-foreground border-border hover:border-green-300 hover:text-green-700"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Article Cards */}
      <main className="max-w-2xl mx-auto px-4 py-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">
            {filtered.length}টি তথ্য পাওয়া গেছে
          </p>
          <span className="text-xs bg-green-50 border border-green-200 text-green-700 px-3 py-1 rounded-full font-medium">
            আপডেট: মার্চ ২০২৬
          </span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            className="space-y-3"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {filtered.map((article, idx) => (
              <motion.div
                key={`${article.title}-${idx}`}
                data-ocid={`ekrishi.item.${idx + 1}`}
                variants={cardVariants}
                className="bg-white rounded-2xl border border-border shadow-xs overflow-hidden"
              >
                <button
                  type="button"
                  className="w-full text-left p-4"
                  onClick={() => setExpanded(expanded === idx ? null : idx)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      {/* Category Badge + Country */}
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span
                          className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                            categoryBadge[article.category]
                          }`}
                        >
                          {article.category}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {article.country}
                        </span>
                      </div>
                      {/* Title */}
                      <h3 className="font-bold text-sm text-foreground leading-snug mb-1">
                        {article.title}
                      </h3>
                      {/* Source */}
                      <p className="text-xs text-muted-foreground">
                        সূত্র: {article.source}
                      </p>
                    </div>
                    <div
                      className={`text-green-600 transition-transform duration-200 shrink-0 mt-1 ${
                        expanded === idx ? "rotate-180" : ""
                      }`}
                    >
                      <svg
                        aria-label="expand"
                        role="img"
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </div>
                  </div>
                </button>

                <AnimatePresence>
                  {expanded === idx && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.22, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 border-t border-border/60 pt-3">
                        <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                          {article.summary}
                        </p>
                        {/* Tags */}
                        <div className="flex flex-wrap gap-1.5">
                          {article.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full border border-border"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {filtered.length === 0 && (
          <div
            data-ocid="ekrishi.empty_state"
            className="text-center py-12 text-muted-foreground"
          >
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>এই বিভাগে কোনো তথ্য নেই</p>
          </div>
        )}
      </main>

      <footer className="text-center py-6 text-xs text-muted-foreground">
        © {new Date().getFullYear()} স্বনির্ভর কৃষি
      </footer>
    </div>
  );
}
