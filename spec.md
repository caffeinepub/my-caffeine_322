# বাংলাদেশের কৃষি হিসাব

## Current State
Full-stack Bengali agricultural calculator app with 8 sub-sectors, subscription model, admin panel, calculation history, and government price management.

## Requested Changes (Diff)

### Add
- Customer feedback/review section (গ্রাহকের মতামত): users can submit star ratings + text review, all users can see approved reviews publicly
- Complaint box (কমপ্লেন বাক্স): logged-in users can submit complaints; admin can view and manage them
- Backend: `Feedback` and `Complaint` types with CRUD functions
- Frontend: FeedbackSection component (public visible, submit form) and ComplaintBox component (modal/page)

### Modify
- App.tsx: add Feedback and Complaint UI accessible from main app
- AdminPanel: add complaint viewer tab

### Remove
- Nothing

## Implementation Plan
1. Add `Feedback` (id, principal, name, rating, text, timestamp, approved) and `Complaint` (id, principal, text, timestamp, status) types in main.mo
2. Add backend functions: submitFeedback, getApprovedFeedbacks, submitComplaint, getComplaints (admin), updateComplaintStatus (admin), approveFeedback (admin)
3. Update backend.d.ts
4. Add FeedbackSection and ComplaintBox components to frontend
5. Add "মতামত" and "অভিযোগ" buttons in header or main page
