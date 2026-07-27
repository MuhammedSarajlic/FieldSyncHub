# FieldSyncHub — Product Roadmap & Gap Analysis

_Last updated: 2026-07-27_

This document is the honest audit of where FieldSyncHub stands today versus what
Jobber / Housecall Pro / ServiceTitan actually sell, plus the sequenced plan to
close that gap. It is meant to be edited as work lands — check items off, add
notes, re-prioritize.

---

## 1. Where the app stands today

### What genuinely works (real data, real endpoints, end-to-end)

| Area | State | Notes |
|---|---|---|
| Auth | ✅ Working | JWT access token + HttpOnly refresh cookie, BCrypt, password reset via SendGrid, 8-char minimum enforced client + server |
| Workspaces & onboarding | ✅ Working | `/workspace` onboarding flow, employee invites by email |
| Customers | ✅ Working | CRUD, multiple emails/phones, multiple properties, tags, notes, custom fields, CSV import |
| Leads | ✅ Working | List + detail + status/priority + notes (detail page built recently) |
| Quotes | ✅ Working | CRUD, line items, discounts, tax, activity history, notes, attachments, PDF generation, convert-to-job |
| Jobs | ✅ Working | CRUD, line items, status/priority, assignment, filters, pagination, stats |
| Invoices | ✅ Working | CRUD, line items, terms/due-date calculation, PDF, stats |
| Pricebook | ✅ Working | Service & material items, categories, cost/price |
| Calendar | ✅ Working | Events + jobs, recurrence rules stored |
| Employees | ✅ Working | CRUD, invite flow, availability, stats |
| Reports | ✅ Working | Real aggregate dashboard (revenue, conversion, outstanding, job/quote/invoice/customer/lead/team breakdowns) |
| Home dashboard | ✅ Working | Real job/invoice stats, upcoming schedule |

That is a genuinely solid core. The data model in [backend/Models/](backend/Models/)
is well thought out — `Job` alone already carries `ArrivalWindow`,
`EstimatedDurationMinutes`, `DepositAmount`, `SendReminder`,
`ReminderDaysBefore`, `ConfirmationSent`, `ReminderSent`, `InvoiceSent`,
`RecurrenceRuleId`, `Source`, `Tags`. **Most of what's missing is behavior behind
fields that already exist.**

### What is fake or stubbed

| Page | Reality |
|---|---|
| [Dispatch.tsx](frontend/src/pages/Dispatch.tsx) | 891 lines of hardcoded technicians/jobs, ends in `<PageUnderDevelopment />`. Not in the sidebar at all. |
| [Marketing.tsx](frontend/src/pages/Marketing.tsx) | 596 lines of hardcoded campaigns, ends in `<PageUnderDevelopment />` |
| Help & Support | Sidebar slug is `help-support`, the route is `support`, and it renders `<Settings />`. Dead link. |

### Structural problems

