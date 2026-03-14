# বাংলাদেশের কৃষি — সম্পূর্ণ কৃষি তথ্য অ্যাপ

## Current State
Simple profit/loss calculator for agriculture. Single page with investment and sales inputs.

## Requested Changes (Diff)

### Add
- Home/Dashboard page with all agricultural sub-sectors as navigation cards
- Sub-sector detail pages, each with relevant elements/tools:
  1. **শস্য ও ফসল** (Crops): ধান, গম, পাট, ভুট্টা, আলু, সবজি, ফল, মসলা — profit/loss calculator per crop
  2. **মৎস্য সম্পদ** (Fisheries): মাছ চাষ, চিংড়ি, কার্প, তেলাপিয়া — calculator + info
  3. **প্রাণিসম্পদ** (Livestock): গরু, ছাগল, ভেড়া, মুরগি, হাঁস — calculator + info
  4. **বনজ সম্পদ** (Forestry): সুন্দরবন, সামাজিক বন, বাগান — info cards
  5. **চা ও বাগান শিল্প** (Tea & Horticulture): চা, ফুল, ফল বাগান — calculator
  6. **কৃষি উপকরণ** (Agricultural Inputs): সার, বীজ, কীটনাশক, সেচ — price reference table
  7. **কৃষি যন্ত্রপাতি** (Machinery): ট্রাক্টর, হারভেস্টার, পাওয়ার টিলার — info + rental cost calculator
  8. **আবহাওয়া ও মাটি** (Weather & Soil): মৌসুম ক্যালেন্ডার, মাটির ধরন — info
- Profit/loss calculator available in each relevant sub-sector with pre-filled crop/category name
- Bottom tab navigation for Home and sub-sectors
- Bengali font (Hind Siliguri) throughout

### Modify
- App layout: multi-page with React state-based routing (no react-router)
- Header: show current section name with back button when inside sub-sector

### Remove
- Standalone single-page calculator (absorbed into sub-sector pages)

## Implementation Plan
1. Define data: sub-sectors array with icon, name (Bengali), color, and items list
2. Build HomePage with sub-sector cards grid
3. Build SubSectorPage with item list + expandable profit/loss calculator per item
4. Build shared ProfitLossCalculator component
5. Add navigation state (currentPage, selectedSector, selectedItem)
6. Style with green agriculture theme, Hind Siliguri font
