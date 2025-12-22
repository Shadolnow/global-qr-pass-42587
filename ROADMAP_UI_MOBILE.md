# 📱 Mobile App & UI/UX Enhancement Roadmap

## 🚀 Phase 1: High-Impact UI/UX (Immediate Wins)
**Goal:** Make the current web app feel like a native app.

### 1. Visual Delight & Feedback
- **Confetti Explosion:** Trigger on successful payment and ticket claim.
  - *Tech:* `canvas-confetti`
- **Micro-interactions:** 
  - Animate heart icons on wishlisting.
  - Scale effects on button presses (already started with `touch-spring`).
  - Smooth transitions between pages using `framer-motion`.
- **Sound Effects (Toggleable):**
  - "Ching" sound on payment success.
  - Soft "pop" on button taps.
  - *Tech:* `use-sound` hook.

### 2. Perceived Performance
- **Skeleton Loading:** Replace all spinners with shimmering skeleton screens (Ticket Cards, Event Lists).
- **Optimistic UI:** Show "Booked" state immediately while API processes in background.

### 3. Mobile Web Polish (PWA+)
- **Bottom Navigation Bar:** For mobile view specifically (Home, Tickets, Search, Profile).
- **Swipe Gestures:** Swipe to delete ticket (admin), swipe to change tabs.
- **Install Prompt:** Custom "Install App" bottom sheet for PWA installation.

---

## 🌓 Phase 2: Advanced Features (Next Sprint)
**Goal:** Broaden accessibility and customization.

### 1. Theme Engine & Dark Mode
- Implement `next-themes` (or similar for Vite) to handle Light/Dark mode.
- **White-labeling:** Allow organizers to pick primary colors for their event page.
  - *Implementation:* css variables updated via React context.

### 2. Accessibility & Localization
- **Audit:** Run Lighthouse Accessibility check and fix contrast/aria-labels.
- **i18n:** Set up `react-i18next` for English/Hindi/Spanish support.

---

## 📲 Phase 3: Native Mobile App (React Native / Expo)
**Goal:** Improved hardware access and "App Store" presence.

### Strategy: **Expo Router (Code Reuse)**
Since we are using React, moving to **React Native with Expo** is the best path. We can reuse ~60% of logic (hooks, state, API calls).

### Key Native Features:
1.  **VisionCamera:** Instant QR scanning (10x faster than web).
2.  **Offline-First (WatermelonDB):** Sync tickets and scan logs effectively.
3.  **Apple/Google Wallet:** One-tap "Add to Wallet".
4.  **Biometrics:** FaceID/TouchID for admin login (already in roadmap).
5.  **Push Notifications:** Reliable delivery via FCM/APNs.

### Architecture Plan:
- **Monorepo:** Move existing web app and new mobile app into a standard monorepo (Turborepo) to share UI packages and logic.

---

## 📅 Recommended Action Plan

**Today:**
1. Implement **Confetti** on Payment Success (`PublicEvent.tsx`).
2. Add **Skeleton Loaders** for the Event List (`Index.tsx`).
3. Add **Micro-interactions** (button press scales).

**Next Session:**
1. Implement **Sound Effects**.
2. Start **Dark Mode/Theme Toggle**.
