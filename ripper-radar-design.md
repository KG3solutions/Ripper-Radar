# Ripper Radar - Design Specification

## Overview
Nashville Winter Storm Dashboard - A dark-themed operations dashboard for tracking winter weather conditions.

## Color Palette

### Backgrounds
- `--bg-void`: #030303 (deepest black)
- `--bg-primary`: #080808 (primary background)
- `--bg-secondary`: #0f0f0f (elevated surfaces)
- `--bg-panel`: #0a0a0a (card/panel background)
- `--bg-panel-header`: #111111 (panel headers)

### Borders
- `--border-dim`: #1a1a1a (subtle borders)
- `--border-color`: #222222 (standard borders)

### Text
- `--text-primary`: #b0b0b0 (primary text)
- `--text-secondary`: #666666 (secondary text)
- `--text-muted`: #444444 (muted/labels)

### Accents
- `--accent-green`: #00ff41 (primary accent - terminal green)
- `--accent-green-dim`: #00aa2a (dimmed green)
- `--accent-cyan`: #00d4ff (info/data)
- `--accent-amber`: #ffb000 (warnings)
- `--accent-red`: #ff2a2a (alerts/danger)
- `--accent-purple`: #9d00ff (special)
- `--accent-ice`: #00c8ff (cold/ice indicators)

## Typography
- **Primary Font**: Fira Code, JetBrains Mono, Consolas (monospace)
- **Base Size**: 13px
- **Headers**: 0.72rem - 1.1rem, uppercase, letter-spacing: 2-3px
- **Body**: 0.65rem - 0.75rem
- **Labels**: 0.5rem - 0.6rem, uppercase

## Layout Structure

### Grid System
- 12-column grid
- 8px gap between panels
- 8px padding around content area
- Max width: 1920px

### Header (Sticky)
```
+------------------------------------------------------------------+
| [LOGO] RIPPER RADAR // NASHVILLE    [CLOCKS]     [STATUS ICONS]  |
+------------------------------------------------------------------+
```
- Green accent border bottom with glow
- Height: ~50px

### Alert Ticker
```
+------------------------------------------------------------------+
| >>> WINTER STORM WARNING >>> DANGEROUS ICE >>> STAY HOME >>>     |
+------------------------------------------------------------------+
```
- Amber colored, scrolling animation
- Height: ~40px

### Main Grid Layout
```
+------------------------------------------------------------------+
| [STORM OVERVIEW - Collapsible Banner - 12 cols]                  |
+------------------------------------------------------------------+
| [CONDITIONS]  [    FORECAST - HOURLY/DAILY    ]  [    RADAR    ] |
| [  2 cols   ] [         6 cols                ]  [   4 cols    ] |
| [  2 rows   ] [         2 rows                ]  [   2 rows    ] |
+------------------------------------------------------------------+
| [ACCUMULATION] [    TRAFFIC MAP    ] [  MODELS  ] [  WEBCAMS   ] |
| [  2 cols    ] [     4 cols        ] [ 3 cols   ] [  3 cols    ] |
| [  2 rows    ] [     2 rows        ] [ 2 rows   ] [  2 rows    ] |
+------------------------------------------------------------------+
| [   SOCIAL FEED - 4 cols   ] [   TIMELINE - 4 cols   ]  [MORE]  |
+------------------------------------------------------------------+
```

## Component Specifications

### Panel Component
- Border-radius: 8px
- Border: 1px solid --border-dim
- Background: gradient from --bg-panel to rgba(15, 31, 15, 0.95)
- Header: 40px height, gradient background
- Hover state: border-color changes to --accent-leaf, subtle translateY(-2px)
- Top accent bar on hover (3px, gradient green)

### Temperature Display
- Large temp: 4rem font, --accent-ice color
- Glow effect: 0 0 20px rgba(135, 206, 235, 0.4)
- "Feels like" subtext: 0.75rem

### Stats Grid
- 2x2 grid of stat boxes
- Each box: gradient background, 12px padding
- Value: 1.1rem --accent-leaf
- Label: 0.55rem --text-muted uppercase

### Forecast Cards
- Hourly: 60px min-width, stacked vertically
- Daily: 100px min-width, horizontal scroll
- Ice warning cards: red border accent
- Snow cards: cyan border accent

### Timeline
- Vertical line on left (2px, gradient green to gray)
- Dot markers: 10px circles with glow
- Colors by type: snow=cyan, ice=red, cold=purple, end=amber

### Accumulation Bars
- Progress bar style
- Height: 8px, rounded
- Fill gradients: ice=cyan, ice=red-amber, sleet=amber-cyan

### Live Indicator
- 6x6px circle
- Pulsing animation (blink)
- Box-shadow glow matching color

## Special Effects

### CRT Scanlines (Overlay)
```css
background: repeating-linear-gradient(
  0deg,
  rgba(0, 0, 0, 0.08) 0px,
  rgba(0, 0, 0, 0.08) 1px,
  transparent 1px,
  transparent 2px
);
```

### Hex Grid Background
- SVG pattern overlay at 1.5% opacity
- Pattern: hexagonal grid in accent-green

### Glow Effects
- Green: 0 0 8px rgba(0, 255, 65, 0.4)
- Cyan: 0 0 8px rgba(0, 212, 255, 0.4)
- Red: 0 0 8px rgba(255, 42, 42, 0.5)
- Amber: 0 0 8px rgba(255, 176, 0, 0.4)

## Panels to Design

1. **Header** - Logo, title, clocks (local/UTC), status indicators
2. **Alert Ticker** - Scrolling warning messages
3. **Storm Overview** - Collapsible section with 4-column grid
4. **Current Conditions** - Large temp display + 4 stat boxes + thaw forecast
5. **Forecast** - Tabs (Hourly/Daily), scrollable cards, temperature graph
6. **Radar** - Iframe embed area for weather radar
7. **Accumulation** - 3 progress bars (Snow, Ice, Sleet) with severity badges
8. **Traffic** - Iframe embed area for traffic map
9. **Weather Models** - Tab interface with model viewer
10. **Webcams** - 2x2 grid of video feeds
11. **Social Feed** - Scrollable list of weather updates
12. **Timeline** - Vertical timeline of storm events

## Key UI Patterns

- All panels have consistent header style with icon + title + metadata
- Hover states add subtle green border glow
- Active tabs use gradient green background
- Data values in accent colors (ice=cyan, warn=amber, danger=red)
- Uppercase labels with letter-spacing throughout
- Monospace fonts for all text
