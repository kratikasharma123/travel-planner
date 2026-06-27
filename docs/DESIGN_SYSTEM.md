# Design System — TravelAI Planner

Ye design system TravelAI Planner ke future UI implementation ke liye visual foundation define karta hai. Milestone 1 mein sirf planning hai; Tailwind config ya CSS code implement nahi kiya gaya.

## Brand Personality

TravelAI Planner ka design modern, trustworthy, travel-inspiring, and SaaS-like hona chahiye.

### Keywords

- Clean
- Premium
- Friendly
- Intelligent
- Travel-inspired
- Reliable
- Calm

## Primary Colors

| Token | Hex | Use Case |
|---|---|---|
| Primary 50 | `#ECFEFF` | Light background tint |
| Primary 100 | `#CFFAFE` | Soft section backgrounds |
| Primary 500 | `#06B6D4` | Primary CTA, active states |
| Primary 600 | `#0891B2` | Button hover |
| Primary 700 | `#0E7490` | Strong emphasis |

## Secondary Colors

| Token | Hex | Use Case |
|---|---|---|
| Indigo 500 | `#6366F1` | AI assistant accent |
| Emerald 500 | `#10B981` | Success, saved states |
| Amber 500 | `#F59E0B` | Budget warnings, highlights |
| Rose 500 | `#F43F5E` | Errors, destructive actions |
| Sky 500 | `#0EA5E9` | Destination discovery accent |

## Neutral Colors

| Token | Hex | Use Case |
|---|---|---|
| Slate 50 | `#F8FAFC` | App background |
| Slate 100 | `#F1F5F9` | Section background |
| Slate 200 | `#E2E8F0` | Borders |
| Slate 500 | `#64748B` | Secondary text |
| Slate 700 | `#334155` | Body text |
| Slate 900 | `#0F172A` | Headings |

## Typography

### Font Family Planning

| Type | Font |
|---|---|
| Primary UI Font | Inter |
| Fallback | system-ui, sans-serif |

### Type Scale

| Style | Size | Weight | Use Case |
|---|---|---|---|
| Display | 48-64px | 700-800 | Landing hero |
| H1 | 36-44px | 700 | Page title |
| H2 | 28-32px | 700 | Section heading |
| H3 | 22-24px | 600 | Card groups |
| Body | 16px | 400 | Main text |
| Small | 14px | 400-500 | Metadata, helper text |
| Caption | 12px | 500 | Badges, labels |

## Spacing System

8px-based spacing system use hoga.

| Token | Value | Use Case |
|---|---|---|
| `space-1` | 4px | Tight icon gaps |
| `space-2` | 8px | Small gaps |
| `space-3` | 12px | Input inner spacing |
| `space-4` | 16px | Card content spacing |
| `space-6` | 24px | Section internal spacing |
| `space-8` | 32px | Page group spacing |
| `space-12` | 48px | Major section spacing |
| `space-16` | 64px | Landing page sections |

## Border Radius

| Token | Value | Use Case |
|---|---|---|
| Small | 6px | Badges, small controls |
| Medium | 10px | Inputs, buttons |
| Large | 16px | Cards |
| XL | 24px | Hero panels, modals |
| Full | 999px | Pills, avatars |

## Shadow System

| Token | Value Style | Use Case |
|---|---|---|
| Soft | Light shadow | Cards, panels |
| Medium | Deeper shadow | Dropdowns, modals |
| Glow | Cyan/indigo glow | Primary CTA, AI elements |

### Shadow Usage Guidelines

- Dashboard cards: soft shadow
- Modals/dropdowns: medium shadow
- AI assistant active state: subtle glow
- Avoid heavy shadows on mobile

## Button Styles

### Primary Button

| Property | Plan |
|---|---|
| Background | Primary 500 |
| Hover | Primary 600 |
| Text | White |
| Radius | Medium/full depending context |
| Use | Main CTAs like Start Planning, Generate Itinerary |

