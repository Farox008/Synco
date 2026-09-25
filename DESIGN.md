# Synco Software - Design System (DESIGN.md)

This document is the official design standard and single source of truth for the Synco Software application. It dictates the visual language, component structure, and layout rules that all future pages and features MUST follow. 

**Note:** The Profile Page and User Management Page are currently excluded from this standard and should not be used as references.

---

## Design Philosophy

The Synco design language is built for a **Modern Manufacturing Software** environment. 

- **Professional & Clean:** Emphasizing clarity and reducing visual noise.
- **High Information Density:** Designed to display complex factory data, metrics, and tables without feeling cluttered.
- **Consistent Components:** Reusing a strict set of cards, badges, and layout primitives.
- **Enterprise Ready:** Clear hierarchy, logical navigation, and accessible data visualization.

---

## Color System

The application relies on a strict set of CSS variables (`globals.css`). **Never hardcode hex values.** Always use the designated CSS variables or their Tailwind equivalents.

### Background & Surfaces
- **Background (`--bg-color`)**: `#F3F5F8` - Used for the main app background to provide contrast against pure white cards.
- **Surface / Card (`--card-bg`, `--sidebar-bg`)**: `#FFFFFF` - Used for sidebars, cards, and primary content containers.

### Typography
- **Primary Text (`--text-primary`)**: `#1A1D1F` - Used for headings, active data, and primary body text.
- **Secondary Text (`--text-secondary`)**: `#6F767E` - Used for subtitles, table data, and secondary information.
- **Tertiary Text (`--text-tertiary`)**: `#9A9FA5` - Used for disabled states, placeholders, and minor meta-information.
- **Borders (`--border-color`)**: `#E5E7EB` - Used for card borders, table dividers, and structural outlines.

### Accent & Semantic Colors
- **Accent Red (`--accent-red`)**: `#FF4D4D` (Hover: `#fa3131`, Light: `#FFF0F0`) - Primary brand color, used for primary buttons, active tabs, active tags, and critical statuses.
- **Success Green (`--success-green`)**: `#27AE60` (Light: `#E8F5E9`) - Used for completed statuses, positive trends, and success states.
- **Warning Orange (`--warning-orange`)**: `#F39C12` (Light: `#FFF3E0`) - Used for transit/setup statuses and warnings.
- **Info Blue**: `#1976D2` (Light: `#E3F2FD`) - Used for processing states and informational elements.

---

## Typography

The application uses **Inter** (via Google Fonts) as its primary sans-serif typeface.

- **Font Family:** `'Inter', sans-serif`
- **Page Titles (`h1`)**: 24px, Font Weight: 600 (Semibold), Color: Primary Text
- **Section/Card Titles (`h3`)**: 18px, Font Weight: 600 (Semibold)
- **Body Text**: 14px, Color: Primary or Secondary Text depending on hierarchy
- **Small Details / Meta**: 12px or 11px, Font Weight: 500/600, Color: Tertiary Text
- **Table Headers (`th`)**: 12px, Font Weight: 600, Uppercase styling with letter spacing.

---

## Spacing System

Spacing should follow an 8pt grid system. Do not use arbitrary spacing values.

- **2px / 4px**: Micro spacing (internal component spacing, badges)
- **8px**: Small spacing (gaps between icons and text, small list items)
- **12px**: Regular component padding
- **16px**: Standard padding for buttons, list items, and inputs
- **24px**: Card padding, section gaps, header bottom margins
- **32px**: Page-level padding, major section gaps, header horizontal padding

---

## Border Radius

- **Small (`4px` / `6px`)**: Progress bars, small badges, segmented charts
- **Medium (`8px`)**: Standard buttons, inputs, search bars, list items
- **Large (`12px` / `16px`)**: Standard Cards, Modals
- **Extra Large (`20px` / `24px`)**: Status pills, header tabs, large metadata cards
- **Full (`50%`)**: Avatars, circular action buttons, stepper circles

---

## Shadows

Elevation is managed through subtle box shadows.

- **Small (`--shadow-sm`)**: `0 1px 3px rgba(0,0,0,0.1)` - Used for minor popouts, active tabs, and secondary buttons.
- **Medium (`--shadow-md`)**: `0 4px 6px -1px rgba(0,0,0,0.1)` - Used for standard cards, modals, and dropdowns.
- **Hover Shadows**: Cards use a larger shadow on hover (`0 8px 24px rgba(0,0,0,0.08)`) to indicate interactivity.

---

## Layout Rules

- **Page Layout**: The app uses a fixed flexbox shell (`.app-container`). 
- **Sidebar**: Fixed width (`280px`), collapsible to `72px`. Z-index: 100.
- **Main Wrapper**: `flex: 1` with `overflow: hidden`, containing the top header and a scrollable content area.
- **Content Scroll Area (`.content-scroll`)**: Used for the main body of every page. Automatically handles vertical scrolling. Standard padding is `32px` on the sides and bottom.
- **Grid Layouts**: Dashboard and overview pages use CSS Grid. KPI grids typically use `grid-template-columns: repeat(2, 1fr)` or up to `6` columns on wide screens. Gap is consistently `12px` or `24px`.

