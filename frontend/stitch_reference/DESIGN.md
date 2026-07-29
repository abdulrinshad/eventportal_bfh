---
name: Premium Event Management System
colors:
  surface: '#f9f9ff'
  surface-dim: '#d3daea'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f3ff'
  surface-container: '#e7eefe'
  surface-container-high: '#e2e8f8'
  surface-container-highest: '#dce2f3'
  on-surface: '#151c27'
  on-surface-variant: '#504533'
  inverse-surface: '#2a313d'
  inverse-on-surface: '#ebf1ff'
  outline: '#827560'
  outline-variant: '#d4c4ac'
  surface-tint: '#7a5900'
  primary: '#7a5900'
  on-primary: '#ffffff'
  primary-container: '#f4b400'
  on-primary-container: '#654800'
  inverse-primary: '#fdbc13'
  secondary: '#555f6f'
  on-secondary: '#ffffff'
  secondary-container: '#d6e0f3'
  on-secondary-container: '#596373'
  tertiary: '#006e2f'
  on-tertiary: '#ffffff'
  tertiary-container: '#40d96f'
  on-tertiary-container: '#005a25'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdea3'
  primary-fixed-dim: '#fdbc13'
  on-primary-fixed: '#261900'
  on-primary-fixed-variant: '#5d4200'
  secondary-fixed: '#d9e3f6'
  secondary-fixed-dim: '#bdc7d9'
  on-secondary-fixed: '#121c2a'
  on-secondary-fixed-variant: '#3d4756'
  tertiary-fixed: '#6bff8f'
  tertiary-fixed-dim: '#4ae176'
  on-tertiary-fixed: '#002109'
  on-tertiary-fixed-variant: '#005321'
  background: '#f9f9ff'
  on-background: '#151c27'
  surface-variant: '#dce2f3'
typography:
  display-lg:
    fontFamily: Poppins
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Poppins
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.3'
  headline-lg-mobile:
    fontFamily: Poppins
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  headline-md:
    fontFamily: Poppins
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.4'
  headline-sm:
    fontFamily: Poppins
    fontSize: 20px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
  container-margin: 24px
  gutter: 16px
---

## Brand & Style

The design system is engineered for a premium event management platform, prioritizing clarity, sophistication, and effortless navigation. The brand personality is professional yet energetic, reflecting the high-stakes nature of event coordination while maintaining a calm, organized atmosphere.

The visual style follows a **Modern Minimalist** approach with a **Tactile** twist. It utilizes generous whitespace to reduce cognitive load and features high-quality typography to convey authority. Subtle glassmorphism and soft ambient shadows are used to create a sense of depth and hierarchy, ensuring that critical data and event metrics remain the focal point. The interface should feel expansive, clean, and meticulously crafted, mirroring the precision required for world-class events.

## Colors

The palette is anchored by a "Premium Yellow" primary color, chosen to evoke optimism and high-end hospitality. This is balanced against a sophisticated neutral scale.

- **Primary & Action:** Use `#F4B400` for primary calls-to-action and key brand moments. Use the darker hover state (`#E09E00`) to provide immediate tactile feedback.
- **Surface Strategy:** The background uses a very warm white (`#FFFDF7`) to prevent screen fatigue and distinguish the UI from generic "pure white" SaaS products. Interactive cards and containers use pure `#FFFFFF` to "pop" against the background.
- **Typography & Borders:** High-contrast text (`#1F2937`) ensures accessibility, while soft grey borders (`#E5E7EB`) define structure without creating visual noise.

## Typography

This design system uses a dual-font strategy. **Poppins** is reserved for headlines and display text, providing a geometric, modern, and friendly character. **Inter** is used for all functional body text and labels, selected for its exceptional legibility and systematic feel.

- **Headlines:** Use tight letter spacing for large display sizes to maintain a premium "editorial" look.
- **Body:** Standardize on `body-md` for general content. Use `body-sm` for secondary metadata in event cards.
- **Labels:** Use `label-sm` with uppercase styling for badges, categories, and table headers to create clear visual distinction from body copy.

## Layout & Spacing

The design system is built on a strict **8px grid system**. All layout dimensions, padding, and margins must be multiples of 8.

- **Grid Model:** Use a 12-column fluid grid for desktop views.
- **Sidebar & Nav:** Authenticated users see a fixed 260px sidebar on desktop. Guests use a 72px high sticky top-navigation bar.
- **Breakpoints:**
  - **Mobile (< 768px):** 4-column grid, 16px margins. Sidebar transforms into a bottom-sheet or full-screen overlay.
  - **Tablet (768px - 1024px):** 8-column grid, 24px margins.
  - **Desktop (> 1024px):** 12-column grid, 32px max margins or centered max-width container (1440px).
- **Rhythm:** Use `lg` (24px) spacing for internal card padding and `xl` (32px) for spacing between major sections to maintain a generous, premium feel.

## Elevation & Depth

Hierarchy is established through "Soft Depth" — a combination of tonal layering and highly diffused shadows.

- **Level 0 (Background):** `#FFFDF7` — The lowest layer.
- **Level 1 (Cards/Surfaces):** `#FFFFFF` with a very soft, large-radius shadow: `0 4px 20px rgba(31, 41, 55, 0.04)`.
- **Level 2 (Hover/Active):** Slightly more pronounced shadow to indicate interactivity: `0 10px 30px rgba(31, 41, 55, 0.08)`.
- **Level 3 (Modals/Popovers):** Highest elevation with a protective backdrop blur (12px) and a deep shadow: `0 20px 50px rgba(0, 0, 0, 0.1)`.

Avoid harsh borders. Instead, use thin, low-contrast outlines (`1px solid #E5E7EB`) in conjunction with shadows to define surface boundaries.

## Shapes

The design system utilizes a **Rounded** shape language to feel approachable and modern.

- **Primary Radius:** 16px (`1rem`) is the standard for cards, input fields, and large buttons.
- **Small Elements:** Use 8px for smaller components like chips or nested icons.
- **Pill Shapes:** Badges and specific action buttons may use fully rounded (pill) shapes to distinguish them from structural layout elements.
- **Consistent Curvature:** Ensure that when elements are nested (e.g., a button inside a card), the inner radius is slightly smaller than the outer radius to maintain optical harmony.

## Components

### Buttons
- **Primary:** Background `#F4B400`, 16px radius, soft shadow matching the brand color. Text is bold and `#1F2937`.
- **Secondary:** Transparent background with a `#E5E7EB` border.
- **Interaction:** All buttons shift background color on hover and scale down slightly (98%) on click for tactile feedback.

### Cards
- **Event Cards:** Must feature a 16:9 aspect ratio image header with 16px top corner radius. Use `label-sm` for category badges (e.g., "Conference," "Workshop") positioned in the top-left of the card.
- **Statistics Cards:** Inspired by Stripe; clean, centered typography with small Sparkline charts to show trends.

### Forms
- **Inputs:** 16px radius, 12px vertical padding. Focus state features a 2px border of `#F4B400` and a soft yellow outer glow.
- **Labels:** Positioned above the input using `label-md` for maximum clarity.

### Feedback & Alerts
- **Status Badges:** Subtle, desaturated backgrounds with high-contrast text (e.g., Success is light green background with dark green text).
- **Alerts:** Use left-border accents (4px) to denote the status color while keeping the main alert body a very pale version of that color.

### Navigation
- **Sidebar:** Minimal icons with `Inter` labels. Use a vertical "active" indicator in Primary Yellow next to the selected menu item.
- **Navbar:** Glassmorphic background blur (20px) with a subtle bottom border.