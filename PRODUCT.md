# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Field service business owners, office managers, and dispatchers who coordinate customers, quotes, jobs, technicians, invoices, and payments. They repeatedly scan operational records and need to move work forward quickly from an office computer or a phone in the field.

## Product Purpose

FieldSyncHub brings the customer-to-payment workflow into one workspace. Success means a team can turn an enquiry into a quote, approved work, a scheduled job, an invoice, and a recorded payment without losing the history between those steps.

## Positioning

The product connects commercial documents directly to field operations: quote decisions become scheduled work, and completed work becomes collectible invoices inside the same customer history.

## Operating Context

Users work with customer records, service properties, pricebook line items, quotes, jobs, calendars, technician assignments, invoices, payments, attachments, and activity history. The interface is used for frequent scanning, filtering, follow-up, and record creation rather than occasional presentation.

## Capabilities and Constraints

- Workspaces isolate company data and carry company identity, currency, tax, payment terms, and timezone settings.
- Quotes have customers, service properties, assignees, statuses, expiry dates, line items, totals, notes, attachments, and activity history.
- Quotes can be created, searched, filtered, sent, approved, converted to jobs, archived, and opened through a customer portal.
- Quote list statistics currently expose total count, total value, approved value, and conversion rate. The UI must not fabricate comparisons or trends the API does not provide.
- Existing backend endpoints and established route behavior must continue to work during frontend redesigns.

## Brand Commitments

The product name is FieldSyncHub. The product should feel credible, direct, and work-focused. The user has explicitly allowed replacement of the old visual implementation and does not require its layout to be preserved.

## Evidence on Hand

The repository contains the live entity models, API services, quote workflows, and seeded development data. There are no confirmed testimonials, benchmarks, or customer claims, so interfaces must not invent them.

## Product Principles

- Put the next operational decision ahead of decorative reporting.
- Keep financial values and document states unambiguous and honest.
- Preserve the full trail from customer request through payment.
- Make repeated actions fast on desktop and usable on mobile.
- Prefer clear recovery and empty states over dead ends.

## Accessibility & Inclusion

Core workflows must remain keyboard operable, expose meaningful accessible names and landmarks, communicate status with text and iconography in addition to color, and retain visible focus states.
