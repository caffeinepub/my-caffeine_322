# বাংলাদেশের কৃষি হিসাব

## Current State
App has hardcoded government prices for all products in frontend App.tsx. Prices cannot be changed without a code rebuild.

## Requested Changes (Diff)

### Add
- Backend: GovPriceEntry type and govPrices map for admin-configurable prices
- Backend: setGovPrice and getGovPrices functions
- Frontend: useGovPrices hook to fetch prices from backend
- Frontend: Admin panel page to update prices per item
- Frontend: Merge backend prices over default hardcoded prices

### Modify
- Frontend: Product list uses live backend prices with fallback to defaults
- Frontend: Admin panel accessible from header for admin users

### Remove
- Nothing

## Implementation Plan
1. Add gov price functions to main.mo
2. Add hooks to useQueries.ts
3. Update App.tsx to merge backend prices over defaults
4. Create AdminPanel.tsx with price editing UI
5. Add admin nav to header
