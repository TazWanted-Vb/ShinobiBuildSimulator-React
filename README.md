# ShinobiBuild

**Naruto Mobile Game Formation Builder** - A sophisticated web tool for creating optimal 3x3 ninja formations, calculating synergies, and simulating combo chains using real game data.

[![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.3-blue)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8)](https://tailwindcss.com/)
[![next-intl](https://img.shields.io/badge/next--intl-4.8.2-blue)](https://next-intl-docs.vercel.app/)

## Table of Contents

- [Overview](#overview)
- [Features](#features)
  - [Formation Builder](#formation-builder)
  - [Combos Viewer](#combos-viewer)
  - [Skills Viewer](#skills-viewer)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
  - [Data Flow](#data-flow)
  - [State Management](#state-management)
  - [Component Architecture](#component-architecture)
- [Internationalization (i18n)](#internationalization-i18n)
- [API Integration](#api-integration)
- [Core Business Logic](#core-business-logic)
- [UI/UX Design System](#uiux-design-system)
- [Type Definitions](#type-definitions)
- [Development Commands](#development-commands)
- [Environment Configuration](#environment-configuration)
- [Performance Optimizations](#performance-optimizations)
- [Accessibility](#accessibility)
- [Key Implementation Notes](#key-implementation-notes)

## Overview

ShinobiBuild is a comprehensive formation builder tool for the Naruto mobile game. It enables players to strategically plan their ninja formations with advanced features like:

- **Interactive 3x3 Formation Grid** with drag-and-drop support
- **Real-time Synergy Detection** for team composition bonuses
- **Advanced Combo Chain Visualization** showing skill chase sequences with animated effects
- **Comprehensive Skills Database** with detailed skill information
- **Smart Filtering System** for ninja selection
- **Dual-Mode API** supporting both mock data and real game API

The application implements complex game mechanics including combo chaining, synergy detection, and power calculations with a clean, modern interface optimized for both desktop and mobile devices.

**Key Features:**
- **Multi-language Support** - Full internationalization with Portuguese (pt-BR) and Chinese (zh) translations
- **Locale-based Routing** - SEO-friendly URL structure with `/pt/` and `/zh/` prefixes
- **Language Switcher** - Quick language toggle in the header
- **Dual View Modes** - Horizontal anime-style and vertical combo chain visualizations

## Features

### Formation Builder

The main page (`/`) provides the core formation building experience:

**Interactive Grid System:**
- 3x3 formation grid with visual slot indicators
- Configurable layout system with absolute positioning for each slot
- Drag-and-drop support for both desktop (HTML5 Drag API) and mobile (Touch Events)
- Global state management for touch drag operations (avoids sessionStorage race conditions)
- Click-to-place functionality with visual selection states
- In-formation slot swapping
- Visual order badges showing ninja action priority (1-9)
- **Hover on ninja cards** to view skills (desktop-only)
  - Shows Mystery, Attack, and Chase skills
  - Displays skill name, type, description with highlighted effects
  - Shows cooldown, chakra cost, and damage values
  - Uses React Portal for proper z-index layering
  - Intelligent positioning based on mouse cursor and viewport bounds

**Ninja Roster:**
- Complete list of available ninjas with avatar, name, element, role, and power
- Advanced multi-filter system:
  - Search by name
  - Filter by role (Ataque, Defesa, Suporte)
  - Filter by element (Vento, Raio, Terra, Fogo, Agua, Sombra, Fisico)
  - Filter by village (dynamically extracted from ninja data)
  - Filter by star rating (1-5 stars)
- Active filter count indicator with "Limpar" (Clear) button
- Drag ninjas directly from roster to formation slots

**Real-time Statistics:**
- Total power calculation (sum of all ninja powers)
- Synergy detection with visual indicators:
  - Complete rows/columns
  - Element matching in rows
  - Role matching in columns
  - Team 7 special bonus (Naruto, Sasuke, Sakura)

### Combos Viewer

The combos page (`/combos`) visualizes skill chase sequences with two distinct viewing modes:

**Dual View Mode System:**
- **Horizontal View**: Anime-style horizontal scrolling with character cards
  - Horizontal scrollable combo chain
  - Character cards with chakra glow effects
  - Animated arrow connectors with particle effects
  - Hit counter badges on each step
  - Responsive design optimized for mobile
- **Vertical View**: Traditional vertical list layout
  - Compact vertical combo steps
  - Gradient headers with shuriken icons
  - Efficient screen space usage

**Visual Chain Display:**
- **Improved Horizontal View** (`improved-horizontal-combo-chain.tsx`): Enhanced anime-style layout
- **Improved Vertical View** (`improved-vertical-combo-chain.tsx`): Enhanced compact layout
- Gradient cards with shuriken icons for combo headers
- Step-by-step combo chain visualization
- Horizontal scrolling for long combo chains
- Hit count calculation for each combo
- Ambient glow effects and chakra animations

**Interactive Features:**
- View mode toggle (Horizontal/Vertical)
- Filter combos by starting ninja
- Desktop hover tooltips on skill icons showing:
  - Skill name and type (Mystery/Attack/Chase)
  - Skill description with highlighted effects
  - Cooldown, battlefield cooldown, chakra cost
  - Damage and status effects
- Responsive layout that adapts to screen size
- Loading states with animated spinner

**Combo Algorithm:**
- Trigger-based chaining starting from Mystery Skills
- Recursive chase detection through formation
- Maximum depth control to prevent infinite loops
- Effect state tracking (Knockdown, Repulse, High Float, Low Float)
- **Fallback to demo combos** if no combos found in real API mode
- **Demo combo generation** for testing and development

### Skills Viewer

The skills page (`/skills`) displays all skill information:

**Skill Organization:**
- Grouped by ninja in formation
- Tab-based navigation between ninjas
- Three skill categories:
  - **Mystery Skills (Esoterica)**: Ultimate abilities
  - **Standard Attacks**: Basic attacks
  - **Chase Skills (Perseguição)**: Conditional follow-up attacks

**Detailed Skill Cards:**
- Skill icon from game CDN
- Skill name and type badge
- Enhanced description with key effects highlighted in green
- Stats display:
  - Cooldown (seconds)
  - Battlefield cooldown (rounds)
  - Chakra cost
  - Damage values
  - Status effects (repulse, knockout, etc.)

### UI Primitives

The `components/ui/` directory contains reusable UI primitives:

**Input Component** (`input.tsx`):
- Form input fields with variant support (default, error)
- Consistent styling with focus states
- Semantic data attributes

**Select Component** (`select.tsx`):
- Dropdown selection with custom styling
- Support for multiple options
- Accessible keyboard navigation

**Scroll Area Component** (`scroll-area.tsx`):
- Custom scrollable areas with consistent styling
- Cross-browser scrollbar customization
- Smooth scrolling behavior

**Error Boundary Component** (`error-boundary.tsx`):
- React error boundary with fallback UI
- Error display with icon and reload button
- Fixed overlay positioning
- Console logging for debugging

### Shared Header Component

The `Header` component (`components/formation/header.tsx`) provides consistent navigation:

**Features:**
- Sticky header with backdrop blur effect
- Logo and branding (desktop)
- Tab-based navigation (Ninjas, Skills, Combos)
- **Language Switcher** - Dropdown to toggle between PT/ZH
- Active route highlighting
- Responsive design (mobile-first)
- Smooth transitions and hover effects
- Uses `next-intl` for localized navigation labels

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm, yarn, pnpm, or bun package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd shinobebuild
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser
   - You will be redirected to [http://localhost:3000/pt](http://localhost:3000/pt) (Portuguese)
   - For Chinese: [http://localhost:3000/zh](http://localhost:3000/zh)

The app will start in **mock mode** by default with 60 pre-generated ninjas.

## Project Structure

```
shinobebuild/
├── app/                          # Next.js App Router pages
│   ├── [locale]/                 # Locale-based routing (pt, zh)
│   │   ├── combos/               # Combo chain visualization page
│   │   │   └── page.tsx         # Combos viewer with dual view modes
│   │   ├── skills/               # Skills viewer page
│   │   │   └── page.tsx         # Skills viewer with ninja filter
│   │   ├── layout.tsx            # Locale layout (fetches API data)
│   │   ├── page.tsx              # Main formation builder
│   │   ├── error.tsx             # Error page component
│   │   ├── loading.tsx           # Loading component
│   │   └── not-found.tsx         # 404 page component
│   ├── api/                      # API routes
│   │   └── ninjas/               # Ninjas data endpoint
│   │       └── route.ts          # Server-side ninja fetching
│   ├── layout.tsx                # Root layout with metadata
│   ├── globals.css               # Global styles with Tailwind v4
│   └── loading.tsx               # Root loading component
├── components/
│   │   ├── combos/               # Combo chain visualization page
│   │   │   └── page.tsx         # Combos viewer with dual view modes
│   │   ├── skills/               # Skills viewer page
│   │   │   └── page.tsx         # Skills viewer with ninja filter
│   │   ├── layout.tsx            # Locale layout (fetches API data)
│   │   ├── page.tsx              # Main formation builder
│   │   ├── error.tsx             # Error page component
│   │   ├── loading.tsx           # Loading component
│   │   └── not-found.tsx         # 404 page component
│   ├── api/                      # API routes
│   │   └── ninjas/               # Ninjas data endpoint
│   │       └── route.ts          # Server-side ninja fetching
│   ├── layout.tsx                # Root layout with metadata
│   ├── globals.css               # Global styles with Tailwind v4
│   └── loading.tsx               # Root loading component
├── components/
│   ├── formation/                # Formation-specific components
│   │   ├── header.tsx            # Shared navigation header
│   │   ├── stats-header.tsx      # Formation stats display
│   │   ├── formation-builder.tsx # Main formation UI orchestrator
│   │   ├── formation-grid.tsx    # 3x3 grid with drag-and-drop
│   │   ├── ninja-roster.tsx      # Ninja list with filters
│   │   ├── ninja-card.tsx        # Individual ninja card (roster)
│   │   ├── ninja-formation-card.tsx # Ninja card (formation slots)
│   │   └── ninja-skills-popover.tsx # Desktop hover skill popover
│   ├── combos/                   # Combos page components
│   │   ├── combo-chain.tsx       # Vertical combo step display
│   │   ├── horizontal-combo-chain.tsx # Horizontal anime-style layout
│   │   ├── improved-horizontal-combo-chain.tsx # Enhanced horizontal view
│   │   ├── improved-vertical-combo-chain.tsx # Enhanced vertical view
│   │   └── skill-popover.tsx     # Desktop hover skill detail popover
│   ├── skills/                   # Skills page components
│   │   ├── ninja-tab-selector.tsx # Ninja filter tabs
│   │   └── skill-card.tsx        # Detailed skill card component
│   ├── providers/                # Context providers
│   │   └── formation-provider.tsx # Global state provider
│   └── ui/                       # Reusable UI primitives
│       ├── input.tsx             # Form input components
│       ├── select.tsx            # Dropdown selection
│       ├── scroll-area.tsx       # Custom scrollable areas
│       ├── language-switcher.tsx # Language toggle component
│       └── error-boundary.tsx    # Error boundary component
├── hooks/                        # Custom React hooks
│   └── use-formation.ts          # Core formation business logic
├── lib/                          # Core business logic
│   ├── api/                      # Dual-mode API system
│   │   ├── index.ts              # Unified API interface (mode switcher)
│   │   ├── real-api.ts           # External API integration
│   │   ├── mock-api.ts           # Local mock data generation
│   │   ├── ninja-generator.ts    # Deterministic ninja generation
│   │   ├── combo-designer.ts     # Combo network design & validation
│   │   ├── demo-utils.ts         # Demo data utilities
│   │   ├── constants.ts          # Generation constants
│   │   └── __tests__/            # API validation tests
│   ├── combo-logic.ts            # Combo chain calculations
│   ├── data.ts                   # Static data and icon mappings
│   ├── types.ts                  # TypeScript type definitions
│   ├── utils.ts                  # Utility functions
│   ├── formation-layout.ts       # Configurable formation grid layout
│   ├── drag-state.ts             # Global drag & drop state management
│   ├── skill-mock-data.ts        # Mock skill data generation
│   ├── i18n.ts                   # Internationalization config
│   └── i18n-helpers.ts           # i18n helper functions
├── messages/                     # Translation files
│   ├── pt.json                   # Portuguese translations
│   └── zh.json                   # Chinese translations
├── i18n/                         # i18n configuration
│   └── request.ts                # next-intl request config
├── public/                       # Static assets
│   ├── skill-type/              # Skill type images
│   └── skins/                   # Ninja skin images
├── proxy.ts                      # next-intl middleware (exports 'proxy')
├── CLAUDE.md                     # Project documentation for Claude Code
├── package.json                  # Dependencies and scripts
├── tsconfig.json                 # TypeScript configuration
├── next.config.ts                # Next.js configuration
├── next-env.d.ts                 # Next.js TypeScript definitions
├── components.json               # Shadcn/ui configuration
└── *.json                        # Example API return files
```

## Tech Stack

### Core Framework
- **Next.js 16.1.6** - React framework with App Router
- **React 19.2.3** - UI library with full client-side rendering
- **TypeScript 5** - Type safety with strict mode

### Internationalization
- **next-intl 4.8.2** - Internationalization framework for Next.js
  - Locale-based routing (`/pt/`, `/zh/`)
  - Server and client components support
  - Type-safe translations
  - Pluralization and interpolation

### Styling & UI
- **Tailwind CSS v4** - Utility-first CSS with PostCSS plugin
- **@iconify/react 6.0.2** - Icon library (Solar icon set)
- **Class Variance Authority (CVA) 0.7.1** - Component variant patterns
- **clsx 2.1.1** - Conditional class name utility
- **tailwind-merge 3.4.0** - Tailwind class merging

### UI Primitives
- **Radix UI 1.4.3** - Headless UI components

### Development Tools
- **ESLint 9** - Code linting with Next.js configuration
- **Path Aliases** - `@/*` maps to project root
- **Shadcn/ui** - Component library with "new-york" style configuration

### Shadcn/ui Configuration

The project uses shadcn/ui with the following settings:
- **Style**: "new-york" (modern, clean design)
- **Icon Library**: lucide (note: project uses Solar icons via @iconify/react)
- **Path Aliases**: Configured for clean imports (@/components, @/lib)
- **CSS Variables**: Custom theme with OKLCH color space
- **Tailwind CSS v4**: Full integration with latest Tailwind features

## Architecture

### Data Flow

The application follows a unidirectional data flow pattern with internationalization support:

```
1. PROXY MIDDLEWARE (proxy.ts)
   next-intl middleware intercepts requests
   ├─ Detects locale from URL path
   ├─ Redirects to locale-prefixed URL if missing
   └─ Validated locales: ['pt', 'zh']
                    │
                    ▼
2. API SELECTION (lib/api/index.ts)
   fetchNinjas(locale) checks NEXT_PUBLIC_API_MODE
   ├─ 'real' → fetchRealNinjas(locale) (external API)
   └─ 'mock' → fetchMockNinjasCached() (local data)
                    │
                    ▼
3. DATA TRANSFORMATION
   Parse API response → Map to Ninja objects
   ├─ Element mapping (multi-language: PT/EN/DE)
   ├─ Role assignment (algorithmic)
   ├─ Effect parsing (triggers/chases)
   └─ Organization tagging
                    │
                    ▼
4. LOCALE LAYOUT (app/[locale]/layout.tsx)
   ├─ Loads translation messages (messages/{locale}.json)
   ├─ Wraps app with NextIntlClientProvider
   ├─ Fetches ninjas with locale context
   └─ Wraps app with FormationProvider
                    │
                    ▼
5. CONTEXT PROVIDER (components/providers/formation-provider.tsx)
   FormationProvider
   ├─ Receives ninjas array
   ├─ Creates React Context
   └─ Exposes useFormationContext()
                    │
                    ▼
6. CUSTOM HOOK (hooks/use-formation.ts)
   useFormation(ninjas)
   ├─ Manages formation state (9 slots)
   ├─ Calculates derived state (power, synergies)
   ├─ Handles actions (place, move, remove)
   └─ Returns state and actions
                    │
                    ▼
7. UI COMPONENTS (with i18n)
   ├─ FormationBuilder (app/[locale]/page.tsx)
   ├─ CombosViewer (app/[locale]/combos/page.tsx)
   └─ SkillsViewer (app/[locale]/skills/page.tsx)
        │
        ▼
   All components use useTranslations() hook for localized strings
```

### State Management

The application uses a **React Context + Custom Hooks** pattern (no Redux/Zustand):

**Architecture:**
```
FormationProvider (wraps app)
    ↓
useFormationContext() (access context)
    ↓
useFormation() (business logic hook)
    ↓
UI Components
```

**Key Patterns:**
- **Provider Pattern**: Single provider wraps entire application
- **Custom Hook**: `useFormation()` contains all business logic
- **Memoization**: Expensive calculations use `useMemo`
- **Immutable Updates**: Array/object spreading for state changes
- **Derived State**: Calculated values derived from formation state

**State Structure:**
```typescript
{
  formation: FormationSlot[],        // 9-slot array (Ninja | null)
  selectedNinjaId: number | null,    // Currently selected ninja
  totalPower: number,                // Sum of all powers (memoized)
  synergies: string[],               // Detected synergies (memoized)
  usedNinjaIds: Set<number>,         // IDs in formation (memoized)
  formationWithOrder: FormationSlotWithOrder[] // Visual ordering
}
```

### Component Architecture

The component system follows a clear hierarchy with separation of concerns:

**Component Layers:**

1. **UI Primitives** (`components/ui/`)
   - Reusable components built with CVA pattern
   - **Input**: Form input fields with variant support
   - **Select**: Dropdown selection with custom styling
   - **ScrollArea**: Custom scrollable areas with consistent styling
   - **LanguageSwitcher**: Language toggle component with dropdown
   - **ErrorBoundary**: Error boundary with fallback UI and reload button
   - Semantic data attributes for accessibility
   - Responsive design with mobile-first approach

2. **Domain Components** (`components/formation/`, `components/combos/`, `components/skills/`)
   - Feature-specific components
   - Business logic encapsulation
   - Drag-and-drop implementation

3. **Page Components** (`app/[locale]/`)
   - Main page orchestrators
   - Data fetching and composition
   - Layout and routing with locale support

4. **Provider Layer** (`components/providers/`)
   - Context providers for global state
   - Cross-component data sharing

## API Integration

### Dual-Mode API System

The application supports **two API modes** controlled by the `NEXT_PUBLIC_API_MODE` environment variable:

| Mode | Description | Environment Variable |
|------|-------------|---------------------|
| **Mock** (default) | Uses locally generated ninja data | `NEXT_PUBLIC_API_MODE=mock` or not set |
| **Real** | Uses external API from naruto.gamers-universe.eu | `NEXT_PUBLIC_API_MODE=real` |

### Mock Mode (Default)

**Features:**
- Generates 60 ninjas locally with deterministic random values
- Team 7 (Naruto, Sasuke, Sakura) guaranteed correct IDs (1, 2, 3)
- Combo network validated for healthy trigger/chase chains
- Uses real CDN image URLs for proper avatar display
- **No external API calls required** - works offline
- Instant loading with no network latency

**Implementation Files:**
- `lib/api/mock-api.ts` - Mock data orchestration
- `lib/api/ninja-generator.ts` - Deterministic ninja generation
- `lib/api/combo-designer.ts` - Combo effect assignment and validation
- `lib/api/constants.ts` - Generation data (names, villages, stats)

### Real Mode

**Features:**
- Fetches from `http://tazwanted-naruto.bh-games.com:1040/ninjas?lang={locale}`
- 1-hour Next.js cache revalidation (`next: { revalidate: 3600, tags: ['ninjas', 'ninjas-{locale}'] }`)
- Multi-language support (PT/EN/DE) for element mapping based on locale
- **Returns all available ninjas** (no slice limit)
- **Automatic fallback to demo data** if API fails or returns empty
- Graceful error handling with console logging
- **Note**: Combo chains limited in real mode (API doesn't provide trigger/chase effects, falls back to demo combos)

### API Route

**Location**: `app/api/ninjas/route.ts`

Server-side API endpoint that provides ninja data:
- Returns JSON with `ninjas` array and `error` field (if any)
- Accepts `locale` parameter for localized element mapping
- **Automatic fallback**: If real API fails, falls back to demo data
- **Cache management**: Supports cache clearing via URL params (`?clearCache=true`)
- Used by client components for dynamic data fetching

### Switching API Modes

**Using Mock Mode (Default):**
```bash
npm run dev
```

**Using Real API Mode:**

Create `.env.local`:
```bash
NEXT_PUBLIC_API_MODE=real
```

Then restart the dev server.

## Core Business Logic

### Formation Management

**Location**: `hooks/use-formation.ts`

| Function | Lines | Description |
|----------|-------|-------------|
| `handleSelectNinja(id)` | 10-12 | Toggles ninja selection in roster |
| `removeNinja(index)` | 38-44 | Removes ninja from formation |
| `placeNinjaAtSlot(ninjaId, slotIndex)` | 47-61 | Places ninja directly at specific slot |
| `moveNinjaToSlot(ninjaId, target, source)` | 64-109 | Handles roster-to-formation and slot-to-slot movement |

### Synergy Detection

**Location**: `hooks/use-formation.ts:115-155`

The `synergies` derived state detects:

1. **Complete rows**: All 3 slots filled
2. **Complete columns**: All 3 slots filled
3. **Element combos**: Same element in a row (e.g., all Vento)
4. **Role combos**: Same role in a column (e.g., all Ataque)
5. **Team 7 special**: IDs 1, 2, 3 together (Naruto, Sasuke, Sakura) → "+15% Stats"

```typescript
const synergies = useMemo(() => {
  const combos: string[] = [];

  // Check rows for completion and element matching
  grid.forEach((row, i) => {
    if (row.every(n => n !== null)) combos.push(`Linha ${i + 1} Completa`);
    checkLine(row, 'element', `Linha ${i + 1}`);
  });

  // Check columns for completion and role matching
  for (let c = 0; c < 3; c++) {
    const col = [grid[0][c], grid[1][c], grid[2][c]];
    if (col.every(n => n !== null)) combos.push(`Coluna ${c + 1} Completa`);
    checkLine(col, 'role', `Coluna ${c + 1}`);
  }

  // Team 7 bonus
  const team7Ids = [1, 2, 3];
  if (team7Ids.every(id => currentIds.includes(id))) {
    combos.push("🌟 Time 7 Reunido (+15% Stats)");
  }

  return combos;
}, [formation]);
```

### Combo System

**Location**: `lib/combo-logic.ts`

**Algorithm:**
1. Each ninja acts as "Starter" using Mystery Skill (outputs `triggers`)
2. Finds ninjas who `chase` those effects
3. Chaser outputs their `chasesGen` (or `triggers` as fallback)
4. Continues until no chases found or max depth reached
5. Returns `ComboChain[]` with steps and hit counts

**Effect States:**
- **Knockdown/Queda/Fallen**: Grounded state
- **Repulse/Repelimento**: Pushed back
- **High Float/Voo**: Launched high
- **Low Float/Flutuacao**: Low launch

**Combo Interfaces:**
```typescript
interface ComboStep {
  ninja: Ninja;
  action: string;          // "Esoterica" or "Perseguicao"
  trigger: string;         // Effect that triggered this step
  cause: string;           // Effect cause description
  skillId: string;         // Skill ID used
}

interface ComboChain {
  starter: Ninja;
  steps: ComboStep[];
  totalHits: number;       // Total hits in the combo chain
}
```

### Role Assignment

Roles are **mapped from API career field**:

```typescript
function mapCareer(careerName: string): RoleType {
  const normalized = careererName.trim().toLowerCase();

  const CAREER_MAP: Record<string, RoleType> = {
    'ninjutsu': 'Ataque',
    'taijutsu': 'Ataque',
    'genjutsu': 'Suporte',
    'buji': 'Ataque',
    'defense': 'Defesa',
    'defesa': 'Defesa',
    'support': 'Suporte',
    'suporte': 'Suporte',
    'attack': 'Ataque',
    'ataque': 'Ataque',
  };

  return CAREER_MAP[normalized] ?? 'Suporte';
}
```

### Multi-Language Support

Element mapping supports Portuguese, English, and German:

```typescript
function mapElement(szAttr: string): ElementType {
  const attr = szAttr.toLowerCase();
  if (attr.includes('agua') || attr.includes('water') || attr.includes('wasser'))
    return 'Agua';
  // ... similar for other elements
}
```

## UI/UX Design System

### Styling Approach

**Tailwind CSS v4 Features:**
- Custom theme configuration with CSS variables
- Dark mode support with `:is(.dark *)` custom variant
- OKLCH color space for better color consistency
- Semantic color tokens (background, foreground, primary, secondary, etc.)

**Design System:**
- **Color Palette**: Dark theme with neutral grays, accent colors for elements
- **Typography**: Inter font with consistent sizing hierarchy
- **Spacing**: Consistent padding/margins using Tailwind spacing scale
- **Border Radius**: Custom radius scale from sm to 4xl
- **Shadows**: Subtle shadows for depth (shadow-sm, shadow-lg)

**Visual Patterns:**

1. **Card-Based Layout**: Consistent card usage with rounded corners and subtle borders
2. **Gradient Backgrounds**: Used for combo headers and special sections
3. **Interactive States**: Hover effects, active states, and focus indicators
4. **Status Indicators**: Star ratings, power values, and role/element badges
5. **Empty States**: Clear messaging with dashed borders and neutral colors
6. **Animated Effects**: Chakra glow, particle animations, and smooth transitions

### Icon System

**Icon Libraries:**
- **@iconify/react** for icon management
- **Solar icon set** as the primary icon library
- **Material Design Icons (MDI)** for themed icons (e.g., `mdi:shuriken`)

**Icon Mappings** (`lib/data.ts`):
- **Elements**: Vento (wind), Raio (bolt), Terra (mountains), Fogo (flame), Agua (drop), Sombra (moon), Fisico (fist)
- **Roles**: Ataque (sword), Defesa (shield), Suporte (medical kit)

### Drag-and-Drop System

**Desktop Support:**
- HTML5 Drag and Drop API
- Custom drag images
- Visual feedback during drag operations
- Drop target highlighting

**Mobile Support:**
- Touch events with visual clones
- Image clones follow finger movement
- Global drag state management
- Cross-component communication via custom events

**Implementation:**
- Component-level event handlers for drag/drop
- Visual feedback with hover states and active indicators

### Responsive Design

**Mobile-First Approach:**
- Touch-friendly interactions
- Adaptive layouts for all screen sizes
- Grid layouts that adapt to screen size
- Conditional rendering based on screen size

**Breakpoints:**
- Mobile-first base styles
- `sm:` breakpoint for tablets
- `md:` and `lg:` for larger screens

## Advanced Systems

### Formation Layout System

**Location**: `lib/formation-layout.ts`

Provides a flexible, configurable system for positioning formation slots with absolute positioning:

**Key Features:**
- Individual slot positioning with x, y coordinates, width, and height
- Independent z-index control for layering
- Configurable container dimensions
- Merge function for custom layout overrides
- Default layout with proper perspective (front row larger, back row smaller)

**Configuration Interface:**
```typescript
interface FormationSlotConfig {
  x: string;      // Horizontal position
  y: string;      // Vertical position
  width: string;  // Slot width
  height: string; // Slot height
  zIndex?: number; // Layer order
}

interface FormationLayoutConfig {
  containerWidth: string;
  containerHeight: string;
  slots: {
    slot1: FormationSlotConfig;
    // ... slots 2-9
  };
}
```

**Layout Logic:**
- **Back row (slots 7, 4, 1)**: Smallest, positioned at y: 35px, zIndex: 6
- **Middle row (slots 8, 5, 2)**: Medium size, y: 90px, zIndex: 7
- **Front row (slots 9, 6, 3)**: Largest, y: 145px, zIndex: 8

### Global Drag State Management

**Location**: `lib/drag-state.ts`

Manages touch-based drag & drop operations using module-level state instead of sessionStorage:

**Why Module-Level State:**
- sessionStorage causes race conditions with multiple simultaneous access
- JSON parsing/stringifying on every touch event is expensive
- Touch drag & drop is inherently single-user
- Only one drag operation can happen at a time

**API:**
```typescript
interface DragItem {
  ninjaId?: string;        // ID of ninja being dragged
  sourceSlotIndex?: string; // Source slot index
  type: 'ninja' | 'slot';  // Drag source type
}

// Store drag data when drag starts
setDragData(data: DragItem | null): void

// Retrieve drag data during drop
getDragData(): DragItem | null

// Set global dragging flag
setIsDragging(isDragging: boolean): void

// Check if drag is in progress
getIsDragging(): boolean

// Clear after drop or cancel
clearDragData(): void
```

### Skill Mock Data System

**Location**: `lib/skill-mock-data.ts`

Generates realistic skill data for all ninjas with deterministic random values:

**Key Features:**
- Seeded random generation based on skill ID (deterministic)
- Element-based skill name templates
- Realistic stat ranges by skill type
- Auto-generated descriptions with highlighted effects
- Flattens all skills from all ninjas into single array

**Skill Type Templates:**

| Type | Templates | Cooldown | Chakra | Damage |
|------|-----------|----------|--------|--------|
| Mystery | `{Element}: Bola de {Element} Suprema` | 2-4 | 20-40 | 150-300 |
| Attack | `{Element}: Ataque Fluido` | 0 | 0 | 80-120 |
| Chase | `{Element}: Perseguição` | 0-1 | 0-20 | 50-100 |

**API:**
```typescript
interface SkillMockData {
  name: string;
  description: string;
  cooldown: number;
  chakra: number;
  battlefieldCooldown: number;
  damage: number;
  statusEffects: string[];
}

// Generate mock data for a single skill
generateMockData(
  skillId: string,
  skillType: 'mystery' | 'attack' | 'chase',
  ninja: Ninja
): SkillMockData

// Flatten all skills from all ninjas
flattenAllSkills(ninjas: Ninja[]): SkillWithMockData[]
```

### Skill Popover Component

**Location**: `components/formation/ninja-skills-popover.tsx`

Desktop-only hover popover for displaying ninja skills on formation cards:

**Key Features:**
- React Portal for proper z-index layering (z-index: 9999)
- Intelligent positioning based on mouse cursor
- Auto-adjusts to viewport bounds (prevents overflow)
- Shows all skills: Mystery, Attack, and Chase skills
- Displays skill icon, name, type, and description
- Highlights effects in green (`<green>effect</green>` syntax)
- Shows cooldown, chakra cost, and damage values
- Compact layout with custom scrollbar

**Positioning Logic:**
1. Positions to the right of mouse cursor
2. Shows below mouse if sufficient space, else above
3. Moves to left of mouse if would overflow right edge
4. Adjusts vertical position if would overflow top/bottom

**Media Query Detection:**
```typescript
const isDesktop = window.matchMedia('(hover: hover)').matches;
// Only renders on devices that support hover
```

## Type Definitions

**Location**: `lib/types.ts`

### Core Types

```typescript
// Element types with multi-language support
export type ElementType =
  | 'Vento'    // Wind
  | 'Raio'     // Lightning
  | 'Terra'    // Earth
  | 'Fogo'     // Fire
  | 'Agua'     // Water
  | 'Sombra'   // Shadow
  | 'Fisico';  // Physical

// Role types
export type RoleType = 'Ataque' | 'Defesa' | 'Suporte';

// Ninja statistics (using [min, max] tuples)
export interface NinjaStats {
  life: [number, number];      // Health Points range
  bodyAtk: [number, number];   // Body Attack range
  bodyDef: [number, number];   // Body Defense range
  ninjaAtk: [number, number];  // Ninja Attack range
  ninjaDef: [number, number];  // Ninja Defense range
}

// Main ninja entity
export interface Ninja {
  id: number;
  name: string;
  title: string;           // Ninja title/surname
  nameDisplay: string;     // Display name with title
  element: ElementType;
  career: RoleType;        // Role (uses 'career' field from API)
  power: number;
  stats: NinjaStats;
  level: number;           // Ninja level (default: 1)
  star: number;
  sex: number;             // Gender (0/1)
  village: string;
  properties: string[];    // Organizations and tags
  resistances: {
    fire: number;
    wind: number;
    thunder: number;
    soil: number;
    water: number;
  };
  img: string;
  triggers: string[];      // Effects output by Mystery Skill
  chases: string[];        // Effects that trigger chase skills
  chasesGen: string[];     // Effects generated by chase skills
  mysterySkillId: string;
  standardAttackId: string;
  chaseSkillIds: string[];
}

// Formation slot (can be empty)
export type FormationSlot = Ninja | null;

// Formation slot with visual ordering
export interface FormationSlotWithOrder {
  slotIndex: number;  // 0-8, position in formation array
  order: number;      // 1-based, visual display order
  ninja: Ninja;       // Ninja object (never null)
}

// Combo types
export interface ComboStep {
  ninja: Ninja;
  action: string;
  trigger: string;
  cause: string;
  skillId: string;
}

export interface ComboChain {
  starter: Ninja;
  steps: ComboStep[];
  totalHits: number;
}

// Formation slot data transfer object for API calls
export interface FormationSlotDTO {
  id: number;
  slotIndex: number;
}
```

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (http://localhost:3000)
npm run dev

# Production build
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Environment Configuration

### API Mode Selection

Create a `.env.local` file in the project root:

```bash
# Use mock data (default - no API calls, works offline)
NEXT_PUBLIC_API_MODE=mock

# OR use real external API
# NEXT_PUBLIC_API_MODE=real
```

### Available Environment Variables

| Variable | Values | Default | Description |
|----------|--------|---------|-------------|
| `NEXT_PUBLIC_API_MODE` | `mock` \| `real` | `mock` | API data source mode |

### Adding New Languages

To add a new language (e.g., English):

1. Update `lib/i18n.ts`:
```typescript
export const routing = defineRouting({
  locales: ['pt', 'zh', 'en'],  // Add 'en'
  defaultLocale: 'pt',
  localePrefix: 'always'
});
```

2. Create translation file: `messages/en.json`
3. Copy structure from `messages/pt.json` and translate strings
4. The language switcher will automatically include the new option

### Example Configurations

**Development with mock data (recommended for faster development):**
```bash
NEXT_PUBLIC_API_MODE=mock
```

**Production with real API:**
```bash
NEXT_PUBLIC_API_MODE=real
```

## Performance Optimizations

### Memoization

- **Derived State**: `totalPower`, `synergies`, `usedNinjaIds` use `useMemo`
- **Component Memoization**: Components memoized to prevent re-renders
- **Callback Memoization**: Event handlers memoized with `useCallback`

### Efficient Algorithms

- **Combo Calculations**: Optimized chain building with early termination
- **Synergy Detection**: Grid-based checks with minimal iterations
- **Filter Operations**: Efficient array filtering and matching

### Data Optimization

- **API Caching**: Next.js fetch caching for real API (1-hour revalidation)
- **Local Cache**: Mock data cached to avoid regeneration
- **Selective Updates**: Only affected components re-render on state changes

### Code Splitting

- **Dynamic Imports**: Components loaded as needed
- **Route-Based Splitting**: Automatic code splitting by Next.js

## Accessibility

### ARIA Attributes

- Semantic data attributes (`data-slot`, `data-variant`, `data-size`)
- ARIA labels for screen readers
- Proper heading hierarchy

### Keyboard Navigation

- Full keyboard support for interactions
- Logical focus flow
- Visible focus indicators

### Semantic HTML

- Proper HTML structure
- Button and link elements for actions
- Form labels and associations

### Screen Reader Support

- Descriptive text for icons
- ARIA descriptions for complex interactions
- Status announcements for dynamic changes

## Internationalization (i18n)

ShinobiBuild supports multi-language functionality using **next-intl**, enabling seamless localization for users across different regions.

### Supported Languages

| Language | Locale Code | Status |
|----------|-------------|--------|
| Portuguese | `pt` | Default language |
| Chinese | `zh` | Fully translated |

### Routing Structure

The app uses locale-based routing with the `next-intl` middleware:

- Default locale redirects: `/` → `/pt`
- Chinese version: `/zh`
- All routes include locale prefix: `/pt/combos`, `/zh/skills`

### Configuration Files

| File | Purpose |
|------|---------|
| `proxy.ts` | Route-level locale detection and redirection (exports 'proxy') |
| `lib/i18n.ts` | Routing configuration and navigation helpers |
| `i18n/request.ts` | Server-side request configuration |
| `messages/pt.json` | Portuguese translations |
| `messages/zh.json` | Chinese translations |

### Usage in Components

**Server Components:**
```typescript
import { getTranslations } from 'next-intl/server';

const t = await getTranslations('metadata');
const title = t('title');
```

**Client Components:**
```typescript
import { useTranslations } from 'next-intl';

const t = useTranslations('nav');
const ninjasLabel = t('ninjas'); // "Ninjas" or "忍者"
```

### Language Switcher

The `LanguageSwitcher` component (`components/ui/language-switcher.tsx`) provides:
- Dropdown to switch between available languages
- Maintains current route when changing locale
- Uses next-intl's `Link` and `usePathname` for proper navigation

### Adding New Translations

1. Add translation keys to `messages/pt.json` and `messages/zh.json`
2. Use the key in components: `t('namespace.key')`
3. Ensure consistency across all language files

### Translation Namespaces

The translations are organized by namespace:

| Namespace | Content |
|-----------|---------|
| `metadata` | Page title and description |
| `nav` | Navigation items |
| `filters` | Ninja filter labels |
| `elements` | Element types (Vento, Raio, etc.) |
| `roles` | Role types (Ataque, Defesa, Suporte) |
| `stats` | Stat labels (attack, defense, hp, etc.) |
| `skills` | Skills page translations |
| `combos` | Combos page translations |
| `formation` | Formation-related text |
| `languageSwitcher` | Language switcher labels |

## Advanced Systems

### Global Drag State Management

**Location**: `lib/drag-state.ts`

Manages touch-based drag & drop operations using module-level state instead of sessionStorage:

**Why Module-Level State:**
- sessionStorage causes race conditions with multiple simultaneous access
- JSON parsing/stringifying on every touch event is expensive
- Touch drag & drop is inherently single-user
- Only one drag operation can happen at a time

**API:**
```typescript
interface DragItem {
  ninjaId?: string;        // ID of ninja being dragged
  sourceSlotIndex?: string; // Source slot index
  type: 'ninja' | 'slot';  // Drag source type
}

// Store drag data when drag starts
setDragData(data: DragItem | null): void

// Retrieve drag data during drop
getDragData(): DragItem | null

// Set global dragging flag
setIsDragging(isDragging: boolean): void

// Check if drag is in progress
getIsDragging(): boolean

// Clear after drop or cancel
clearDragData(): void
```

### Skill Mock Data System

**Location**: `lib/skill-mock-data.ts`

Generates realistic skill data for all ninjas with deterministic random values:

**Key Features:**
- Seeded random generation based on skill ID (deterministic)
- Element-based skill name templates
- Realistic stat ranges by skill type
- Auto-generated descriptions with highlighted effects
- Flattens all skills from all ninjas into single array

**Skill Type Templates:**

| Type | Templates | Cooldown | Chakra | Damage |
|------|-----------|----------|--------|--------|
| Mystery | `{Element}: Bola de {Element} Suprema` | 2-4 | 20-40 | 150-300 |
| Attack | `{Element}: Ataque Fluido` | 0 | 0 | 80-120 |
| Chase | `{Element}: Perseguição` | 0-1 | 0-20 | 50-100 |

**API:**
```typescript
interface SkillMockData {
  name: string;
  description: string;
  cooldown: number;
  chakra: number;
  battlefieldCooldown: number;
  damage: number;
  statusEffects: string[];
}

// Generate mock data for a single skill
generateMockData(
  skillId: string,
  skillType: 'mystery' | 'attack' | 'chase',
  ninja: Ninja
): SkillMockData

// Flatten all skills from all ninjas
flattenAllSkills(ninjas: Ninja[]): SkillWithMockData[]
```

### Demo Data Utilities

**Location**: `lib/api/demo-utils.ts`

Utilities for creating demo ninja data and combo chains for testing and development:

**Functions:**
```typescript
// Create 6 demo ninjas with predefined names and attributes
createDemoNinjas(): Ninja[]

// Generate demo combo chains from a list of ninjas
createDemoChainsFromNinjas(ninjas: Ninja[]): ComboChain[]
```

**Demo Ninja Set:**
- 6 ninjas: Naruto, Sasuke, Sakura, Kakashi, Itachi, Madara
- All from Konoha village
- 5-star rating
- Different elements and roles
- Pre-configured triggers and chases for combo demonstrations

### Error Handling & Fallback

The application implements a robust error handling system:

**API Error Handling:**
- Real API failures trigger automatic fallback to demo data
- Locale-specific error handling with console logging
- Cache management with tag-based invalidation
- Support for manual cache clearing via URL params (`?clearCache=true`)

**Cache Management:**
- Tag-based cache invalidation: `['ninjas', 'ninjas-{locale}']`
- 1-hour revalidation: `next: { revalidate: 3600 }`
- Manual cache clearing utilities available

**Component-Level Error Handling:**
- Error Boundary component wraps the application
- Fallback UI with error display and reload button
- Console logging for debugging
- TypeScript strict mode enabled
- Null checks in derived state calculations
- Graceful degradation for missing data

### Data Limitations

- Real mode returns **all available ninjas** (no limit)
- Mock mode generates 60 ninjas by default
- Adjustable in `lib/api/ninja-generator.ts`

### Combo Effect Network

- Ensures every effect has at least one trigger and one chase
- Prevents orphaned effects (triggered but not chased)
- Validates combo chain viability in mock generation

### Team 7 Special Synergy

- Hardcoded special case for Naruto (ID: 1), Sasuke (ID: 2), Sakura (ID: 3)
- Returns special bonus message when all three are in formation
- Independent of other synergy checks

### Client-Side vs Server-Side Rendering

**Server Components:**
- `app/layout.tsx` - Root layout with metadata configuration
- `app/[locale]/layout.tsx` - Locale layout with data fetching and i18n provider
- Handle server-side data fetching and initial page load

**Client Components:**
- All page components (`app/[locale]/*/page.tsx`)
- All feature components in `components/`
- Full interactivity with drag-and-drop, state management, and real-time updates

### Locale-Aware Data Fetching

The `fetchNinjas` function accepts an optional `locale` parameter:
- Used for localized element mapping in real API mode
- Defaults to 'pt' if no locale provided
- Supports PT, EN, DE for API element translations and career mapping
- Enables consistent element naming across different locales
- API endpoint: `http://tazwanted-naruto.bh-games.com:1040/ninjas?lang={locale}`

## License

This project is open source and available for use.
