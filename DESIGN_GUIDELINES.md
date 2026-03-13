# Property Master Vadodara — Design Guidelines

> **Purpose:** This file is the single source of truth for design decisions in this project.
> Every AI agent, developer, or contributor **must follow these rules** to keep the UI premium, consistent, and on-brand.

---

## 1. Core Philosophy

| Principle | Rule |
|---|---|
| **Premium over playful** | Clean, editorial, high-contrast. Avoid gradients, blobs, and decorative clutter. |
| **Restraint** | Less is more. One accent colour per section. No rainbow palettes. |
| **Solid over gradient** | Buttons, backgrounds, and surfaces use flat solid colours. Gradients are banned except for the hero photo overlay. |
| **Dark panels for drama** | When a section needs impact (CTA, hero), use `bg-gray-900` — never a multi-colour gradient card. |
| **Consistent rhythm** | Every section follows the same eyebrow → heading → subtext → content → CTA hierarchy. |

---

## 2. Colour Palette

All values are defined as Tailwind v4 CSS variables in `frontend/src/index.css` under `@theme`.

### Brand (Orange)
| Token | Hex | Usage |
|---|---|---|
| `brand-50` | `#fff3e6` | Badge/pill backgrounds |
| `brand-100` | `#ffe6cc` | Icon tint backgrounds |
| `brand-200` | `#ffcc99` | Hover fills on light backgrounds |
| `brand-500` | `#ff7a00` | **Primary brand colour** — buttons, active states, icons on dark, eyebrow text |
| `brand-600` | `#cc5c00` | Button hover state |
| `brand-700` | `#b34f00` | Button active/pressed state |

### Accent (Blue)
| Token | Hex | Usage |
|---|---|---|
| `accent-500` | `#0077b6` | Hyperlinks, secondary interactive elements |
| `accent-600` | `#00639a` | Link hover |

> ⚠️ **Never** mix brand-orange and accent-blue in the same component (e.g. no `from-brand-500 to-accent-600` gradients).

### Neutrals
| Token | Hex | Usage |
|---|---|---|
| `text-900` | `#222222` | Headings, primary body text |
| `text-600` | `#6b6b6b` | Secondary body text |
| `bg-100` | `#f5f5f5` | Page background |
| `surface-100` | `#ffffff` | Cards, panels, modals |
| `border-100` | `#ece7df` | Default border |
| `border-200` | `#e3d9cd` | Stronger border / divider |

