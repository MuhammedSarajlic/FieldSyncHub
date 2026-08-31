---
version: 1
slug: "frontend-src-pages-quotes-quotes-tsx"
primary_target: "frontend/src/pages/quotes/Quotes.tsx"
related_targets:
  - "frontend/src/components/Quotes/QuotesModals/NewQuoteModal.tsx"
  - "frontend/src/pages/quotes/QuoteDetails.tsx"
  - "frontend/src/components/Quotes/QuoteNotes/QuoteNote.tsx"
  - "frontend/src/components/Quotes/QuoteAttachments/QuoteAttachments.tsx"
---

Scope: the Quotes register, create-quote editor, and individual quote work surface.

Mode: Operate.

Audience: field service owners and office staff preparing estimates and following customer decisions.

Job: scan pipeline value, create a complete draft, open a quote, reconcile its totals, review customer context and history, then send or advance the work.

Proof: live quote counts, values, conversion rate, customer, service address, dates, status, expiry/follow-up, and total from the existing API.

Constraints: preserve existing API routes; never fabricate trends; support keyboard use and mobile widths; keep the document editor usable without horizontal scrolling.

Direction: The Working Register, a contemporary contractor job-folder and approval register. Its memorable moment is the connected pipeline and lifecycle registers resolving directly into the estimate ledger.

Unresolved: no per-status counts or historical comparison exists in the current statistics response.
