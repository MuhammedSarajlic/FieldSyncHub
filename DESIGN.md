---
name: FieldSyncHub
description: A precise operations register for field service teams.
---

# Design System: FieldSyncHub

## Overview

**Creative North Star: "The Working Register"**

FieldSyncHub should feel like the dependable register kept beside a dispatcher: current, legible, and ready for action. The visual world draws from contractor job folders, document indexes, approval marks, and well-maintained office ledgers, translated into a contemporary web application rather than reproduced as decoration.

Information density is useful when hierarchy remains obvious. Broad neutral work surfaces hold the records; deep evergreen identifies committed actions; restrained amber marks work requiring attention. Status, selection, and progress must remain understandable without relying on color alone.

**Key Characteristics:**
- Connected work surfaces instead of collections of floating cards.
- Tabular figures and aligned columns for financial information.
- Compact controls with generous page-level breathing room.
- Clear state marks, document references, and visible next actions.

## Colors

Use a restrained palette of cool paper neutrals, near-black ink, evergreen action color, and a small amount of amber for attention.

### Primary
- **Committed Evergreen** (#0D5944): Primary actions, active tabs, focus treatment, and selected navigation.
- **Deep Evergreen** (#084936): Hover state for committed actions.

### Secondary
- **Attention Amber** (amber-800 on amber-50): Expiry and follow-up states that need action.

### Neutral
- **Cool Paper** (#F3F6F4): Operational page background.
- **Register White** (#FFFFFF): Primary work surfaces and table rows.
- **Near-Black Ink** (#17211D): Headings, values, and primary record text.
- **Muted Ledger Ink** (#65736C): Explanatory copy and secondary metadata.
- **Register Rule** (#D6DED9): Container edges and structural dividers.

**The Honest Accent Rule.** Evergreen means an action or confirmed positive state; amber means attention. Neither is scattered decoratively.

## Typography

Use Inter with the system sans-serif fallback for interface copy and tabular numerals for money, dates, and document numbers. Page headings use 30px semibold type; work-surface headings use 16px semibold; body and controls use 14px. Hierarchy comes from weight and spacing, not oversized display typography.

**The Register Rule.** Financial values and identifiers align consistently and never use ornamental type.

## Layout

Pages use a constrained operational canvas up to 1600px with 16px mobile, 24px tablet, and 32px desktop gutters. Summary information forms a connected horizontal register above the primary work surface. Desktop tables preserve comparison across rows; below 768px each row becomes a compact document sheet with the same information order.

## Elevation & Depth

The system is flat by default. Tonal surfaces and single borders establish structure; a small offset shadow appears only for overlays and active menus.

**The Desk Rule.** A resting record belongs on the work surface and does not float above it.

## Shapes

Containers use modest corners no more than 8px. Pills are reserved for status and numeric filter counts. Tabs and table rows use squared alignment to reinforce the register.

## Components

### Buttons
- Primary actions use Committed Evergreen, 8px corners, 44px height, white semibold text, and a small offset shadow.
- Secondary controls use a Register Rule border on white with 8px corners and no resting shadow.

### Status Marks
- Status uses a text label, a Lucide icon, a light tonal field, and a 1px border. Color never carries state alone.

### Registers
- Summary registers and record tables share one outer border. Internal dividers connect related information without producing nested cards.

## Do's and Don'ts

### Do:
- **Do** place the operational list before secondary explanation.
- **Do** make selection, filtering, sorting, and follow-up state visible.
- **Do** use real customer, document, and financial data from the API.

### Don't:
- **Don't** fabricate trends, comparisons, or performance claims.
- **Don't** stack cards inside cards or use oversized KPI tiles.
- **Don't** communicate document status through color alone.
