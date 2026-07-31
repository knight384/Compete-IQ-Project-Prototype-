---
name: Intelligent Enterprise
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#434655'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#4b41e1'
  on-secondary: '#ffffff'
  secondary-container: '#645efb'
  on-secondary-container: '#fffbff'
  tertiary: '#006242'
  on-tertiary: '#ffffff'
  tertiary-container: '#007d55'
  on-tertiary-container: '#bdffdb'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#e2dfff'
  secondary-fixed-dim: '#c3c0ff'
  on-secondary-fixed: '#0f0069'
  on-secondary-fixed-variant: '#3323cc'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  display-lg:
    fontFamily: Poppins
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Poppins
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Poppins
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  headline-sm:
    fontFamily: Poppins
    fontSize: 20px
    fontWeight: '500'
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
    lineHeight: '1.5'
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.2'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-max: 1440px
  gutter: 24px
  margin-page: 32px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 24px
  sidebar-width: 260px
---

## Brand & Style

The design system is engineered for a high-stakes business intelligence environment. It balances the precision required for data analysis with an approachable, premium aesthetic. The personality is **intelligent, reliable, and cutting-edge**, designed to instill confidence in executive stakeholders and data analysts alike.

The visual style is a hybrid of **Modern Corporate Minimalism** and **Subtle Glassmorphism**. It utilizes generous whitespace to reduce cognitive load while employing soft, layered depth to guide the user's focus. The overall atmosphere is "Investor-Ready"—polished, professional, and technologically advanced without being overly decorative.

## Colors

The palette is anchored by a high-trust **Blue (#2563EB)** and an innovative **Indigo (#4F46E5)**. These are used to denote primary actions and brand presence. An **Emerald accent (#10B981)** is reserved for positive data trends, success states, and growth indicators.

The background uses a cool **Slate-50 (#F8FAFC)** to differentiate the canvas from the purely white **Surface cards (#FFFFFF)**. Borders should remain extremely subtle using **Slate-100 (#F1F5F9)** to maintain a clean, borderless feel while providing necessary structure for high-density data views.

## Typography

This design system utilizes a dual-typeface strategy. **Poppins** is used for all headings and display elements to provide a modern, geometric, and professional character. **Inter** is the workhorse for body copy, data tables, and interface labels, chosen for its exceptional legibility at small sizes and high X-height.

For mobile layouts, `display-lg` should scale down to `32px` and `headline-lg` to `24px` to ensure readability and prevent horizontal overflow. Numerical data in tables should ideally use tabular-lining figures if available in the Inter font family to ensure columns of numbers align perfectly.

## Layout & Spacing

The layout follows a **Fixed-Fluid hybrid grid**. The main navigation sidebar is fixed at 260px, while the content area scales fluidly up to a 1440px maximum width. A 12-column system is used for dashboard layouts, typically grouping widgets in spans of 3, 4, 6, or 12.

Spacing is built on an **8px base unit**. 
- **Desktop:** 32px page margins with 24px gutters between dashboard cards.
- **Tablet:** 24px page margins with 16px gutters.
- **Mobile:** 16px page margins with a single-column stack.

Use "Negative Space" as a functional element—ensure complex data visualizations have at least 24px of internal padding within cards to maintain a premium, uncluttered feel.

## Elevation & Depth

Hierarchy is established through **Ambient Shadows** rather than heavy borders. 

- **Level 0 (Background):** #F8FAFC. No shadow.
- **Level 1 (Cards/Widgets):** #FFFFFF. Shadow: `0px 4px 20px -2px rgba(15, 23, 42, 0.05)`. Subtle border: 1px solid #F1F5F9.
- **Level 2 (Dropdowns/Modals):** #FFFFFF. Shadow: `0px 12px 32px -4px rgba(15, 23, 42, 0.1)`. 
- **Glassmorphism:** For top navigation bars or sticky headers, use a background of `rgba(255, 255, 255, 0.8)` with a `blur(12px)` to maintain context while keeping the interface feeling light.

## Shapes

The shape language is sophisticated and modern, utilizing a large **20px (1.25rem)** corner radius for primary cards and containers. This "Rounded" approach softens the data-heavy nature of the SaaS product.

- **Small Components (Buttons/Inputs):** 8px (0.5rem) to maintain precision.
- **Medium Components (Dropdowns/Modals):** 12px (0.75rem).
- **Large Components (Dashboard Cards/Main Containers):** 20px (1.25rem).
- **Interactive States:** Focus states should use a 2px offset ring in the primary blue color.

## Components

### Buttons
- **Primary:** Solid Blue (#2563EB) with white text. 8px corner radius.
- **Secondary:** Solid Indigo (#4F46E5) or light ghost variant with Blue text.
- **Ghost:** No background, Blue or Slate-600 text. Use for less critical actions.
- **Sizing:** Medium height (40px) is the standard for enterprise workflows.

### Cards
Cards are the primary container. They must feature a **20px border-radius**, a 1px Slate-100 border, and the Level 1 shadow. Internal padding should be a consistent 24px.

### Data Tables
Tables should avoid heavy vertical lines. Use 1px horizontal dividers in Slate-100. Row height should be "comfortable" (52px+). On hover, rows should transition to a very light Slate-50 background. Header cells use `label-md` typography.

### Input Fields
Inputs use an 8px radius with a Slate-200 border. Upon focus, the border transitions to Primary Blue with a subtle 3px outer glow (Primary Blue at 10% opacity).

### Sidebar
The sidebar is white, strictly vertical, with a subtle right-hand border (#F1F5F9). Icons (Lucide) should be 20px, set in Slate-500, transitioning to Primary Blue on active state with a 3px vertical "pill" indicator on the left edge.

### Charts
Charts should utilize the primary, secondary, and accent colors. For multi-series data, use a descending opacity of the primary blue or a predefined professional categorical palette (Blue, Indigo, Emerald, Slate-400, Violet).