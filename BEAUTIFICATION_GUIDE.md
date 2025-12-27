# ✨ Event Page Beautification Guide

This guide explains how the "Big Party" theme and premium visual effects are implemented in the Event Page.

## 🎨 Core Components

The beautification is built using a set of custom React components located in `src/components/PartyElements.tsx`.

### 1. `PartyBackground`
- **What it does**: Creates the animated gradient background with floating emojis and sparkles.
- **How it works**: 
  - Uses CSS keyframes (`animate-float`, `animate-gradient-shift`) defined in `index.css`.
  - Places emojis in absolute positions with random delays for a natural floating effect.
- **Usage**:
  ```tsx
  <PartyBackground />
  ```
  (Place it at the top of your page container with `relative overflow-hidden`)

### 2. `PartyCard`
- **What it does**: Replaces the standard `Card` with a glassmorphism effect and glowing borders.
- **How it works**:
  - Uses `backdrop-blur-xl` and semi-transparent white backgrounds.
  - Adds a colorful gradient border using `border-white/20`.
- **Usage**:
  ```tsx
  <PartyCard>
    Your Content Here
  </PartyCard>
  ```

### 3. `PartyHeader`
- **What it does**: Displays the event title with a animated gradient text effect and blur.
- **How it works**:
  - Uses `bg-clip-text` with a moving gradient (`animate-gradient-x`).
  - Adds a duplicate blurred span behind the text for a "glow" effect.

### 4. `usePartyConfetti` Hook
- **What it does**: Fires fireworks/confetti programmatically (e.g., on button click or load).
- **How it works**:
  - Wraps the `canvas-confetti` library.
  - **Usage**:
    ```tsx
    const { celebrate } = usePartyConfetti();
    <Button onClick={celebrate}>Celebtrate!</Button>
    ```

## 🖌️ CSS Animations (in `src/index.css`)

We added custom keyframes to Tailwind config/CSS:
- `animate-float`: Moves elements up and down gently.
- `animate-gradient-x`: Moves background gradients horizontally.
- `animate-pulse-slow`: A slower version of the standard pulse for subtle glowing.

## 🚀 How to Apply to New Pages

1. **Import the components**:
   ```typescript
   import { PartyBackground, PartyCard, PartyHeader } from '@/components/PartyElements';
   ```

2. **Wrap your page**:
   ```tsx
   <div className="min-h-screen relative overflow-hidden">
     <PartyBackground />
     <div className="relative z-10 container">
        {/* Page Content */}
     </div>
   </div>
   ```

3. **Use Party Cards** instead of regular divs for content sections.

This system is modular, so you can easily add the "Party Vibe" to any other page in the app!