### Secondary Button

| Property | Plan |
|---|---|
| Background | White or Slate 50 |
| Border | Slate 200 |
| Text | Slate 700 |
| Hover | Slate 100 |
| Use | Secondary actions |

### Ghost Button

| Property | Plan |
|---|---|
| Background | Transparent |
| Text | Slate 600/Primary 600 |
| Hover | Light tint |
| Use | Navbar and subtle actions |

### Destructive Button

| Property | Plan |
|---|---|
| Background | Rose 500 |
| Text | White |
| Use | Delete trip/account actions |

## Card Styles

### Default Card

- White background
- Slate 200 border
- Large radius
- Soft shadow
- 16-24px padding

### Feature Card

- Icon circle
- Title
- Short description
- Hover lift animation

### Destination Card

- Image/header visual area
- Destination title
- Tags
- Cost and season badges
- CTA button

### Trip Card

- Trip title
- Destination
- Date/duration
- Budget estimate
- Status badge
- Open trip action

## Input Styles

| Element | Plan |
|---|---|
| Text input | Rounded medium, border slate, focus primary ring |
| Select | Same as input with dropdown icon |
| Textarea | Larger height, assistant-friendly |
| Checkbox | Primary color checked state |
| Chips | Rounded full, selected primary tint |
| Error state | Rose border + helper text |
| Success state | Emerald helper state |

## Icons

### Icon Style

- Line icons preferred
- Rounded stroke style
- Consistent 20px/24px sizes

### Planned Icon Categories

| Use Case | Example Icons |
|---|---|
| Travel | Plane, map, suitcase, compass |
| AI | Sparkles, bot, message circle |
| Budget | Wallet, chart, calculator |
| User | User, settings, shield |
| Admin | Bar chart, users, database |

## Responsive Breakpoints

| Breakpoint | Width | Layout Strategy |
|---|---|---|
| Mobile | `< 640px` | Single column, large touch targets |
| Small Tablet | `640px+` | 2-column cards where possible |
| Tablet | `768px+` | Sidebar optional, wider forms |
| Laptop | `1024px+` | Dashboard grid, split layouts |
| Desktop | `1280px+` | Max-width containers, rich panels |
| Wide | `1536px+` | Centered content, avoid over-stretching |

## Layout System

### Container Widths

| Context | Width Plan |
|---|---|
| Landing sections | Max 1200px |
| Dashboard content | Fluid with max 1440px |
| Auth forms | 420px max form width |
| Chat layout | Full height dashboard area |

## Animation Guidelines

| Animation | Use Case |
|---|---|
| Fade in | Page and section entry |
| Slide up | Cards and forms |
| Hover lift | Feature/destination/trip cards |
| Shimmer | AI loading and skeleton states |
| Typing dots | AI assistant response |
| Count-up | Budget totals and dashboard stats |

### Animation Rules

- Animations subtle and fast honi chahiye.
- Important interactions 150-250ms ke beech.
- Respect reduced-motion preference in future implementation.

## Dark Mode Strategy

Dark mode future-ready design ke saath plan hoga.

### Strategy

- Design tokens based approach use hoga.
- Light and dark semantic colors define honge.
- Tailwind dark class strategy future implementation mein use ho sakti hai.

### Dark Mode Color Direction

| Element | Dark Mode Plan |
|---|---|
| Background | Slate 950 |
| Surface | Slate 900 / Slate 800 |
| Text | Slate 50 / Slate 200 |
| Border | Slate 700 |
| Primary | Cyan 400/500 |
| AI Accent | Indigo 400 |

## Accessibility Standards

- Minimum 4.5:1 text contrast target
- Focus rings visible
- Buttons minimum 44px touch height on mobile
- Form errors descriptive
- Icons should not be the only way to communicate meaning

## Milestone 1 Boundary

Ye design system planning document hai. Is milestone mein Tailwind config, CSS files, components, ya tokens implement nahi kiye gaye.