- **The API is effectively unauthenticated.** Only [UserController.cs:28](backend/Controllers/UserController.cs#L28)
  has `[Authorize]`. Every other controller — jobs, invoices, customers, quotes,
  employees, workspaces — is wide open. Anyone who knows a workspace GUID can read
  or write another company's entire book of business. This is the single most
  important thing in this document.
- **No workspace scoping from the token.** Workspace IDs come from the URL, not
  from the caller's identity, so even after adding `[Authorize]` a logged-in user
  of company A could pass company B's GUID.
- **Roles are decorative.** `UserRole.Owner/Admin/Employee` exists and is issued
  as a JWT claim, but nothing anywhere checks it. An employee can delete the
  workspace's invoices.
- **Live secrets are committed to git.** [backend/appsettings.json](backend/appsettings.json)
  is tracked and contains a real SendGrid API key and the JWT signing secret.
- **Zero automated tests.** No test project on either side.
- **No background job runner.** No `IHostedService`, no Hangfire/Quartz. Every
  "send a reminder / generate the next recurring job / mark overdue" field in the
  model is inert.
- **No error boundary in React.** One component throwing during render blanks the
  whole app (this caused the Quote Details blank-screen bug).
- **Sidebar icons load from `api.iconify.design` over the network** ([constants/sidebar.ts](frontend/src/constants/sidebar.ts))
  even though the app already depends on `lucide-react`. Offline / slow network =
  no icons.

---

## 2. The gap vs Jobber & Housecall Pro

Ranked by how much a plumbing/HVAC/electrical owner would miss it.

### Tier 1 — the app is not sellable without these

| Gap | Why it matters |
|---|---|
| **Get paid** | There is no payment processing anywhere. No Stripe, no card-on-file, no "Pay now" link, no partial payments, no payment records. Housecall Pro's entire pitch is "get paid faster." `Invoice.IsPaid` is a bare boolean with no ledger behind it. |
| **Send anything to a customer** | Quotes and invoices generate PDFs but there is **no endpoint that emails them**. `SendCustomerMail` exists for ad-hoc mail only. A quote can be "Sent" in status while nothing was actually sent. |
| **Customer-facing portal** | Customers cannot view a quote, approve it, view an invoice, or pay. Every competitor has a public magic-link page. `QuoteStatus.AwaitingApproval` is unreachable in practice. |
| **Mobile / technician experience** | The whole UI is `ml-64` fixed sidebar, desktop-only. Technicians work from phones in a van. There is no field view at all. |
| **Automated notifications** | `SendReminder`, `ReminderDaysBefore`, `ConfirmationSent`, `ReminderSent`, `InvoiceSent` are all stored and never acted on. No appointment confirmations, no "on my way," no reminders. |

### Tier 2 — expected by anyone comparing to Jobber

| Gap | Why it matters |
|---|---|
| **Real dispatch board** | Drag-and-drop assignment of jobs to technicians across a day/week timeline. The page exists as a mockup only. |
| **Recurring jobs** | `Job.JobType.Recurring` and `RecurrenceRuleId` exist; nothing generates the occurrences. Maintenance contracts are a huge revenue line for HVAC/lawn. |
| **Time tracking** | No clock-in/clock-out, no travel vs on-site time, no labor cost per job. There is no model for it. |
| **Job photos & signatures** | Supabase storage is wired for note files, but jobs have no before/after photo gallery and no customer signature capture on completion. |
| **Scheduling intelligence** | No availability check, no double-booking prevention, no arrival windows surfaced in the UI, no travel time. |
| **Routing / map** | `leaflet` and `react-leaflet` are installed and essentially unused. No day route optimization. |

### Tier 3 — differentiators and polish

| Gap | Why it matters |
|---|---|
| **Online booking widget** | Embeddable "request service" form that creates a Lead. Cheap to build, directly drives revenue, `Job.Source` already exists for attribution. |
| **Review requests** | Auto-ask for a Google review after job completion. Housecall Pro sells this hard. |
| **Real marketing** | Replace the mockup with email campaigns to customer segments, using the SendGrid integration that already exists. |
| **Deeper reporting** | Current Reports page is a good snapshot but has no time dimension. No revenue-over-time, no per-technician performance, no job profitability (`LineItem.Cost` is captured but never reported against). |
| **Inventory / materials** | `ServiceItemType.Material` exists with no stock levels or usage tracking. |
| **Accounting sync** | QuickBooks/Xero export or integration. Table stakes at the top end. |
| **Global search** | No way to find a customer/job/invoice from one box. |
| **Notifications in-app** | No notification center, no activity feed across the workspace. |
| **Audit log** | `ActivityHistory` exists only on Quote. Nothing workspace-wide. |

---

## 3. The plan

### Phase 0 — Security & correctness (do this before anything else)

Nothing else matters if the API is open. This phase is small and mostly mechanical.

- [ ] Rotate the leaked SendGrid API key and JWT signing secret. Assume both are compromised.
- [ ] Remove `appsettings.json` / `appsettings.Development.json` from git tracking, add to `.gitignore`, ship an `appsettings.example.json`.
- [ ] Add `[Authorize]` to every controller. Make it the default via a global filter so new controllers are secure by default, then opt specific endpoints out with `[AllowAnonymous]` (auth, invite-accept, future public portal).
- [ ] Add a `ICurrentUser` service reading `WorkspaceId` / `UserId` / `Role` from JWT claims. Stop taking `workspaceId` from the URL — derive it. Where the route shape must stay, validate the URL value against the claim and 403 on mismatch.
- [ ] Add `WorkspaceId` to the JWT claims (currently the token carries role but not workspace).
- [ ] Enforce roles: `Owner`/`Admin` for delete, financial edits, employee management, workspace settings.
- [ ] Add a global exception handler middleware returning a consistent `ApiResponse` shape instead of raw 500s.
- [ ] Add a React error boundary at the route level so a render crash shows a recovery UI instead of a blank page.
- [ ] Add a backend test project (xUnit + `WebApplicationFactory` + Testcontainers or SQLite) and cover auth, workspace isolation, and the money math (`Job.TotalAmount`, `Invoice.Total`, `Quote.Total` — note these three compute discount/tax in three different ways and should be unified).

**Why first:** these are cheap, they're prerequisites for a public customer portal
(which will expose endpoints to the internet), and shipping payments on an open
API would be reckless.

---

### Phase 1 — Close the money loop

This is the phase that turns the app from a record-keeper into something a
business owner pays for.

**1.1 Send quotes and invoices for real**
- [ ] `POST /api/quote/{id}/send` — renders the existing QuestPDF output, emails it via SendGrid, sets `SentAt`, flips status to `Sent`, writes `ActivityHistory`.
- [ ] `POST /api/invoice/{id}/send` — same, plus sets `Status = Sent`.
- [ ] Branded HTML email templates using `Workspace.LogoUrl`, `CompanyName`, `PhoneNumber`.
- [ ] Track opens/views: `Quote.Viewed` / `ViewedAt` already exist — set them from the portal.

**1.2 Public customer portal (no login, signed magic links)**
- [ ] New `PortalController` with `[AllowAnonymous]`, addressed by a signed, expiring token — never a raw GUID.
- [ ] `/portal/quote/{token}` — view quote, **Approve** / **Decline** with an optional message. Approval flips `QuoteStatus.Approved` and notifies the owner.
- [ ] `/portal/invoice/{token}` — view invoice, **Pay now**.
- [ ] `/portal/job/{token}` — appointment confirmation + "reschedule request."
- [ ] These pages must be mobile-first and carry the workspace's branding, not FieldSyncHub's.

**1.3 Payments**
- [ ] Add a `Payment` model: `Id`, `InvoiceId`, `Amount`, `Method` (Card/ACH/Cash/Check/Other), `Status`, `ProcessorReference`, `PaidAt`, `RecordedByUserId`.
- [ ] Stripe integration: PaymentIntents for card payments from the portal, webhook handler for confirmation.
- [ ] Manual payment recording (cash/check) from the invoice detail page — many jobs still get paid this way.
- [ ] Partial payments and balance-due: replace the `Invoice.IsPaid` boolean with `AmountPaid` / `BalanceDue` computed from the `Payment` ledger. Keep `Status` derived, not hand-set.
- [ ] Deposits: `Job.DepositAmount` exists — collect it at booking.
- [ ] Wire real numbers into the Reports page (currently "paid this month" is inferred, not ledgered).

**1.4 Background worker**
- [ ] Add a hosted service (start with `IHostedService` + a timer; graduate to Hangfire if it grows).
- [ ] Appointment confirmations on job creation, reminders `ReminderDaysBefore` ahead — the fields are already there.
- [ ] Auto-flip invoices to `Overdue` past `DueDate` and send a dunning sequence.
- [ ] Expire quotes past `ExpiresAt`.
- [ ] Generate recurring job occurrences from `RecurrenceRule`.

**Outcome of Phase 1:** a quote can be emailed, approved by the customer, turned
into a job, invoiced, and paid by card — without anyone leaving the product. That
is the Housecall Pro core loop.

---

### Phase 2 — The field

**2.1 Mobile / technician view**
- [ ] Make the app responsive: the `ml-64` fixed-sidebar shell needs a mobile drawer. This affects every page.
- [ ] A dedicated technician route (`/my-day`) — today's jobs, tap for details, directions, customer phone, job notes.
- [ ] Consider a PWA manifest + service worker for install-to-home-screen and basic offline read. Full offline sync is a large project; don't start there.

**2.2 Time tracking**
- [ ] `TimeEntry` model: `JobId`, `EmployeeId`, `ClockIn`, `ClockOut`, `Type` (Travel/OnSite/Break), `Notes`.
- [ ] Clock in/out from the job detail and the technician day view.
- [ ] Roll labor hours × cost rate into job profitability (`Employee` needs an hourly cost field).

**2.3 Job completion quality**
- [ ] Photo attachments on jobs (before/after) via the existing Supabase storage helpers in [frontend/src/storage/](frontend/src/storage/).
- [ ] Customer signature capture on completion.
- [ ] Required checklist / completion notes before a job can be marked `Completed`.
- [ ] Auto-generate the invoice on completion when `Job.SendInvoice` is set — the flag exists and does nothing.

**2.4 Real dispatch board**
- [ ] Replace the [Dispatch.tsx](frontend/src/pages/Dispatch.tsx) mockup with a live timeline: technicians as rows, hours as columns, jobs as draggable blocks.
- [ ] Drag to assign / reschedule, writing through to `Job.AssignedTeamMembers` and `StartDateTime`.
- [ ] Unassigned queue on the side.
- [ ] Conflict detection (double-booking, outside working hours).
- [ ] Map view using the already-installed leaflet: today's jobs as pins, per-technician route.
- [ ] **Add Dispatch to the sidebar** — the route exists but is unreachable from the nav.

---

### Phase 3 — Growth features

- [ ] **Online booking widget** — a public, embeddable form that creates a `Lead` with `Source` set. Highest revenue-per-hour-of-work item on this list.
- [ ] **Review requests** — post-completion email/SMS asking for a Google review.
- [ ] **Real marketing page** — replace the mockup: customer segments (by tag, by last-service-date, by service type), email campaigns via SendGrid, basic open/click stats. Delete the hardcoded sample data.
- [ ] **SMS** — Twilio for reminders, "on my way," and quote/invoice links. SMS massively outperforms email in this industry.
- [ ] **Global search** — one box, across customers/jobs/quotes/invoices.
- [ ] **Notification center** — in-app activity feed; workspace-wide `ActivityHistory` rather than quote-only.
- [ ] **Reporting with a time dimension** — revenue by month, jobs by month, technician performance, job profitability using `LineItem.Cost` vs `UnitPrice` (the data is already captured, nothing reports on it), quote win rate over time, customer lifetime value.

---

### Phase 4 — Scale & integrations

- [ ] QuickBooks Online / Xero sync (customers, invoices, payments).
- [ ] Inventory tracking for `ServiceItemType.Material` — stock levels, low-stock alerts, consumption per job.
- [ ] Purchase orders and vendor management.
- [ ] Multi-location / franchise support.
- [ ] Custom quote & invoice templates.
- [ ] Public API + webhooks.
- [ ] Zapier integration.

---

## 4. Things to change or remove

| Item | Action |
|---|---|
| [Dispatch.tsx](frontend/src/pages/Dispatch.tsx) hardcoded arrays | Delete when the real board lands. Don't ship mock data behind a "coming soon" banner. |
| [Marketing.tsx](frontend/src/pages/Marketing.tsx) hardcoded arrays | Same. |
| `mockUser` in [Sidebar.tsx](frontend/src/components/Sidebar/Sidebar.tsx) | Dead code, remove. |
| Sidebar icons from `api.iconify.design` | Switch to `lucide-react` (already a dependency) — kills a network dependency and matches the rest of the app after the earlier icon consolidation. |
| `help-support` slug vs `support` route → renders `<Settings />` | Either build a real support page or point it at docs. Currently a dead nav item. |
| Duplicate `<Route path='workspace'>` in [App.tsx](frontend/src/App.tsx#L58) | Declared twice, lines 58 and 62. Remove one. |
| `jobsd` route ([App.tsx:71](frontend/src/App.tsx#L71)) | Leftover dev route, remove. |
| Three different total/discount/tax implementations (`Job`, `Invoice`, `Quote`) | Unify into one shared calculation. `Invoice.Subtotal` also reads `ServiceItem.UnitPrice` in preference to the line item's own price, which the other two don't — that's a real inconsistency waiting to become a billing bug. |
| `Invoice.IsPaid` boolean | Replace with a derived value over the `Payment` ledger in Phase 1.3. |
| `Console.WriteLine` logging throughout services | Replace with `ILogger`. |
| `frontend: "file:"` self-dependency in [package.json](frontend/package.json) | Nonsense entry, remove. |

---

## 5. Suggested sequencing

If the goal is "something a real HVAC company would pay for," the shortest
credible path is:

1. **Phase 0** — a week or so. Non-negotiable prerequisite.
2. **Phase 1.1 + 1.2** — send quotes/invoices, customer approves online. This alone changes how the product feels.
3. **Phase 1.3** — Stripe. This is the moment it becomes a business tool rather than a database.
4. **Phase 1.4** — the worker. Small effort, and it activates a dozen model fields that are currently dead weight.
5. **Phase 2.1** — mobile. Without it the field half of "field service" doesn't exist.
6. Then Phase 2.4 (dispatch) and Phase 3.1 (online booking) — the two most visible "this is a real product" features.

Everything in Phase 4 can wait until there are paying users asking for it.

---

## 6. Open questions to decide

- **Payments processor** — Stripe is the obvious default (best API, best docs). Housecall Pro uses its own processing for margin; that's a business decision, not a technical one.
- **SMS** — Twilio, and is it worth the per-message cost at this stage?
- **Offline mobile** — PWA with read-only offline, or a real React Native app later? The PWA is far cheaper and probably enough at this stage.
- **File storage** — Supabase is currently used ad-hoc from the frontend. Should uploads be proxied through the backend so access control applies? (Right now the frontend holds the storage credentials.)
- **Multi-tenancy strategy** — shared database with a `WorkspaceId` column is the current model and is fine; it just needs to actually be enforced (Phase 0). Consider EF Core global query filters so scoping can't be forgotten in a new query.
