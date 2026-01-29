# Generator Share — Complete UI Specification

**Version:** 1.0
**Date:** January 29, 2026
**Platform:** Mobile-first responsive web app
**Stack:** SvelteKit + TailwindCSS

---

## Table of Contents

1. [Design Philosophy](#design-philosophy)
2. [Style Guide](#style-guide)
3. [Component Library](#component-library)
4. [Screen Specifications](#screen-specifications)
5. [Desktop Adaptations](#desktop-adaptations)
6. [Build Notes for Developers](#build-notes-for-developers)

---

## Design Philosophy

### Core Principles

1. **Utility over aesthetics** — This is emergency infrastructure, not a product launch
2. **Accessibility is non-negotiable** — Works for ages 8 to 88, low vision, motor difficulties
3. **Trust through transparency** — Every limitation is stated clearly, no fine print games
4. **Speed over delight** — Fast load, fast comprehension, fast action
5. **Calm over urgent** — Despite the emergency context, the UI should feel steady and reliable

### Anti-Patterns (Explicitly Avoid)

- Gradients, glassmorphism, shadows deeper than 2px
- Animations beyond simple fade (200ms max)
- Marketing language ("revolutionary," "seamless," "powered by AI")
- Illustrations, mascots, emojis in core UI
- Rounded corners beyond 8px
- Any payment UI or deposit amount suggestions

---

## Style Guide

### Typography

```css
/* System Font Stack */
--font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
               "Helvetica Neue", Arial, sans-serif;

/* Scale (mobile-first) */
--text-xs: 14px;     /* Legal text, timestamps */
--text-sm: 16px;     /* Secondary text, labels */
--text-base: 18px;   /* Body text - MINIMUM for readability */
--text-lg: 20px;     /* Card titles, emphasis */
--text-xl: 24px;     /* Section headers */
--text-2xl: 28px;    /* Page titles */
--text-3xl: 32px;    /* Home screen title */

/* Line Heights */
--leading-tight: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.75;

/* Font Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### Color Palette

```css
/* Neutrals - Primary UI */
--gray-50: #FAFAFA;   /* Page background */
--gray-100: #F5F5F5;  /* Card background, disabled */
--gray-200: #E5E5E5;  /* Borders, dividers */
--gray-300: #D4D4D4;  /* Disabled text, placeholders */
--gray-400: #A3A3A3;  /* Secondary text */
--gray-500: #737373;  /* Muted text */
--gray-600: #525252;  /* Body text */
--gray-700: #404040;  /* Headings */
--gray-800: #262626;  /* Primary text */
--gray-900: #171717;  /* High emphasis text */

/* Functional Colors */
--blue-600: #2563EB;  /* Primary action, links */
--blue-700: #1D4ED8;  /* Primary hover */
--blue-800: #1E40AF;  /* Primary pressed */

--green-600: #16A34A; /* Success, verified, completed */
--green-700: #15803D; /* Success hover */
--green-100: #DCFCE7; /* Success background */

--amber-500: #F59E0B; /* Warning, urgent flag */
--amber-600: #D97706; /* Warning hover */
--amber-100: #FEF3C7; /* Warning background */

--red-600: #DC2626;   /* Error, danger, critical safety */
--red-700: #B91C1C;   /* Error hover */
--red-100: #FEE2E2;   /* Error background */

/* Specific Use */
--safety-banner-bg: #FEE2E2;    /* Light red for CO warning */
--safety-banner-text: #991B1B;  /* Dark red */
--safety-banner-border: #FECACA;

--trust-badge-bg: #DBEAFE;      /* Light blue for verified */
--trust-badge-text: #1E40AF;
```

### Spacing Scale

```css
/* Base unit: 4px */
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
--space-12: 48px;
--space-16: 64px;

/* Component-specific */
--tap-target-min: 48px;      /* Minimum touch target */
--card-padding: 16px;
--page-padding-mobile: 16px;
--page-padding-desktop: 24px;
--section-gap: 24px;
--input-height: 48px;
```

### Border Radius

```css
--radius-sm: 4px;   /* Chips, small elements */
--radius-md: 6px;   /* Buttons, inputs */
--radius-lg: 8px;   /* Cards - MAXIMUM */
```

### Shadows

```css
/* Minimal shadows - only for elevation hints */
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-md: 0 2px 4px rgba(0, 0, 0, 0.1);
```

### Focus States

```css
/* Visible focus ring for accessibility */
--focus-ring: 0 0 0 3px rgba(37, 99, 235, 0.5);
```

---

## Component Library

### 1. Buttons

#### Primary Button
```
┌─────────────────────────────────┐
│      I have a generator         │
└─────────────────────────────────┘
```

**Specs:**
- Height: 56px (mobile), 48px (desktop)
- Padding: 16px 24px
- Background: --blue-600
- Text: white, --text-lg, --font-semibold
- Border-radius: --radius-md
- Full width on mobile

**States:**
- Default: bg-blue-600
- Hover: bg-blue-700
- Pressed: bg-blue-800
- Disabled: bg-gray-200, text-gray-400, cursor-not-allowed
- Focus: shadow-focus-ring

**Microcopy rules:**
- Action verbs only
- 3-4 words max
- No exclamation marks

#### Secondary Button
```
┌─────────────────────────────────┐
│           Browse all            │
└─────────────────────────────────┘
```

**Specs:**
- Height: 48px
- Border: 2px solid --gray-300
- Background: transparent
- Text: --gray-700, --text-base, --font-medium

**States:**
- Hover: border-gray-400, bg-gray-50
- Pressed: bg-gray-100
- Disabled: border-gray-200, text-gray-300

#### Danger Button
```
┌─────────────────────────────────┐
│           Cancel lend           │
└─────────────────────────────────┘
```

**Specs:**
- Same as secondary
- Border: 2px solid --red-600
- Text: --red-600

#### Text Button / Link
```
View safety checklist →
```

**Specs:**
- Text: --blue-600, --text-base
- Underline on hover
- No background

---

### 2. Cards

#### Listing Card
```
┌────────────────────────────────────────┐
│  OFFER                    East Nashville│
│                                        │
│  3,000 - 5,000 watts                   │
│  Gasoline · Portable                   │
│                                        │
│  Available until Feb 2                 │
│                                        │
│  ┌──────────┐  ┌──────────┐           │
│  │ ✓ Verified│  │ ★ 4 reviews│          │
│  └──────────┘  └──────────┘           │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │           Message                 │ │
│  └──────────────────────────────────┘ │
└────────────────────────────────────────┘
```

**Specs:**
- Background: white
- Border: 1px solid --gray-200
- Border-radius: --radius-lg
- Padding: --card-padding
- Shadow: --shadow-sm

**Layout:**
- Type badge (top left): OFFER or REQUEST
- Neighborhood (top right): text-gray-500
- Primary info: wattage range (text-lg, font-semibold)
- Secondary info: fuel type, generator type
- Availability/timeframe
- Trust badges row
- Action button

#### Request Card (Urgent Variant)
```
┌────────────────────────────────────────┐
│  REQUEST ⚠ URGENT          Germantown  │
│  ...                                   │
└────────────────────────────────────────┘
```

**Specs:**
- Left border: 4px solid --amber-500
- Urgent badge: amber background

---

### 3. Chips / Filter Tags

#### Filter Chip (Unselected)
```
┌────────────────┐
│  East Nashville │
└────────────────┘
```

**Specs:**
- Height: 36px
- Padding: 8px 12px
- Background: --gray-100
- Border: 1px solid --gray-200
- Border-radius: --radius-sm
- Text: --text-sm, --gray-700

#### Filter Chip (Selected)
```
┌────────────────┐
│ ✓ East Nashville│
└────────────────┘
```

**Specs:**
- Background: --blue-600
- Border: none
- Text: white

---

### 4. Trust Badges

#### Phone Verified
```
┌──────────────┐
│ ✓ Verified   │
└──────────────┘
```

**Specs:**
- Background: --trust-badge-bg
- Text: --trust-badge-text, --text-xs
- Padding: 4px 8px
- Border-radius: --radius-sm
- Icon: checkmark (inline)

#### Rating Badge
```
┌──────────────┐
│ ★ 4 reviews  │
└──────────────┘
```

**Specs:**
- Background: --gray-100
- Text: --gray-600, --text-xs

#### New Account Badge
```
┌──────────────┐
│   New user   │
└──────────────┘
```

**Specs:**
- Background: --amber-100
- Text: --amber-600, --text-xs

---

### 5. Banners

#### Safety Banner (Always Visible)
```
┌────────────────────────────────────────┐
│ ⚠ Never run a generator indoors or    │
│   in a garage. Carbon monoxide kills.  │
└────────────────────────────────────────┘
```

**Specs:**
- Background: --safety-banner-bg
- Border: 1px solid --safety-banner-border
- Text: --safety-banner-text, --text-sm, --font-medium
- Padding: 12px 16px
- Icon: warning triangle
- Position: sticky top (except Home where inline)
- Cannot be dismissed

#### Info Banner
```
┌────────────────────────────────────────┐
│ ℹ New accounts can post 1 listing at  │
│   a time.                              │
└────────────────────────────────────────┘
```

**Specs:**
- Background: --gray-100
- Border: 1px solid --gray-200
- Text: --gray-600

---

### 6. Form Inputs

#### Text Input
```
Neighborhood
┌────────────────────────────────────────┐
│ East Nashville                         │
└────────────────────────────────────────┘
```

**Specs:**
- Label: --text-sm, --gray-700, margin-bottom: 6px
- Input height: 48px
- Padding: 12px 16px
- Border: 2px solid --gray-300
- Border-radius: --radius-md
- Background: white
- Text: --text-base, --gray-800

**States:**
- Focus: border-blue-600, shadow-focus-ring
- Error: border-red-600
- Disabled: bg-gray-100, text-gray-400

#### Select / Dropdown
```
Wattage range
┌────────────────────────────────────────┐
│ 3,000 - 5,000 watts              ▼    │
└────────────────────────────────────────┘
```

**Specs:**
- Same as text input
- Chevron icon on right
- Native select on mobile for better UX

#### Checkbox
```
┌──┐
│ ✓│  I understand this app does not verify equipment
└──┘
```

**Specs:**
- Checkbox size: 24px × 24px (larger for touch)
- Border: 2px solid --gray-400
- Checked: bg-blue-600, border-blue-600, white checkmark
- Label: --text-base, --gray-700, margin-left: 12px
- Tap target: entire row

#### Toggle
```
┌─────────────────────────────┐
│ Urgent request        ○───● │
└─────────────────────────────┘
```

**Specs:**
- Track: 48px × 28px
- Thumb: 24px circle
- Off: track gray-300, thumb white
- On: track blue-600, thumb white

---

### 7. Status Indicators

#### Conversation Status Pill
```
┌──────────────┐
│  Proposed    │  Gray background
└──────────────┘

┌──────────────┐
│  Confirmed   │  Green background
└──────────────┘

┌──────────────┐
│  Completed   │  Blue background
└──────────────┘

┌──────────────┐
│  Cancelled   │  Red background (muted)
└──────────────┘
```

---

### 8. Message Bubbles

#### Sent Message
```
                    ┌─────────────────────┐
                    │ I can drop it off   │
                    │ tomorrow at 2pm     │
                    └─────────────────────┘
                                    2:34 PM
```

**Specs:**
- Background: --blue-600
- Text: white
- Border-radius: 16px 16px 4px 16px
- Max-width: 80%
- Align: right
- Timestamp: --text-xs, --gray-400

#### Received Message
```
┌─────────────────────┐
│ That works. I'm at  │
│ the corner of...    │
└─────────────────────┘
2:35 PM
```

**Specs:**
- Background: --gray-100
- Text: --gray-800
- Border-radius: 16px 16px 16px 4px
- Align: left

---

### 9. Empty States

**Specs:**
- Centered text
- Icon: simple, single-color, 48px
- Title: --text-lg, --gray-700
- Description: --text-base, --gray-500
- Action button if applicable

---

### 10. Modal / Bottom Sheet

**Specs:**
- Overlay: rgba(0, 0, 0, 0.5)
- Container: white, border-radius-lg on top corners
- Padding: 24px
- Max-height: 90vh
- Scrollable content area
- Close button: X in top right, 48px tap target

---

## Screen Specifications

---

### Screen 1: Home

**Purpose:** Entry point. Immediate clarity on what this is and what to do.

**Layout:**
```
┌────────────────────────────────────────┐
│                                        │
│          GENERATOR SHARE               │
│                                        │
│  Connect neighbors. No payments.       │
│  Use at your own risk.                 │
│                                        │
├────────────────────────────────────────┤
│ ⚠ Never run a generator indoors or    │
│   in a garage. Carbon monoxide kills.  │
├────────────────────────────────────────┤
│                                        │
│  ┌──────────────────────────────────┐ │
│  │                                  │ │
│  │     I have a generator           │ │
│  │                                  │ │
│  └──────────────────────────────────┘ │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │                                  │ │
│  │     I need a generator           │ │
│  │                                  │ │
│  └──────────────────────────────────┘ │
│                                        │
│           Browse all listings          │
│                                        │
├────────────────────────────────────────┤
│                                        │
│  ─────────────────────────────────    │
│                                        │
│  This site only connects people.       │
│  We do not verify users or equipment.  │
│  We are not responsible for any        │
│  transactions, meetups, or outcomes.   │
│                                        │
│  Terms of Use · Privacy Policy ·       │
│  Safety Checklist                      │
│                                        │
└────────────────────────────────────────┘
```

**Microcopy:**

| Element | Text |
|---------|------|
| Title | Generator Share |
| Subtitle | Connect neighbors. No payments. Use at your own risk. |
| Safety banner | Never run a generator indoors or in a garage. Carbon monoxide kills. |
| Primary button 1 | I have a generator |
| Primary button 2 | I need a generator |
| Secondary button | Browse all listings |
| Footer disclaimer | This site only connects people. We do not verify users or equipment. We are not responsible for any transactions, meetups, or outcomes. |
| Footer links | Terms of Use · Privacy Policy · Safety Checklist |

**Behavior:**
- "I have a generator" → Create Offer (if logged in) or Login prompt
- "I need a generator" → Create Request (if logged in) or Login prompt
- "Browse all listings" → Browse Offers (default tab)

---

### Screen 2: Browse Offers

**Purpose:** Find available generators to borrow.

**Layout:**
```
┌────────────────────────────────────────┐
│ ← Back              Available Generators│
├────────────────────────────────────────┤
│ ⚠ Never run a generator indoors...     │
├────────────────────────────────────────┤
│                                        │
│  Filters                               │
│  ┌────────┐ ┌─────────┐ ┌──────────┐  │
│  │All areas│ │All watts │ │ All fuel │  │
│  └────────┘ └─────────┘ └──────────┘  │
│                                        │
│  ○ List    ○ Map                       │
│                                        │
├────────────────────────────────────────┤
│                                        │
│  12 offers near you                    │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │ OFFER              East Nashville │ │
│  │                                  │ │
│  │ 3,000 - 5,000 watts              │ │
│  │ Gasoline · Portable              │ │
│  │                                  │ │
│  │ Available until Feb 2            │ │
│  │                                  │ │
│  │ ┌──────────┐ ┌──────────┐       │ │
│  │ │✓ Verified │ │★ 4 reviews│       │ │
│  │ └──────────┘ └──────────┘       │ │
│  │                                  │ │
│  │ ┌────────────────────────────┐  │ │
│  │ │         Message            │  │ │
│  │ └────────────────────────────┘  │ │
│  └──────────────────────────────────┘ │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │ OFFER                 Germantown │ │
│  │ ...                              │ │
│  └──────────────────────────────────┘ │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │ OFFER              The Nations   │ │
│  │ ...                              │ │
│  └──────────────────────────────────┘ │
│                                        │
└────────────────────────────────────────┘
```

**Filter Options:**

| Filter | Options |
|--------|---------|
| Area | All areas, East Nashville, Germantown, The Nations, 12 South, Sylvan Park, Inglewood, Madison, Donelson, Bellevue, Green Hills, Berry Hill, Antioch, Hermitage |
| Wattage | All wattages, Under 2,000W, 2,000 - 3,500W, 3,500 - 5,000W, 5,000 - 7,500W, 7,500W+ |
| Fuel | All fuel types, Gasoline, Propane, Dual fuel, Solar/battery |

**Empty State:**
```
┌────────────────────────────────────────┐
│                                        │
│              [icon: generator]         │
│                                        │
│     No offers in East Nashville        │
│     right now                          │
│                                        │
│     Try expanding your wattage range   │
│     or checking nearby neighborhoods.  │
│                                        │
│     ┌────────────────────────────┐    │
│     │    Clear all filters       │    │
│     └────────────────────────────┘    │
│                                        │
└────────────────────────────────────────┘
```

**Map View (Optional toggle):**
- Pins are fuzzed to 0.5-1 mile radius
- Info banner: "Locations are approximate. Exact address shared after confirming."
- Tap pin → shows card overlay
- Map should work but is not required; list is primary

---

### Screen 3: Browse Requests

**Purpose:** Find people who need generators (for lenders).

**Layout:**
Same as Browse Offers with these differences:

**Title:** People who need generators

**Additional filter:**
| Filter | Options |
|--------|---------|
| Urgency | All requests, Urgent only |

**Card differences:**
- Shows "REQUEST" badge instead of "OFFER"
- Urgent requests have amber left border and "⚠ URGENT" badge
- Shows: "Has fuel: Yes/No" and "Has cords: Yes/No"

**Empty State:**
```
┌────────────────────────────────────────┐
│                                        │
│              [icon: help hand]         │
│                                        │
│     No requests in this area           │
│     right now                          │
│                                        │
│     Check back later or expand         │
│     your search area.                  │
│                                        │
└────────────────────────────────────────┘
```

---

### Screen 4: Create Offer

**Purpose:** Post a generator for lending.

**Layout:**
```
┌────────────────────────────────────────┐
│ ← Cancel               Offer generator │
├────────────────────────────────────────┤
│ ⚠ Never run a generator indoors...     │
├────────────────────────────────────────┤
│                                        │
│  Generator type                        │
│  ┌──────────────────────────────────┐ │
│  │ Portable                     ▼   │ │
│  └──────────────────────────────────┘ │
│                                        │
│  Wattage range                         │
│  ┌──────────────────────────────────┐ │
│  │ 3,000 - 5,000 watts          ▼   │ │
│  └──────────────────────────────────┘ │
│                                        │
│  Fuel type                             │
│  ┌──────────────────────────────────┐ │
│  │ Gasoline                     ▼   │ │
│  └──────────────────────────────────┘ │
│                                        │
│  Your neighborhood                     │
│  ┌──────────────────────────────────┐ │
│  │ East Nashville               ▼   │ │
│  └──────────────────────────────────┘ │
│                                        │
│  Available until                       │
│  ┌──────────────────────────────────┐ │
│  │ February 5, 2026             ▼   │ │
│  └──────────────────────────────────┘ │
│                                        │
│  Notes (optional)                      │
│  ┌──────────────────────────────────┐ │
│  │ Pickup only. Can show you how   │ │
│  │ to start it.                     │ │
│  │                                  │ │
│  └──────────────────────────────────┘ │
│  50 characters remaining               │
│                                        │
├────────────────────────────────────────┤
│                                        │
│  ┌──┐                                 │
│  │  │  I understand this app does    │
│  └──┘  not provide, inspect, or      │
│        guarantee equipment. I am      │
│        lending at my own risk.        │
│                                        │
├────────────────────────────────────────┤
│                                        │
│  ┌──────────────────────────────────┐ │
│  │          Post offer              │ │
│  └──────────────────────────────────┘ │
│                                        │
└────────────────────────────────────────┘
```

**Field Options:**

| Field | Options |
|-------|---------|
| Generator type | Portable, Inverter, Standby, Other |
| Wattage range | Under 2,000W, 2,000 - 3,500W, 3,500 - 5,000W, 5,000 - 7,500W, 7,500 - 10,000W, 10,000W+ |
| Fuel type | Gasoline, Propane, Dual fuel (gas/propane), Solar/battery, Other |
| Neighborhood | [Same list as filters] |
| Available until | Date picker, default 7 days out |
| Notes | Text area, max 200 characters |

**Validation errors:**
- "Select a generator type"
- "Select a wattage range"
- "Select your neighborhood"
- "You must agree before posting"

**Rate limit message (for new accounts):**
```
┌────────────────────────────────────────┐
│ ℹ New accounts can post 1 listing at  │
│   a time. Complete a lend to post more.│
└────────────────────────────────────────┘
```

---

### Screen 5: Create Request

**Purpose:** Post a request for a generator.

**Layout:**
```
┌────────────────────────────────────────┐
│ ← Cancel             Request generator │
├────────────────────────────────────────┤
│ ⚠ Never run a generator indoors...     │
├────────────────────────────────────────┤
│                                        │
│  How much power do you need?           │
│  ┌──────────────────────────────────┐ │
│  │ 3,000 - 5,000 watts          ▼   │ │
│  └──────────────────────────────────┘ │
│  Not sure? A fridge + a few lights =   │
│  about 2,000W                          │
│                                        │
│  Your neighborhood                     │
│  ┌──────────────────────────────────┐ │
│  │ Germantown                   ▼   │ │
│  └──────────────────────────────────┘ │
│                                        │
│  When do you need it by?               │
│  ┌──────────────────────────────────┐ │
│  │ As soon as possible          ▼   │ │
│  └──────────────────────────────────┘ │
│                                        │
│  ┌───────────────────────────────────┐│
│  │ This is urgent            ○───●  ││
│  │ (Medical equipment, elderly,     ││
│  │  young children)                 ││
│  └───────────────────────────────────┘│
│                                        │
│  Do you have fuel?                     │
│  ┌────────┐  ┌────────┐               │
│  │  Yes   │  │   No   │               │
│  └────────┘  └────────┘               │
│                                        │
│  Do you have extension cords?          │
│  ┌────────┐  ┌────────┐               │
│  │  Yes   │  │   No   │               │
│  └────────┘  └────────┘               │
│                                        │
│  Notes (optional)                      │
│  ┌──────────────────────────────────┐ │
│  │ Need to keep insulin cold.       │ │
│  │                                  │ │
│  └──────────────────────────────────┘ │
│                                        │
├────────────────────────────────────────┤
│                                        │
│  ┌──┐                                 │
│  │  │  I understand this app does    │
│  └──┘  not provide, deliver, or      │
│        guarantee equipment. I am      │
│        borrowing at my own risk.      │
│                                        │
├────────────────────────────────────────┤
│                                        │
│  ┌──────────────────────────────────┐ │
│  │         Post request             │ │
│  └──────────────────────────────────┘ │
│                                        │
└────────────────────────────────────────┘
```

**Field Options:**

| Field | Options |
|-------|---------|
| Wattage | Under 2,000W, 2,000 - 3,500W, 3,500 - 5,000W, 5,000W+, Not sure |
| Timeframe | As soon as possible, Within 24 hours, Within 2-3 days, Flexible |
| Has fuel | Yes / No |
| Has cords | Yes / No |

**Urgent flag helper text:** "Only use if someone's health or safety depends on power."

---

### Screen 6: Listing Details

**Purpose:** Full view of an offer or request before messaging.

**Layout:**
```
┌────────────────────────────────────────┐
│ ← Back                   Listing details│
├────────────────────────────────────────┤
│ ⚠ Never run a generator indoors...     │
├────────────────────────────────────────┤
│                                        │
│  OFFER                                 │
│                                        │
│  3,000 - 5,000 watts                   │
│  Gasoline · Portable                   │
│                                        │
│  ─────────────────────────────────    │
│                                        │
│  Neighborhood                          │
│  East Nashville (approximate)          │
│                                        │
│  Available until                       │
│  February 5, 2026                      │
│                                        │
│  Notes                                 │
│  Pickup only. Can show you how to      │
│  start it. Must return with full tank. │
│                                        │
│  ─────────────────────────────────    │
│                                        │
│  Posted by                             │
│  ┌──────────────────────────────────┐ │
│  │  [avatar]  Sarah M.              │ │
│  │            ┌──────────┐          │ │
│  │            │✓ Verified │          │ │
│  │            └──────────┘          │ │
│  │            ★ 4 positive reviews  │ │
│  │            Member since Jan 2026 │ │
│  └──────────────────────────────────┘ │
│                                        │
├────────────────────────────────────────┤
│                                        │
│  ┌──────────────────────────────────┐ │
│  │           Message                │ │
│  └──────────────────────────────────┘ │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │       Report this listing        │ │
│  └──────────────────────────────────┘ │
│                                        │
└────────────────────────────────────────┘
```

**For Requests, also show:**
- "Has fuel: Yes" or "Has fuel: No"
- "Has cords: Yes" or "Has cords: No"
- Urgent badge if applicable

---

### Screen 7: Conversation

**Purpose:** Message between lender and borrower, manage lend status.

**Layout:**
```
┌────────────────────────────────────────┐
│ ← Back                    Conversation │
├────────────────────────────────────────┤
│ ⚠ Never run a generator indoors...     │
├────────────────────────────────────────┤
│                                        │
│  ┌──────────────────────────────────┐ │
│  │ 3,000-5,000W · Gasoline         │ │
│  │ East Nashville                   │ │
│  │                                  │ │
│  │ ┌──────────┐                    │ │
│  │ │ Proposed │                    │ │
│  │ └──────────┘                    │ │
│  └──────────────────────────────────┘ │
│                                        │
├────────────────────────────────────────┤
│                                        │
│  ┌─────────────────────┐              │
│  │ Hi, I saw your      │              │
│  │ request. I can lend │              │
│  │ my generator...     │              │
│  └─────────────────────┘              │
│  Jan 29, 2:34 PM                       │
│                                        │
│                    ┌─────────────────┐ │
│                    │ That would be   │ │
│                    │ great! Can I    │ │
│                    │ pick it up?     │ │
│                    └─────────────────┘ │
│                          Jan 29, 2:35 PM│
│                                        │
│  ┌─────────────────────┐              │
│  │ Yes. I'm near the   │              │
│  │ Kroger on Gallatin. │              │
│  │ Text me when close. │              │
│  └─────────────────────┘              │
│  Jan 29, 2:36 PM                       │
│                                        │
│                                        │
│                                        │
├────────────────────────────────────────┤
│                                        │
│  ┌──────────────────────────────────┐ │
│  │  Share exact address             │ │
│  └──────────────────────────────────┘ │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │  Confirm lend                    │ │
│  └──────────────────────────────────┘ │
│                                        │
├────────────────────────────────────────┤
│ ┌────────────────────────────────┐    │
│ │ Type a message...              │ ➤  │
│ └────────────────────────────────┘    │
└────────────────────────────────────────┘
```

**Status-dependent actions:**

| Status | Primary Action | Secondary Actions |
|--------|---------------|-------------------|
| Proposed | Confirm lend | Share exact address, Cancel |
| Confirmed | Mark completed | Share exact address, Cancel lend |
| Completed | Leave review | (none) |
| Cancelled | (none) | (archived view) |

**Share exact address prompt:**
```
┌────────────────────────────────────────┐
│                                        │
│  Share your address?                   │
│                                        │
│  This will send your exact address     │
│  to this person. This app is not       │
│  responsible for meetups.              │
│                                        │
│  ┌────────────────────────────────┐   │
│  │ 1234 Main St, Nashville        │   │
│  │ TN 37206                       │   │
│  └────────────────────────────────┘   │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │         Share address            │ │
│  └──────────────────────────────────┘ │
│                                        │
│           Cancel                       │
│                                        │
└────────────────────────────────────────┘
```

---

### Screen 8: Confirm Flow

**Purpose:** Final checklist before confirming a lend.

**Layout:**
```
┌────────────────────────────────────────┐
│                     Confirm this lend  │
├────────────────────────────────────────┤
│                                        │
│  Before confirming, make sure you've   │
│  agreed on these details:              │
│                                        │
│  ┌──┐                                 │
│  │  │  Pickup plan (where, when)      │
│  └──┘                                 │
│                                        │
│  ┌──┐                                 │
│  │  │  Return time                    │
│  └──┘                                 │
│                                        │
│  ┌──┐                                 │
│  │  │  Fuel expectations (who        │
│  └──┘     provides, return full?)     │
│                                        │
│  ─────────────────────────────────    │
│                                        │
│  ┌──┐                                 │
│  │  │  Any deposit is handled        │
│  └──┘     privately between us.       │
│           This app is not involved.   │
│                                        │
│  ─────────────────────────────────    │
│                                        │
│  ⚠ SAFETY ACKNOWLEDGEMENT             │
│                                        │
│  ┌──┐                                 │
│  │  │  I will NEVER run a generator  │
│  └──┘     indoors or in a garage.     │
│           Carbon monoxide is deadly   │
│           and odorless.               │
│                                        │
├────────────────────────────────────────┤
│                                        │
│  ┌──────────────────────────────────┐ │
│  │         Confirm lend             │ │
│  └──────────────────────────────────┘ │
│                                        │
│           Cancel                       │
│                                        │
└────────────────────────────────────────┘
```

**Validation:**
- All 5 checkboxes required
- If any unchecked: "Check all boxes to confirm"
- CO acknowledgement checkbox has red border until checked

**Success state:**
```
┌────────────────────────────────────────┐
│                                        │
│              ✓                         │
│                                        │
│     Lend confirmed                     │
│                                        │
│     Good luck! Remember to mark this   │
│     as completed when you're done.     │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │     Back to conversation         │ │
│  └──────────────────────────────────┘ │
│                                        │
└────────────────────────────────────────┘
```

---

### Screen 9: Safety Checklist

**Purpose:** Education about generator safety.

**Layout:**
```
┌────────────────────────────────────────┐
│ ← Back                  Safety Checklist│
├────────────────────────────────────────┤
│                                        │
│  Generator Safety                      │
│                                        │
│  ⚠ CARBON MONOXIDE KILLS               │
│                                        │
│  Carbon monoxide (CO) is an odorless,  │
│  colorless gas. You cannot smell it.   │
│  Every year, people die from running   │
│  generators in enclosed spaces.        │
│                                        │
│  ─────────────────────────────────    │
│                                        │
│  ✓ ALWAYS run generators outdoors      │
│                                        │
│  ✗ NEVER in a garage, even with        │
│    the door open                       │
│                                        │
│  ✗ NEVER in a basement or crawlspace   │
│                                        │
│  ✗ NEVER near windows, doors, or       │
│    vents where exhaust can enter       │
│                                        │
│  ─────────────────────────────────    │
│                                        │
│  Keep generator at least 20 feet       │
│  from any structure.                   │
│                                        │
│  ─────────────────────────────────    │
│                                        │
│  OTHER SAFETY TIPS                     │
│                                        │
│  • Let generator cool before           │
│    refueling                           │
│                                        │
│  • Store fuel in approved containers   │
│    away from living areas              │
│                                        │
│  • Use heavy-duty outdoor-rated        │
│    extension cords                     │
│                                        │
│  • Never plug a generator directly     │
│    into a wall outlet (backfeed)       │
│                                        │
│  • Install battery-operated CO         │
│    detectors in your home              │
│                                        │
│  ─────────────────────────────────    │
│                                        │
│  IN AN EMERGENCY                       │
│                                        │
│  If you feel dizzy, weak, or nauseous  │
│  near a generator:                     │
│                                        │
│  1. Get to fresh air immediately       │
│  2. Call 911                           │
│  3. Do not re-enter the area           │
│                                        │
│  Nashville Poison Control:             │
│  1-800-222-1222                        │
│                                        │
└────────────────────────────────────────┘
```

---

### Screen 10: Terms of Use

**Purpose:** Legal disclaimer and rules.

**Layout:**
```
┌────────────────────────────────────────┐
│ ← Back                    Terms of Use │
├────────────────────────────────────────┤
│                                        │
│  Last updated: January 29, 2026        │
│                                        │
│  ─────────────────────────────────    │
│                                        │
│  WHAT THIS SERVICE IS                  │
│                                        │
│  Generator Share is a free platform    │
│  that connects people who have         │
│  generators with people who need       │
│  them during power outages.            │
│                                        │
│  ─────────────────────────────────    │
│                                        │
│  WHAT THIS SERVICE IS NOT              │
│                                        │
│  We do not:                            │
│  • Verify users' identities            │
│  • Inspect equipment                   │
│  • Guarantee equipment works           │
│  • Facilitate or process payments      │
│  • Deliver equipment                   │
│  • Provide fuel                        │
│  • Provide electrical advice           │
│  • Supervise meetups                   │
│  • Guarantee any transaction           │
│                                        │
│  ─────────────────────────────────    │
│                                        │
│  YOUR RESPONSIBILITIES                 │
│                                        │
│  By using this service, you agree to:  │
│                                        │
│  • Provide accurate information        │
│  • Communicate honestly                │
│  • Handle any deposits or payments     │
│    privately and directly              │
│  • Follow all generator safety         │
│    guidelines                          │
│  • Take full responsibility for your   │
│    own safety and property             │
│  • Not hold Generator Share liable     │
│    for any damages, injuries, or       │
│    disputes                            │
│                                        │
│  ─────────────────────────────────    │
│                                        │
│  PROHIBITED USES                       │
│                                        │
│  You may not:                          │
│  • Post false or misleading listings   │
│  • Harass other users                  │
│  • Use the platform for commercial     │
│    generator rental businesses         │
│  • Attempt to collect payment through  │
│    this platform                       │
│                                        │
│  ─────────────────────────────────    │
│                                        │
│  LIMITATION OF LIABILITY               │
│                                        │
│  Generator Share is provided "as is"   │
│  with no warranties. We are not        │
│  responsible for any injury, death,    │
│  property damage, theft, disputes,     │
│  or any other outcome arising from     │
│  your use of this service.             │
│                                        │
│  USE AT YOUR OWN RISK.                 │
│                                        │
└────────────────────────────────────────┘
```

---

### Screen 11: Privacy Policy

**Purpose:** Explain data practices.

**Layout:**
```
┌────────────────────────────────────────┐
│ ← Back                  Privacy Policy │
├────────────────────────────────────────┤
│                                        │
│  Last updated: January 29, 2026        │
│                                        │
│  ─────────────────────────────────    │
│                                        │
│  WHAT WE COLLECT                       │
│                                        │
│  • Phone number (for verification)     │
│  • Neighborhood (not exact address)    │
│  • Listing information you provide     │
│  • Messages between users              │
│                                        │
│  ─────────────────────────────────    │
│                                        │
│  WHAT WE DON'T COLLECT                 │
│                                        │
│  • Payment information                 │
│  • Social security numbers             │
│  • Government ID                       │
│                                        │
│  ─────────────────────────────────    │
│                                        │
│  HOW WE PROTECT YOUR ADDRESS           │
│                                        │
│  • Your exact address is never shown   │
│    publicly                            │
│  • Listings only show your             │
│    neighborhood                        │
│  • Map pins are fuzzed to a 0.5-1      │
│    mile radius                         │
│  • Exact address is only shared when   │
│    you explicitly choose to send it    │
│    in a private message                │
│                                        │
│  ─────────────────────────────────    │
│                                        │
│  DATA RETENTION                        │
│                                        │
│  • Listings expire automatically       │
│  • You can delete your account and     │
│    data at any time                    │
│  • We do not sell your data            │
│                                        │
│  ─────────────────────────────────    │
│                                        │
│  CONTACT                               │
│                                        │
│  Questions? Email:                     │
│  privacy@generatorshare.org            │
│                                        │
└────────────────────────────────────────┘
```

---

### Screen 12: Profile

**Purpose:** User's own profile, trust signals, and settings.

**Layout:**
```
┌────────────────────────────────────────┐
│ ← Back                      Your Profile│
├────────────────────────────────────────┤
│                                        │
│  ┌──────────────────────────────────┐ │
│  │                                  │ │
│  │  [avatar]                        │ │
│  │                                  │ │
│  │  Sarah M.                        │ │
│  │  Member since January 2026       │ │
│  │                                  │ │
│  └──────────────────────────────────┘ │
│                                        │
│  ─────────────────────────────────    │
│                                        │
│  VERIFICATION                          │
│                                        │
│  ┌──────────┐                         │
│  │✓ Verified │  Phone verified        │
│  └──────────┘                         │
│                                        │
│  ─────────────────────────────────    │
│                                        │
│  YOUR REPUTATION                       │
│                                        │
│  ★ 4 positive reviews                  │
│  0 negative reviews                    │
│                                        │
│  "Quick and helpful. Generator         │
│   worked great." — Jan 28              │
│                                        │
│  "Easy pickup. Thanks!" — Jan 27       │
│                                        │
│  ─────────────────────────────────    │
│                                        │
│  YOUR LISTINGS                         │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │ OFFER · Active                   │ │
│  │ 3,000-5,000W · East Nashville    │ │
│  │ Edit · Remove                    │ │
│  └──────────────────────────────────┘ │
│                                        │
│  ─────────────────────────────────    │
│                                        │
│  YOUR CONVERSATIONS                    │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │ With: Mike R.                    │ │
│  │ Status: Confirmed                │ │
│  │ View conversation →              │ │
│  └──────────────────────────────────┘ │
│                                        │
│  ─────────────────────────────────    │
│                                        │
│  SETTINGS                              │
│                                        │
│  Edit profile                          │
│  Change phone number                   │
│  Delete account                        │
│                                        │
│  ─────────────────────────────────    │
│                                        │
│  Log out                               │
│                                        │
└────────────────────────────────────────┘
```

**Empty states:**

No listings:
```
You don't have any active listings.
Post an offer or request to get started.
```

No reviews:
```
No reviews yet. Complete a lend to
receive your first review.
```

---

### Screen 13: Report User Flow

**Purpose:** Flag problematic users or listings.

**Layout:**
```
┌────────────────────────────────────────┐
│ ← Cancel                        Report │
├────────────────────────────────────────┤
│                                        │
│  Report this user or listing           │
│                                        │
│  What's the problem?                   │
│                                        │
│  ○ Spam or fake listing                │
│                                        │
│  ○ Harassment or threats               │
│                                        │
│  ○ Asking for payment through app      │
│                                        │
│  ○ No-show or dishonest                │
│                                        │
│  ○ Safety concern                      │
│                                        │
│  ○ Other                               │
│                                        │
│  ─────────────────────────────────    │
│                                        │
│  Details (optional)                    │
│  ┌──────────────────────────────────┐ │
│  │                                  │ │
│  │                                  │ │
│  └──────────────────────────────────┘ │
│                                        │
│  ─────────────────────────────────    │
│                                        │
│  ┌──┐                                 │
│  │  │  Also block this user          │
│  └──┘                                 │
│                                        │
├────────────────────────────────────────┤
│                                        │
│  ┌──────────────────────────────────┐ │
│  │         Submit report            │ │
│  └──────────────────────────────────┘ │
│                                        │
└────────────────────────────────────────┘
```

**Success state:**
```
┌────────────────────────────────────────┐
│                                        │
│              ✓                         │
│                                        │
│     Report submitted                   │
│                                        │
│     We'll review this within 24 hours. │
│     Thanks for helping keep the        │
│     community safe.                    │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │            Done                  │ │
│  └──────────────────────────────────┘ │
│                                        │
└────────────────────────────────────────┘
```

---

### Screen 14: Admin Moderation

**Purpose:** Basic moderation dashboard (internal only).

**Layout:**
```
┌────────────────────────────────────────┐
│  Generator Share Admin                 │
├────────────────────────────────────────┤
│                                        │
│  ┌────────────────────────────────┐   │
│  │ Reports │ Listings │ Users     │   │
│  └────────────────────────────────┘   │
│                                        │
├────────────────────────────────────────┤
│                                        │
│  PENDING REPORTS (7)                   │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │ Report #142                      │ │
│  │ Type: Harassment                 │ │
│  │ Reported: Jan 29, 3:15 PM        │ │
│  │                                  │ │
│  │ Reported user: user_abc123       │ │
│  │ Reporter: user_xyz789            │ │
│  │                                  │ │
│  │ Details: "Sent threatening       │ │
│  │ messages when I couldn't meet    │ │
│  │ at the time they wanted..."      │ │
│  │                                  │ │
│  │ ┌─────────┐ ┌─────────┐         │ │
│  │ │ Dismiss │ │ Warn user│         │ │
│  │ └─────────┘ └─────────┘         │ │
│  │ ┌─────────┐ ┌─────────┐         │ │
│  │ │ Ban user│ │ View msgs│         │ │
│  │ └─────────┘ └─────────┘         │ │
│  └──────────────────────────────────┘ │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │ Report #141                      │ │
│  │ Type: Spam                       │ │
│  │ ...                              │ │
│  └──────────────────────────────────┘ │
│                                        │
├────────────────────────────────────────┤
│                                        │
│  STATS                                 │
│                                        │
│  Active offers: 47                     │
│  Active requests: 89                   │
│  Confirmed lends today: 23             │
│  Completed lends total: 156            │
│                                        │
└────────────────────────────────────────┘
```

---

### Additional Screens

#### Login / Phone Verification

```
┌────────────────────────────────────────┐
│                     Verify your phone  │
├────────────────────────────────────────┤
│                                        │
│  Enter your phone number to continue.  │
│  We'll send a code to verify it's you. │
│                                        │
│  Phone number                          │
│  ┌──────────────────────────────────┐ │
│  │ (615) 555-0123                   │ │
│  └──────────────────────────────────┘ │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │         Send code                │ │
│  └──────────────────────────────────┘ │
│                                        │
│  ─────────────────────────────────    │
│                                        │
│  By continuing, you agree to our       │
│  Terms of Use and Privacy Policy.      │
│                                        │
└────────────────────────────────────────┘
```

#### Enter Code

```
┌────────────────────────────────────────┐
│ ← Back                     Enter code  │
├────────────────────────────────────────┤
│                                        │
│  We sent a code to (615) 555-0123      │
│                                        │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐│
│  │  4 │ │  7 │ │  2 │ │  _ │ │  _ │ │  _ ││
│  └────┘ └────┘ └────┘ └────┘ └────┘ └────┘│
│                                        │
│  Didn't get the code?                  │
│  Resend code (available in 30s)        │
│                                        │
└────────────────────────────────────────┘
```

**Error states:**
- "Invalid code. Try again."
- "Too many attempts. Wait 15 minutes."

#### Leave Review (Post-completion)

```
┌────────────────────────────────────────┐
│                      Leave a review    │
├────────────────────────────────────────┤
│                                        │
│  How was your experience with          │
│  Sarah M.?                             │
│                                        │
│  ┌─────────────────┐ ┌─────────────────┐│
│  │                 │ │                 ││
│  │     👍          │ │     👎          ││
│  │                 │ │                 ││
│  │   Positive      │ │   Negative      ││
│  └─────────────────┘ └─────────────────┘│
│                                        │
│  Short comment (optional)              │
│  ┌──────────────────────────────────┐ │
│  │ Quick and helpful.               │ │
│  └──────────────────────────────────┘ │
│  50 characters max                     │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │        Submit review             │ │
│  └──────────────────────────────────┘ │
│                                        │
│           Skip for now                 │
│                                        │
└────────────────────────────────────────┘
```

---

## Desktop Adaptations

### Principles

1. **Same information, more breathing room** — Don't add features, just space
2. **Max content width: 640px** — Prevent line lengths from becoming unreadable
3. **Centered single column** — No sidebars or complex layouts
4. **Larger touch targets stay large** — Desktop users benefit from big buttons too

### Layout Changes

| Screen | Mobile | Desktop |
|--------|--------|---------|
| Home | Full-width buttons | Centered, max-width 400px buttons |
| Browse | Single column cards | Two-column card grid, 320px each |
| Listing details | Full width | Centered, max-width 640px |
| Conversation | Full width | Centered, max-width 640px |
| Forms | Full width | Centered, max-width 480px |
| Safety/Legal | Full width | Centered, max-width 720px for readability |

### Breakpoints

```css
/* Mobile-first */
@media (min-width: 640px) {  /* sm - tablet */
  /* Increase page padding */
  /* Center content */
}

@media (min-width: 768px) {  /* md - small desktop */
  /* Two-column browse grid */
}

@media (min-width: 1024px) { /* lg - desktop */
  /* Max-width containers */
  /* Slightly larger text if needed */
}
```

### Desktop Header

```
┌──────────────────────────────────────────────────────────────────┐
│  Generator Share              Browse    Safety    Your Profile   │
└──────────────────────────────────────────────────────────────────┘
```

- Simple horizontal nav on desktop
- Collapses to hamburger on mobile
- No fancy mega-menus

---

## Build Notes for Developers

### Recommended Stack

- **Framework:** SvelteKit
- **Styling:** TailwindCSS with custom config
- **Component library:** Build from scratch (simple enough)
- **Icons:** Heroicons (outline style) or Lucide
- **Forms:** Native HTML with progressive enhancement

### Tailwind Configuration

```javascript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto',
               'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      fontSize: {
        'xs': '14px',
        'sm': '16px',
        'base': '18px',
        'lg': '20px',
        'xl': '24px',
        '2xl': '28px',
        '3xl': '32px',
      },
      colors: {
        // Add custom colors from style guide
      },
      spacing: {
        // 4px base already default in Tailwind
      },
      borderRadius: {
        'sm': '4px',
        'DEFAULT': '6px',
        'lg': '8px',
      },
      minHeight: {
        'touch': '48px',
      },
    },
  },
  plugins: [],
}
```

### Component Structure

```
src/
├── lib/
│   ├── components/
│   │   ├── Button.svelte
│   │   ├── Card.svelte
│   │   ├── ListingCard.svelte
│   │   ├── Chip.svelte
│   │   ├── Badge.svelte
│   │   ├── Input.svelte
│   │   ├── Select.svelte
│   │   ├── Checkbox.svelte
│   │   ├── Toggle.svelte
│   │   ├── SafetyBanner.svelte
│   │   ├── InfoBanner.svelte
│   │   ├── Modal.svelte
│   │   ├── MessageBubble.svelte
│   │   ├── StatusPill.svelte
│   │   ├── EmptyState.svelte
│   │   └── PageHeader.svelte
│   ├── stores/
│   │   ├── auth.js
│   │   ├── listings.js
│   │   └── conversations.js
│   └── utils/
│       ├── validation.js
│       └── formatters.js
├── routes/
│   ├── +page.svelte              // Home
│   ├── +layout.svelte            // Global layout + safety banner
│   ├── browse/
│   │   ├── offers/+page.svelte
│   │   └── requests/+page.svelte
│   ├── create/
│   │   ├── offer/+page.svelte
│   │   └── request/+page.svelte
│   ├── listing/
│   │   └── [id]/+page.svelte
│   ├── conversation/
│   │   └── [id]/+page.svelte
│   ├── profile/+page.svelte
│   ├── safety/+page.svelte
│   ├── terms/+page.svelte
│   ├── privacy/+page.svelte
│   └── login/+page.svelte
```

### Key Component Examples

#### Button.svelte
```svelte
<script>
  export let variant = 'primary'; // primary | secondary | danger | text
  export let size = 'default'; // default | small
  export let disabled = false;
  export let fullWidth = true;
</script>

<button
  class="
    font-medium rounded transition-colors
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    {fullWidth ? 'w-full' : ''}
    {size === 'default' ? 'h-14 md:h-12 px-6 text-lg' : 'h-10 px-4 text-base'}
    {variant === 'primary' ? 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800' : ''}
    {variant === 'secondary' ? 'border-2 border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50' : ''}
    {variant === 'danger' ? 'border-2 border-red-600 bg-transparent text-red-600 hover:bg-red-50' : ''}
    {variant === 'text' ? 'text-blue-600 hover:underline' : ''}
  "
  {disabled}
  on:click
>
  <slot />
</button>
```

#### SafetyBanner.svelte
```svelte
<div class="bg-red-100 border border-red-200 px-4 py-3 sticky top-0 z-10">
  <p class="text-red-800 text-sm font-medium flex items-center gap-2">
    <svg class="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
      <!-- Warning triangle icon -->
    </svg>
    <span>Never run a generator indoors or in a garage. Carbon monoxide kills.</span>
  </p>
</div>
```

#### ListingCard.svelte
```svelte
<script>
  export let listing;
  // listing: { type, neighborhood, wattageRange, fuelType, generatorType,
  //            availableUntil, user, urgent }
</script>

<article class="bg-white border border-gray-200 rounded-lg p-4 shadow-sm
               {listing.urgent ? 'border-l-4 border-l-amber-500' : ''}">
  <header class="flex justify-between items-start mb-2">
    <span class="text-sm font-medium uppercase tracking-wide
                 {listing.type === 'offer' ? 'text-blue-600' : 'text-green-600'}">
      {listing.type}
      {#if listing.urgent}
        <span class="ml-2 text-amber-600">⚠ URGENT</span>
      {/if}
    </span>
    <span class="text-sm text-gray-500">{listing.neighborhood}</span>
  </header>

  <h3 class="text-lg font-semibold text-gray-800 mb-1">
    {listing.wattageRange}
  </h3>

  <p class="text-base text-gray-600 mb-3">
    {listing.fuelType} · {listing.generatorType}
  </p>

  <p class="text-sm text-gray-500 mb-4">
    {listing.type === 'offer'
      ? `Available until ${listing.availableUntil}`
      : listing.timeframe}
  </p>

  <div class="flex gap-2 mb-4">
    {#if listing.user.verified}
      <Badge variant="verified">✓ Verified</Badge>
    {/if}
    {#if listing.user.reviewCount > 0}
      <Badge variant="neutral">★ {listing.user.reviewCount} reviews</Badge>
    {:else}
      <Badge variant="warning">New user</Badge>
    {/if}
  </div>

  <Button on:click={() => dispatch('message', listing)}>
    Message
  </Button>
</article>
```

### Accessibility Checklist

- [ ] All interactive elements have min 48px touch target
- [ ] Focus states visible on all interactive elements
- [ ] Color contrast meets WCAG AA (4.5:1 for text, 3:1 for UI)
- [ ] Form errors announced to screen readers
- [ ] Page titles update on navigation
- [ ] Skip link to main content
- [ ] Semantic HTML (header, main, nav, article, etc.)
- [ ] ARIA labels where needed
- [ ] No color-only meaning (icons or text accompany color)

### Performance Targets

- First Contentful Paint: < 1.5s on 3G
- Time to Interactive: < 3s on 3G
- Bundle size: < 100KB gzipped
- Images: None required (no decorative graphics)

### Data Flow

```
User action → Svelte action/form → API route → Database
                                 ↓
                          Real-time updates via SSE or polling
```

- Keep it simple: Form actions for mutations, load functions for data
- No complex state management needed
- Optimistic UI updates where appropriate (message sending)

### Security Notes

- Phone verification via Twilio or similar
- Rate limiting on all API endpoints
- CSRF protection via SvelteKit defaults
- Input sanitization for all user content
- No sensitive data in localStorage
- HTTPS only

---

## Complete Microcopy Reference

### Error Messages

| Context | Message |
|---------|---------|
| Required field empty | "This field is required" |
| Invalid phone | "Enter a valid phone number" |
| Code expired | "Code expired. Request a new one." |
| Code invalid | "Invalid code. Try again." |
| Rate limited | "Too many attempts. Wait 15 minutes." |
| Network error | "Connection problem. Check your internet and try again." |
| Server error | "Something went wrong. Try again in a few minutes." |
| Listing not found | "This listing is no longer available." |
| User blocked | "You can't message this user." |
| Checkbox required | "Check all boxes to continue" |

### Success Messages

| Context | Message |
|---------|---------|
| Listing posted | "Your listing is live" |
| Message sent | (No message, just add to conversation) |
| Lend confirmed | "Lend confirmed" |
| Lend completed | "Marked as completed. Thanks for helping your neighbor!" |
| Review submitted | "Review submitted" |
| Report submitted | "Report submitted. We'll review within 24 hours." |
| Account deleted | "Your account has been deleted." |

### Empty States (Complete)

| Screen | Title | Description | Action |
|--------|-------|-------------|--------|
| Browse offers (no results) | No offers in [Neighborhood] right now | Try expanding your wattage range or checking nearby neighborhoods. | Clear all filters |
| Browse offers (no results, no filters) | No offers yet | Be the first to offer a generator in your area. | Post an offer |
| Browse requests (no results) | No requests in this area right now | Check back later or expand your search area. | Clear all filters |
| Browse requests (no results, no filters) | No requests yet | No one has requested a generator yet. | — |
| Your listings (empty) | You don't have any active listings | Post an offer or request to get started. | Post a listing |
| Your conversations (empty) | No conversations yet | Message someone about a listing to start a conversation. | Browse listings |
| Your reviews (empty) | No reviews yet | Complete a lend to receive your first review. | — |
| Search (no results) | No results for "[query]" | Try different keywords or browse all listings. | Browse all |

### Confirmation Dialogs

| Action | Title | Message | Confirm | Cancel |
|--------|-------|---------|---------|--------|
| Share address | Share your address? | This will send your exact address to this person. This app is not responsible for meetups. | Share address | Cancel |
| Cancel lend | Cancel this lend? | Both parties will be notified. This cannot be undone. | Yes, cancel | Go back |
| Delete listing | Remove this listing? | People won't be able to find it anymore. | Remove | Keep |
| Delete account | Delete your account? | This will permanently delete all your data, listings, and conversations. | Delete account | Cancel |
| Block user | Block this user? | They won't be able to message you or see your listings. | Block | Cancel |

### Helper Text

| Field | Helper |
|-------|--------|
| Wattage (request) | Not sure? A fridge + a few lights = about 2,000W |
| Urgent toggle | Only use if someone's health or safety depends on power. |
| Notes field | 50 characters remaining |
| Map view | Locations are approximate. Exact address shared after confirming. |
| New account limit | New accounts can post 1 listing at a time. Complete a lend to post more. |
| Deposit reminder | If you want a deposit, arrange it privately. This app is not involved. |

---

## Summary

This specification defines a utilitarian, accessible, and trustworthy emergency matching app. Key design decisions:

1. **No payments** — Liability and complexity avoided by design
2. **Safety first** — CO warning is permanent and unavoidable
3. **Privacy by design** — Addresses hidden until explicit share
4. **Maximum accessibility** — Large text, big targets, high contrast
5. **Minimal but complete** — Every screen has real content, no filler
6. **Anti-pattern avoidance** — No gradients, no marketing speak, no AI slop

The app should feel like a trusted public utility, not a startup product.
