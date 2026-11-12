# Lunar Lifeline - Architecture & Production Refactoring Plan

A comprehensive architectural restructuring of the Lunar Lifeline space simulation web application into a clean, modular, production-ready codebase without comments, supporting long-term extensibility and robust performance.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following decisions were confirmed by the user in Phase 1:
> - **Modular Architecture**: The codebase will be decomposed into dedicated, single-responsibility modules (`components/`, `views/`, `hooks/`, `audio/`, `types/`, `constants/`).
> - **Zero Comments Rule**: All source files will be written cleanly without code comments (`//` or `/* */`), relying on self-documenting TypeScript naming conventions.
> - **Persistent Preferences**: Language selection (`ar` / `en`) and sound state (`on` / `off`) will be stored and restored seamlessly from `localStorage`.
> - **Sticky Top Bar**: A permanent glassmorphic header will provide uninterrupted access to the Back navigation, Language switcher, and Audio controls.
> - **Win/Success Calibration**: Mission duration options (1-min quick training, 3-min standard, 5-min hardcore) plus a Safe Earth Evacuation trigger to guarantee fair and enjoyable success tracking.

---

## 1. Overview & Core Concept

- **What It Does**: A space exploration and astronaut survival simulation interface themed around NASA lunar exploration (Sector 04). Users control an astronaut in zero gravity to gather vital resources (Oxygen, Food, Energy) by orbiting celestial bodies and satellite arrays without clicking buttons, while managing vital biometrics and exploring interactive 3D planetary animations.
- **Target Audience**: Space enthusiasts, hackathon/showcase evaluators, and students interested in space medicine, aerospace telemetry, and orbital mechanics.
- **Key Value**: Replaces repetitive button-clicking mechanics with an intuitive, physics-driven orbital space collector, supported by authentic NASA biomedical research references and rich 3D planetary views.

---

## 2. User Experience & Visual Design

- **Aesthetic Direction**: Deep obsidian aerospace console (`#000000`, `#030712`) paired with calibrated phosphor accents: laser cyan (`#00d4ff`), telemetry amber (`#ffa800`), and bio-emerald (`#2bffa8`). Avoids AI-slop cliches (no decorative pills, no purple gradients, no fake versions).
- **Typography & Layout**:
  - Latin & Technical Telemetry: `Segoe UI`, `Tahoma`, and monospace tabular figures (`font-mono tabular-nums`).
  - Arabic Localization: Clean, balanced Arabic typography with full bidirectional support (`dir="rtl"` for Arabic, `dir="ltr"` for English).
  - Spatial discipline: 56px fixed top header with frosted backdrop blur, responsive multi-column cockpit layout on desktop, clean single-column stacking on mobile.
- **Interactive Feedback & Audio**:
  - Haptic Web Audio API frequency synthesis for thrusters, telemetry locks, and resource collection chimes.
  - Smooth 60fps canvas rendering with particle trails, tether physics, and atmospheric planetary limb halos.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Zero Comments Codebase**
  - *Chosen Approach*: Write all TypeScript and JSX files cleanly with zero comments.
  - *Why*: User explicitly requested code without comments, ensuring clean production-grade code that is self-explanatory through typed interfaces and meaningful function names.
- **Decision 2: Modular Decomposition**
  - *Chosen Approach*: Break monolithic components into clean sub-modules:
    - `src/types/index.ts`
    - `src/constants/index.ts`
    - `src/audio/sound.ts`
    - `src/hooks/usePreferences.ts`
    - `src/components/StickyHeader.tsx`
    - `src/components/ResourceHud.tsx`
    - `src/components/CosmicHarvestStage.tsx`
    - `src/views/LandingView.tsx`
    - `src/views/GameView.tsx`
    - `src/views/CosmicAnimationStudio.tsx`
    - `src/views/BiometricsView.tsx`
    - `src/views/ResearchView.tsx`
    - `src/views/DirectoryView.tsx`
    - `src/views/StatsView.tsx`
  - *Why*: Allows future developers to expand individual features (e.g. adding new planets or mission stages) without risking regressions in unrelated components.
- **Decision 3: Dual Win Conditions (Timer + Evac)**
  - *Chosen Approach*: Allow winning either by surviving the full selected duration or by executing a safe Earth return once stability conditions are met.
  - *Why*: Resolves the user-reported issue where the stats board showed 0 successful missions despite survival efforts.

---

## 4. Technical Architecture & Component Hierarchy

```
┌────────────────────────────────────────────────────────┐
│                      App Container                     │
│               (Preferences & Navigation Router)        │
└───────────────────────────┬────────────────────────────┘
                            │
       ┌────────────────────┴─────────────────────┐
       ▼                                          ▼
┌──────────────────────────────┐        ┌─────────────────────────┐
│     StickyHeader (Global)    │        │  Active View Controller │
│  (Back, Lang, Audio, Nav)    │        └────────────┬────────────┘
└──────────────────────────────┘                     │
      ┌──────────────┬──────────────┬────────────────┼─────────────┬─────────────┐
      ▼              ▼              ▼                ▼             ▼             ▼
┌───────────┐  ┌───────────┐  ┌───────────┐    ┌───────────┐ ┌───────────┐ ┌───────────┐
│  Landing  │  │ Animation │  │Biometrics │    │ Research  │ │ Directory │ │   Stats   │
│   View    │  │  Studio   │  │   View    │    │   View    │ │   View    │ │   View    │
└───────────┘  └───────────┘  └───────────┘    └───────────┘ └───────────┘ └───────────┘
                     │
                     ▼
          ┌──────────────────────┐
          │      GameView        │
          ├──────────────────────┤
          │  ResourceHud (Top)   │
          │  CosmicHarvestStage  │
          │  (Physics Canvas)    │
          │  Telemetry Readouts  │
          └──────────────────────┘
```

### State Management & Persistence

- `localStorage('ll_prefs')`: `{ lang: 'ar' | 'en', sound: boolean }`
- `localStorage('ll_stats')`: `{ games, wins, losses, bestTime, loseReasons, lastRunHistory }`
- State strictly lifted to the appropriate view boundary to prevent unnecessary canvas re-renders.
