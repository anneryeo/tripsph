# Design Context (v2)

![Brand Logo](assets/TRIPSPH-logo-white.png)

## 1) Creative Direction

Build a modern light-first interface with vivid azure energy, glass surfaces, and clear task hierarchy.

Direction keywords:

- clean
- iconic
- confident
- high-contrast
- fast to scan

This guide is directional, not rigid. Use judgment when stronger visual communication is needed.

## 2) Brand and Color Intent

### Core Palette

- Deep Azure: #0F3444
- Primary Azure: #0C7FA6
- Bright Azure: #3AB3D9
- Success Green: #31B87B
- Light Base: #F2FBFF
- Surface White: #FFFFFF

### Support Colors

- Text Primary: #0F2E3A
- Text Secondary: #3F6170
- Border Soft: #C4DEEA
- Warning: #F28A2F
- Error: #E53E3E

### Contrast Rules

- Keep text on light surfaces dark enough for clear readability.
- Avoid low-contrast pastel-on-pastel combinations.
- Reinforce all critical states with text and iconography, not color alone.

## 3) Gradient and Glass Language

### Gradient Direction

- Hero and screen backdrops should use cool azure blends.
- Suggested brand gradient: #0B6F93 -> #2A98C2 -> #65C4E4.
- Keep gradients smooth and broad, not noisy.

### Glass Surfaces

- Surface fill: rgba(255,255,255,0.72) to rgba(255,255,255,0.86).
- Border: 1px light translucent border.
- Shadow: soft azure shadow, medium blur.
- Use glass for control clusters, cards, status containers, and floating actions.

## 4) Typography

Primary font is Canva Sans.

Fallback behavior must preserve a modern sans-serif look:

- web fallback stack: Canva Sans, Segoe UI, Helvetica Neue, Arial, sans-serif

Hierarchy priorities:

- large and assertive screen headers
- concise supporting lines
- compact labels and metadata

## 5) Icon and Branding Rules

- Do not use emoji icons anywhere in UI.
- Use geometric or vector iconography with consistent weight.
- If branding is needed in visible UI, prefer logo asset placement over writing the app name as plain text.
- Keep logo usage purposeful: top bars, auth headers, and role entry points.

## 6) Layout and Navigation

- Maintain obvious Return/Back affordances on all screens.
- Keep primary action in predictable positions.
- Use cards and spacing to separate priorities.
- Preserve mobile-first composition even on web (centered viewport frame).

## 7) Motion and Feedback

- Quick response interactions: 120-180ms.
- Standard transitions: 220-320ms.
- No decorative animation that competes with map/risk data.

## 8) Screen Priorities

### Role Selection

- Strong hero presence with logo and two clear mode cards.
- Motorist and Enforcer cards must be visually distinct but harmonious.

### Motorist

- Map remains dominant.
- Risk and route context stay visible via glass overlays.
- Reporting flow should clearly guide capture -> verify -> submit.

### Enforcer

- Dashboard focuses on triage and action speed.
- Report detail emphasizes evidence and next actions.

## 9) Definition of Done

Design is complete when a screen:

- follows the vibrant azure + glass visual language
- maintains high contrast and accessibility labels
- uses non-emoji iconography only
- uses logo-first branding treatment where branding appears
- remains easy to navigate in both mobile and web contexts
