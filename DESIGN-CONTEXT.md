# TRIPS PH Design Context

## 1) Product Visual Direction

TRIPS PH should feel:

- Modern and clean, with sharp geometry and airy spacing
- Trustworthy and safety-focused (high clarity over decoration)
- Lightweight and responsive, especially on map-heavy screens

Core style cues:

- Light-first interface with selective dark accents
- Semi-transparent surfaces (glass-like cards and overlays)
- Subtle glow and gradient accents for emphasis only
- Smooth, restrained motion between screens and states

## 2) Brand Color System

### Core Brand Colors

- Dark Azure: #163B42
- Azure: #1F525C
- Gray Green: #63B289
- White: #FFFFFF

### Extended Support Colors (Approved)

- Background Tint: #F4FAF8
- Surface Base: #FFFFFF
- Surface Muted: #EAF3F1
- Border Soft: #D2E4E0
- Text Primary: #123239
- Text Secondary: #45656B

### Status Colors

- Success / Legal: #63B289
- Warning / Risk: #ED8936
- Error / Illegal: #E53E3E
- Neutral / Unknown: #9E9E9E

### Usage Rules

- Use Azure or Dark Azure only for key actions, navigation, and focus states.
- Use Gray Green for positive/safe confirmations and highlights.
- Keep backgrounds light; avoid full-screen dark backgrounds except loading/overlay contexts.
- Maintain minimum WCAG contrast: 4.5:1 for normal text, 3:1 for large text.

## 3) Gradients, Transparency, and Glow

### Primary Gradient

- Linear gradient: #1F525C -> #2C6E7A (135deg)

### Soft Accent Gradient

- Linear gradient: #63B289 -> #8AC8A5 (135deg)

### Glass Surface Recipe

- Background: rgba(255, 255, 255, 0.72)
- Border: 1px solid rgba(255, 255, 255, 0.45)
- Blur: strong enough to separate foreground from map content
- Shadow: rgba(22, 59, 66, 0.10), y=8, blur=24

### Glow Usage

- Apply glow only to active CTA, selected tab, or critical status indicator.
- Glow color should match component hue at 20-30% opacity.
- Never apply glow to body text.

## 4) Typography

Tone: crisp, legible, and practical. Prioritize readability over stylization.

### Type Scale

- Display: 32 / 700 / line-height 38
- H1: 28 / 700 / line-height 34
- H2: 22 / 700 / line-height 28
- H3: 18 / 600 / line-height 24
- Body: 15 / 400 / line-height 22
- Body Strong: 15 / 600 / line-height 22
- Caption: 12 / 500 / line-height 16

### Rules

- Limit to 2 font weights per screen section where possible.
- Avoid all-caps except compact tags/badges.
- Keep line length short in cards and alerts for scanability.

## 5) Spacing, Radius, and Layout

Use an 8pt baseline grid.

### Spacing Tokens

- xs: 4
- sm: 8
- md: 16
- lg: 24
- xl: 32
- xxl: 48

### Radius Tokens

- sm: 8
- md: 14
- lg: 20
- xl: 28
- full: 9999

### Layout Rules

- Screen horizontal padding: 20
- Section vertical rhythm: 16 to 24
- Touch target minimum: 44x44
- Prefer card stacks with clear separation instead of dense tables

## 6) Component Styling Standards

### Buttons

- Primary: solid Azure or primary gradient, white text, medium shadow
- Secondary: tinted Surface Muted fill, Azure text
- Ghost: transparent with soft border (#D2E4E0), Dark Azure text
- Danger: Error red fill, white text

States required for all buttons:

- default, pressed, disabled, loading

### Cards

- Default card: white or glass surface, radius md/lg, soft border
- Elevated card: use subtle shadow, never heavy black shadows
- Include clear title, body, and action zones

### Inputs

- Filled light surface with clear border and visible focus ring
- Focus ring should use Azure at 35-45% opacity
- Error state must pair red border with readable helper text

### Badges/Tags

- Rounded full shape, compact spacing, strong label contrast
- Map verdict colors to legal/risk/illegal consistently across all screens

### Icons

- No emoji icons
- Use modern flat icon sets (e.g., Material Symbols, Ionicons, Lucide)
- Keep stroke/weight consistent per screen

## 7) Motion and Transitions

Motion should communicate hierarchy and reduce cognitive load.

### Timing

- Fast feedback (press, toggle): 120-180ms
- Standard transition (card, modal, screen element): 220-320ms
- Screen navigation: 280-360ms

### Easing

- Default: ease-out
- Entrance: slight deceleration
- Exit: quick, non-bouncy

### Patterns

- Use fade + slight upward translate for panel/card entrances
- Use shared element or continuity transitions for map-to-detail when possible
- Avoid decorative animations that compete with map/reporting tasks

## 8) Accessibility and Usability (Non-Negotiable)

- All actionable elements must have accessibility labels.
- Ensure logical focus and reading order across every screen.
- Preserve color meaning with text/icon reinforcement; never color-only status.
- Support dynamic text scaling without clipping key actions.
- Minimum contrast targets must be met across light and tinted surfaces.

## 9) Screen-Specific Guidance

### Role Selection

- Hero card with clear split between Motorist and Enforcer roles
- Use icon + short supporting copy per role
- Primary CTA prominence; avoid clutter

### Motorist Flow (Map/Reporting)

- Keep map dominant, controls layered as glass cards
- Floating action controls should remain thumb-reachable
- Step-by-step reporting should show clear progress state

### Enforcer Flow (Login/Dashboard/Report Detail)

- Dashboard emphasizes triage: severity, recency, location
- Use status chips and concise metadata blocks
- Report detail screen should prioritize verification actions

## 10) Do/Don't Checklist

### Do

- Use the defined token system before introducing ad-hoc values.
- Keep UI bright, clean, and high-contrast.
- Apply gradients/glow sparingly for emphasis.
- Keep interactions smooth but quick.

### Don't

- Don't use heavy dark themes as default.
- Don't mix too many accent colors in one view.
- Don't use emoji-style icons.
- Don't use large blur/glow effects that reduce readability.

## 11) Definition of Done for UI Updates

A screen is design-complete when:

- It follows tokenized colors, spacing, radius, and type scale
- It passes basic accessibility checks (contrast, touch size, labeling)
- It has consistent button/card/input states
- It remains clear and usable on both small phones and larger devices
- Transitions feel smooth and purposeful
