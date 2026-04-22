<p align="center">
  <img src="TRIPSPH-HEADER1.png" alt="Header" />
</p>

![Brand Logo](assets/TRIPSPH-logo-white.png)
**Traffic Routing & Intelligent Parking System**
> Submission for the **MMITS Bagong Gawi, Bagong Galaw Challenge 2026** hosted by the MMDA and the Japan International Cooperation Agency (JICA).

---

## Overview

This platform is a comprehensive, dual-focus mobile application designed to solve Metro Manila's illegal parking and congestion problem. It provides:

- **Real-time parking intelligence** to motorists via the *Ordinance Intelligence Engine (OIE)*
- **Integrated, data-driven enforcement tools** for MMDA Enforcers / Planners

Its core function is to facilitate **Bagong Gawi** (New Habits) by making legal parking easy to find and legal compliance the simplest choice.

This project is under the team **Cardinal Forge**, affiliated with Mapua University, where:
- **Christine Julliane Laure Reyes** - Lead Developer, Core Systems Application and Complex AI Integration (OIE)
- **Shania Keith Dela Vega** - Project Manager, MMDA and External API Integration + Architecture
- **Louella Josephine Ng** - Business Analyst, Live Map Visualization and Risk Layer Designer
- **Kim Caryl Esperanza** - Strategy Lead, Data Analytics and Reporting Module + UI/UX Designer

_Entered: April 22, 2026_

## Relevant Documents and Files
[Working Doc](https://docs.google.com/document/d/1E3p7VCVAvXNghofW3FSRjMIfbqWHmr53z9GbF_0J9qg/edit?usp=sharing) | [Pitch Deck 1 (Reading Sub)](https://canva.link/8q73uiq1l2m30u7) | [Mockup Webview](https://tripsph.netlify.app/)
| --- | --- | --- |

---

## Target Users

| Mode | User |
|------|------|
| 🚘 Motorist | Daily Metro Manila drivers |
| 🛡 Enforcer | MMDA authorized enforcers & planners |

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│          Ordinance Intelligence Engine (OIE)     │
│  ┌─────────────┐  ┌────────────┐  ┌──────────┐  │
│  │ Geofenced   │  │ Live       │  │ MMDA     │  │
│  │ LGU Ordin.  │  │ Parking    │  │ Enforce- │  │
│  │ (time-based)│  │ Tracking   │  │ ment     │  │
│  └─────────────┘  └────────────┘  └──────────┘  │
│          ↓ Computes verdict ≤ 200 ms             │
│       LEGAL / RISK / ILLEGAL                     │
└──────────────────┬──────────────────────────────┘
                   │ WebSocket push
          ┌────────┴────────┐
          │  Mobile Client  │
          │  (React Native) │
          └────────┬────────┘
         ┌─────────┴────────┐
   Motorist Mode     Enforcer Mode
```

### Key Performance Targets

| Metric | Target |
|--------|--------|
| OIE Response Time | ≤ 200 ms |
| Map Refresh Rate | ≤ 60 seconds |
| AI Detection Confidence | ≥ 85% |
| AI Inference Budget (on-device) | < 500 ms |
| Enforcer Response Time | ≤ 5 minutes |

---

## Features

### 🚘 Motorist Mode

**Home Screen – Live Risk Map**
- Dark Azure (`#163b42`) map base with Dark Mode styling
- Color-coded enforcement zones: Gray Green (Legal), Orange (Risk), Alarm Red (Illegal)
- Alarm Red ✕ markers on permanent no-parking areas
- Azure "P" markers on paid parking structures with live occupancy
- Real-time OIE verdict banner at bottom of screen
- Navigate button → Navigation Mode

**Navigation Mode – Risk Banner**
- Dynamic enforcement risk overlay during navigation
- **Low Risk** → Gray Green (`#63b289`) banner: *"Low Risk Zone – Parking Likely Legal."*
- **High Risk / ILLEGAL** → Flashing Alarm Red banner: *"HIGH RISK ZONE – Tow Away Area. Do Not Stop."*

**Reporting Flow**
1. Camera capture with viewfinder guides
2. On-device AI scan (TFLite):
   - License Plate OCR
   - Violation Classification
   - Combined inference < 500 ms
3. Confirmation screen with AI annotations, confidence bars, GPS & timestamp
4. High-confidence (≥ 85%): Azure **"Submit Verified Report to MMDA"** button
5. Low-confidence: submitted as Gray pin for manual review (Human-in-the-Loop)

### 🛡 Enforcer Mode (Authorized Access Only)

**Login** – MMDA Badge ID + PIN authentication

**Dashboard Map**
- Dark Azure background focused on violation reports
- 🔴 Flashing Alarm Red pins → AI-Verified reports (immediate action)
- ⚫ Gray pins → Unverified reports (Manual Review Queue)
- List/Queue view with proximity ordering

**Report Detail**
- Citizen photo evidence + AI confidence score
- GPS coordinates, UTC timestamp, plate number
- Enforcer response timer (target ≤ 5 min)

**Action Panel**
- `[Dispatch Towing]`
- `[Issue NCAP Violation]` → POSTs to MMDA backend with all data pre-filled (plate, GPS, timestamp, photo URL) – **no manual re-entry**
- `[Mark as False Alarm]`

---

## Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| Dark Azure | `#163b42` | Background / Map Base |
| Azure | `#1f525c` | Primary Accent / Buttons / Nav Bar |
| Gray Green | `#63b289` | Safety / Availability / Legal zones |
| White | `#ffffff` | Text / Foreground |
| Alarm Red | `#e53e3e` | Violations / High Risk |
| Orange | `#ed8936` | Risk / Caution |

---

## Tech Stack

- **Framework:** React Native + Expo (~54)
- **Navigation:** React Navigation v6
- **Maps:** react-native-maps
- **Camera:** expo-camera
- **Location:** expo-location
- **Real-time:** WebSocket (persistent connection to OIE backend)
- **On-device AI:** TFLite (via `tflite-react-native`)

---

## Getting Started

```bash
# Install dependencies
npm install --legacy-peer-deps

# Start the development server
npm start

# Run on Android
npm run android

# Run on iOS (requires macOS)
npm run ios

# Run tests
npm test
```

### Demo Credentials (Enforcer Mode)
- **Badge ID:** `MMDA-2026`
- **PIN:** `1234`

---

## Project Structure

```
tripsph/
├── App.js                        # Root component
├── src/
│   ├── constants/
│   │   └── theme.js              # Colors, typography, design tokens
│   ├── navigation/
│   │   └── AppNavigator.js       # Root stack + tab navigator
│   ├── services/
│   │   ├── OIEService.js         # Ordinance Intelligence Engine mock
│   │   ├── WebSocketService.js   # Persistent WS connection manager
│   │   ├── AIReportService.js    # On-device AI pipeline + NCAP POST
│   │   └── MockReports.js        # Sample enforcement reports
│   ├── components/
│   │   └── UIComponents.js       # Shared buttons, cards, badges
│   └── screens/
│       ├── RoleSelectScreen.js
│       ├── motorist/
│       │   ├── HomeMapScreen.js
│       │   ├── NavigationModeScreen.js
│       │   ├── ReportingFlowScreen.js
│       │   └── ReportConfirmScreen.js
│       └── enforcer/
│           ├── EnforcerLoginScreen.js
│           ├── EnforcerDashboardScreen.js
│           └── ReportDetailScreen.js
└── __tests__/
    ├── theme.test.js
    ├── OIEService.test.js
    └── AIReportService.test.js
```

---

*MMDA · JICA · Bagong Gawi, Bagong Galaw 2026*

