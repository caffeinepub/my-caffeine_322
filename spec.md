# বাংলাদেশের কৃষি হিসাব

## Current State
A Bengali-language agricultural calculator app with 8 sub-sectors, subscription model, admin panel, feedback/complaint features, government price display, QR code sharing, and PWA support.

## Requested Changes (Diff)

### Add
- "ই-কৃষি" (e-Agriculture) information service section
- New navigation view `ekrishi` in the app
- EKrishiPage component with categorized agricultural development info:
  - বাংলাদেশ (Bangladesh local agricultural news, programs, schemes)
  - আন্তর্জাতিক (International agriculture development info)
  - আধুনিক কৃষি (Modern farming techniques)
  - সরকারি সেবা (Government services/schemes)
- Header button "ই-কৃষি" to access the section from home page
- Each info card shows: title, short description, category badge, source/country tag

### Modify
- App.tsx: add `ekrishi` to AppView type, add navigation to EKrishiPage
- HomePage header: add "ই-কৃষি" button

### Remove
- Nothing removed

## Implementation Plan
1. Create `src/frontend/src/components/EKrishiPage.tsx` with categorized info cards
2. Update App.tsx to add ekrishi view and navigation button