---

## Cards

Cards are the primary container for information.

- **Base Style (`.card`)**: White background (`var(--card-bg)`), 12px border radius, 1px solid border (`var(--border-color)`), and 24px padding.
- **Hover State**: Subtle `-2px` Y-axis translation and an increased shadow.
- **Header**: Flex container, aligned center, with an 18px title. Often has an action button on the right.
- **KPI Cards**: Simplified cards specifically for metrics, using a 16px padding, a 30px bold value, and a 14px title.

---

## Tables

- **Structure**: `100%` width, collapsed borders.
- **Headers (`th`)**: Light red background (`var(--accent-red-light)`), red text (`var(--accent-red)`), 16px vertical padding, 24px horizontal padding, 12px font size, semibold.
- **Rows (`td`)**: 16px vertical padding, 24px horizontal padding, bottom border (`1px solid var(--border-color)`).
- **Hover**: Table rows change to `var(--bg-color)` on hover.
- **Last Row**: The bottom border is removed on the last row.

---

## Navigation

### Topbar (Header)
- **Height**: 80px
- **Background**: `var(--bg-color)`
- **Border**: Bottom border (`1px solid var(--border-color)`)
- **Tabs (`.header-tabs`)**: Inline navigation tabs within the header. Tabs are pill-shaped (20px radius), white background, with active states transitioning to dark primary text background and white text.

### Sidebar
- Contains navigation items (`.nav-item`) with 8px border radius, 12px padding, and 14px font size.
- Active states use the light red background with red text and icon stroke.

---

## Status System (Badges)

Always use semantic status pills for states. 
Pills have a 20px border radius, 6px 12px padding, and 12px semibold font.

- **Delivered / Completed**: Green (`--success-green-light` background, `--success-green` text)
- **Transit / Setup**: Orange (`--warning-orange-light` background, `--warning-orange` text)
- **Processing / Running**: Blue (`#E3F2FD` background, `#1976D2` text)
- **Out / Delayed / Error**: Red (`--accent-red-light` background, `--accent-red` text)
- **Pending / Idle**: Gray (`#E2E3E5` background, `#383D41` text)

---

## Icons

- **Library**: `lucide-react`
- **Standard Size**: `16px` for inline tabs and buttons, `18px` for header actions, `20px` for sidebar nav, `24px` for prominent icons.
- **Color**: Inherits from text color (currentColor) unless semantically colored (e.g., green for success).

---

## Component Inventory

When building new features, reuse these structural classes and concepts:

- **`.app-container`**: Root layout shell.
- **`.main-wrapper`**: Right-side content area (holds header and scrollable content).
- **`.top-header`**: Standard page header. Includes `.header-title` and `.header-tabs`.
- **`.content-scroll`**: The scrollable body of the page.
- **`.card`**: Standard container for widgets, charts, and tables.
- **`.status-pill`**: Used for all status indicators.
- **`.progress-container` / `.progress-fill`**: Standard progress bars.
- **`.matrix-table`**: Used for complex data grids (e.g., job readiness).

---

## UI Rules & Strict Guidelines

1. **Never hardcode colors.** Always use `var(--color-name)`.
2. **Never hardcode spacing or padding.** Stick to the 8pt grid (8, 16, 24, 32).
3. **Never use inline styles for layout if a class exists.** Use standard Tailwind utility classes or global CSS classes.
4. **Always use design tokens.** Rely on the root variables for borders, backgrounds, and text.
5. **Always reuse existing components.** If you need a card, use the `.card` class or standard layout structure. Do not rebuild standard UI elements.
6. **Every new page must use the standard Layout.** Specifically, `Header` at the top and `.content-scroll` for the body. Sub-navigation MUST live in the `Header` tabs, not as separate full-width bars below the header.
7. **Every table must follow the global table styles.** Do not reinvent table headers or row hovers.

---

## Future Development Checklist

Before any page or feature is considered complete, it MUST satisfy this checklist:

- [ ] Uses shared `.content-scroll` and `Header` layout.
- [ ] Sub-navigation (if any) is integrated into `Header` tabs.
- [ ] Uses shared spacing tokens (8pt scale).
- [ ] Uses shared typography and text color variables.
- [ ] Uses shared `.card` styling for content blocks.
- [ ] Uses shared `.status-pill` for statuses.
- [ ] No duplicated layout components.
- [ ] No inline CSS for standardized styles (colors, borders, shadows).
- [ ] Responsive grid behavior is maintained.
- [ ] Matches the overall design language of the Work Orders and Jobs pages.