### Status
| Token | Usage |
|---|---|
| `success-500` (#2ecc71) | Success states, "available" badges |
| `warning-500` (#ffb84d) | Warnings, price alerts |
| `error-500` (#e74c3c) | Errors, validation messages |

---

## 3. Typography

### Font Families
| Role | Font | Tailwind class |
|---|---|---|
| **Display** (headings) | Poppins (modern sans) | `font-display` |
| **Body** (paragraphs, UI) | Inter (geometric sans) | `font-sans` |

### Type Scale (use these, don't freestyle)
| Use | Size | Weight | Class |
|---|---|---|---|
| Section heading (h2) | `text-2xl` / `sm:text-3xl` | `font-bold` | — |
| Card heading (h3) | `text-base` | `font-semibold` | — |
| Body / description | `text-sm` or `text-base` | `font-normal` | — |
| Eyebrow label | `text-[11px]` | `font-bold` | `uppercase tracking-[0.22em]` |
| Caption / meta | `text-xs` | `font-normal` | `text-gray-400` |

### Rules
- `h1`–`h4` automatically use `font-display` (Poppins) via CSS base layer — do **not** override with `font-sans`.
- Use `text-balance` on headings and `text-pretty` on paragraphs for typographic polish.
- Letter-spacing on headings: `tracking-tight` or `-0.01em` (already applied globally).

---

## 4. Buttons

### Primary Button (Brand CTA)
```jsx
<button className="bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 shadow-[0_4px_14px_0_rgba(255,122,0,0.35)]">
  Label
</button>
```
> **Never** use `bg-gradient-to-r` on buttons. Solid `bg-brand-500` only.

### Secondary / Outline Button
```jsx
<button className="border border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:text-gray-900 px-5 py-2.5 rounded-xl font-semibold transition-colors text-sm">
  Label
</button>
```

### Ghost / Text Button (navigation, "View all")
```jsx
<Link className="group inline-flex items-center gap-1.5 text-gray-500 hover:text-gray-900 text-sm font-semibold transition-colors">
  View all <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
</Link>
```

### Dark Panel Button (used inside `bg-gray-900` sections)
```jsx
<button className="bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors shadow-[0_4px_14px_0_rgba(255,122,0,0.35)]">
  Label
</button>
```

---

## 5. Eyebrow / Section Labels

Every section **must** start with an eyebrow pill above the heading. Always use this exact pattern:

```jsx
<span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-brand-500 bg-brand-50 border border-brand-100 px-3 py-1.5 rounded-full">
  Section Name
</span>
```

**On dark backgrounds** (`bg-gray-900`), use the inverted version:
```jsx
<span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-brand-200 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
  Section Name
</span>
```

---

## 6. Surfaces & Cards

### Default Card (light background)
```jsx
<div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-[0_1px_3px_rgba(15,23,42,0.06)] hover:shadow-[0_8px_28px_-8px_rgba(15,23,42,0.14)] hover:-translate-y-1 transition-all duration-200">
  ...
</div>
```

### Feature / Info Card (icon + title + desc)
- Icon container: `w-11 h-11 bg-gray-900 rounded-xl` with `text-brand-500` icon inside.
- Do **not** use `bg-brand-100` icon containers (too light, breaks contrast).

### Dark Panel (CTA / Concierge sections)
```jsx
<div className="relative rounded-4xl overflow-hidden bg-gray-900 shadow-[0_24px_60px_-15px_rgba(15,23,42,0.45)]">
  {/* Dot texture */}
  <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-size-[28px_28px] pointer-events-none" />
  {/* Top accent line */}
  <div className="absolute inset-x-0 top-0 h-px bg-brand-500/60" />
  ...
</div>
```

### Glass Panel (used only on hero search card)
```jsx
/* CSS class: .glass-panel */
background: rgba(255, 255, 255, 0.86);
border: 1px solid rgba(255, 255, 255, 0.65);
backdrop-filter: blur(18px);
```
> Use glass **only** when the surface is floating over a dark photo background (e.g., Hero search bar). Not for general cards.

---

## 7. Section Backgrounds

Follow this alternating rhythm to create visual separation without colour noise:

| Section | Background |
|---|---|
| Page body | `bg-gray-50` / `bg-100` (#f5f5f5) |
| Featured Properties | Transparent (inherits page bg) |
| Features | `bg-white` |
| Testimonials | `bg-gray-50` |
| CTA / Concierge | `bg-gray-900` (dark panel) |
| Footer | `bg-gray-900` with a gently **curved top edge** (`rounded-t-4xl` or larger) to convey premium separation; optionally add a soft, smoky gradient at the very top to blend with the page background |

> **Tip:** the footer should feel like a dark panel that has been lifted up; rounding the top corners adds a quiet, sophisticated flourish. A mild gradient (e.g. `from-gray-50/0 to-gray-900/80`) can help the transition feel seamless. Keep any decorative curves or smoke subtle and avoid jagged or colourful waves.

> **Never** use orange or blue as a section background colour. Those are reserved for interactive elements only.

---

## 8. What Is BANNED

These patterns degrade the premium feel and **must never be used**:

| ❌ Banned | ✅ Use Instead |
|---|---|
| `bg-gradient-to-r from-brand-500 to-brand-600` on buttons | `bg-brand-500 hover:bg-brand-600` |
| `bg-gradient-to-r from-brand-100 via-brand-200 to-accent-600` on cards/panels | `bg-gray-900` or `bg-white` |
| `radial-gradient(ellipse_at_top, rgba(255,122,0,...))` overlay blobs | Remove entirely |
| `bg-brand-100` icon containers | `bg-gray-900` icon container |
| `text-gradient-brand` (gradient clip text) on headings | Solid `text-brand-500` |
| `blur-3xl` coloured glow blobs as decoration | Remove entirely |
| `body` background with radial orange/blue gradients | Flat `var(--color-bg-100)` |
| `surface-card` or `section-shell` with `linear-gradient` fills | Solid `#ffffff` with subtle box-shadow |
| `hover:scale-105` on buttons | No scale transform on buttons |
| `shadow-lg` (generic Tailwind) | Specific `shadow-[...]` with tuned values |

---

## 9. Shadows — Reference Values

| Use case | Shadow value |
|---|---|
| Default card | `shadow-[0_1px_3px_rgba(15,23,42,0.06)]` |
| Card hover | `shadow-[0_8px_28px_-8px_rgba(15,23,42,0.14)]` |
| Elevated modal / panel | `shadow-[0_24px_60px_-15px_rgba(15,23,42,0.45)]` |
| Primary brand button | `shadow-[0_4px_14px_0_rgba(255,122,0,0.35)]` |
| Search form on dark hero | `shadow-[0_24px_60px_-12px_rgba(0,0,0,0.45)]` |

---

## 10. Icons

- Use **[lucide-react](https://lucide.dev/)** exclusively. No mixing icon sets.
- Icon size in cards: `w-5 h-5`
- Icon size in buttons/inputs: `w-4 h-4`
- Icon size in hero stats: `w-4 h-4`
- Icon colour on dark icon containers (`bg-gray-900`): `text-brand-500`
- Icon colour on light icon containers (`bg-brand-50`): `text-accent-500` or `text-brand-500`

---

## 11. Borders & Dividers

- Default border: `border border-gray-100` (light surfaces)
- Stronger divider: `border-b border-gray-100`
- On dark (`bg-gray-900`): `border border-white/10`
- Image frames on dark bg: `ring-1 ring-white/10`
- Never use `border-gray-300` or darker on white cards — it's too heavy.

---

## 12. Spacing & Layout

- Max content width: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`
- Section vertical padding: `py-20`
- Card grid gap: `gap-5` or `gap-6`
- Eyebrow → heading gap: `mt-3`
- Heading → subtext gap: `mt-2`
- Subtext → content gap: `mb-10` or `mb-12`

---

## 13. Motion & Animation

- Use `framer-motion` (`LazyMotion` + `domAnimation`) for page-level entrance animations.
- Standard entrance: `opacity: 0 → 1`, `y: 14 → 0`, duration `0.45–0.55s`, easing `[0.22, 0.61, 0.36, 1]`.
- Stagger delay between sibling elements: `0.05s`.
- Always check `useReducedMotion()` and skip animations when true.
- CSS hover transitions: `transition-all duration-200` or `transition-colors`.
- **No** JS-driven continuous animations except the testimonials infinite scroll marquee.

---

## 14. Tailwind Version

This project uses **Tailwind CSS v4**. Follow v4 class naming:

| v3 (old) | v4 (correct) |
|---|---|
| `bg-gradient-to-t` | `bg-linear-to-t` |
| `bg-gradient-to-r` | `bg-linear-to-r` |
| `flex-shrink-0` | `shrink-0` |
| `min-w-[340px]` | `min-w-85` (if value maps to scale) |
| `rounded-[32px]` | `rounded-4xl` |
| `[background-image:...]` | `bg-[...]` |
| `[background-size:28px_28px]` | `bg-size-[28px_28px]` |

---

## 15. File Locations

| What | File |
|---|---|
| CSS variables & global styles | `frontend/src/index.css` |
| Tailwind config | `frontend/vite.config.js` |
| Brand logo | `frontend/src/property-master.png` |
| Hero | `frontend/src/components/Hero/Hero.jsx` |
| Header | `frontend/src/components/Header/Header.jsx` |
| Footer | `frontend/src/components/Footer/Footer.jsx` |
| Features | `frontend/src/components/Features/Features.jsx` |
| Testimonials | `frontend/src/components/Testimonials/Testimonials.jsx` |
| Home page | `frontend/src/pages/Home/HomePage.jsx` |
| Property card | `frontend/src/components/PropertyCard/PropertyCard.jsx` |
