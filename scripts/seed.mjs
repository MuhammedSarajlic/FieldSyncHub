// Populates the FieldSyncHub database with realistic demo data by calling
// the real backend REST API (not raw SQL), so everything goes through the
// same validation and business logic the app itself uses.
//
// Usage:
//   node scripts/seed.mjs
//   SEED_BASE_URL=http://localhost:5244/api node scripts/seed.mjs
//
// Requires Node 20+ (native fetch) and the backend running (docker compose
// up, or `dotnet run` locally). Run scripts/reset-db.sql first if you want
// a clean slate before seeding.

const BASE_URL = process.env.SEED_BASE_URL ?? 'http://localhost:5244/api';
const DEMO_PASSWORD = 'DemoPassword123!';

const CompanySize = { Solo: 0, Small: 1, Medium: 2, Large: 3 };
const PhoneType = { Work: 0, Mobile: 1, Home: 2, Other: 3 };
const JobType = { OneTime: 0, Recurring: 1 };
const JobStatus = { Scheduled: 0, Dispatched: 1, InProgress: 2, Completed: 3, Canceled: 4 };
const JobPriority = { Low: 0, Normal: 1, High: 2, Urgent: 3 };
const PaymentStatus = { Unpaid: 0, Partial: 1, Paid: 2, Refunded: 3 };
const DiscountType = { Percentage: 0, FixedAmount: 1 };
const QuoteStatus = { Draft: 0, Sent: 1, AwaitingResponse: 2, AwaitingApproval: 3, Approved: 4, Declined: 5, Expired: 6, ConvertedToJob: 7 };
const LeadPriority = { Low: 0, Normal: 1, High: 2, Urgent: 3 };

async function api(method, path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = text;
  }
  if (!res.ok) {
    throw new Error(
      `${method} ${path} -> ${res.status}: ${JSON.stringify(json)}`
    );
  }
  return json;
}

function daysFromNow(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

function pick(arr, i) {
  return arr[i % arr.length];
}

const FIRST_NAMES = ['Alex', 'Jordan', 'Sam', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Jamie', 'Drew', 'Avery'];
const LAST_NAMES = ['Johnson', 'Smith', 'Williams', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor', 'Anderson'];
const STREETS = ['Maple St', 'Oak Ave', 'Cedar Ln', 'Pine Rd', 'Elm St', 'Birch Way', 'Willow Dr'];
const CITIES = [
  { city: 'Springfield', state: 'IL', postalCode: '62701' },
  { city: 'Franklin', state: 'TN', postalCode: '37064' },
  { city: 'Georgetown', state: 'TX', postalCode: '78626' },
];

const WORKSPACES = [
  {
    ownerFirstName: 'Marcus',
    ownerLastName: 'Reed',
    email: 'marcus.reed@demo.fieldsync.local',
    companyName: 'Reed Plumbing Co',
    workspaceName: "Reed's Workspace",
    category: 'Plumbing Services',
    phoneNumber: '5551230001',
    size: CompanySize.Small,
    customerCount: 6,
  },
  {
    ownerFirstName: 'Elena',
    ownerLastName: 'Vasquez',
    email: 'elena.vasquez@demo.fieldsync.local',
    companyName: 'Vasquez Electrical',
    workspaceName: "Vasquez's Workspace",
    category: 'Electrical Services',
    phoneNumber: '5551230002',
    size: CompanySize.Solo,
    customerCount: 4,
  },
];

async function seedWorkspace(config, index) {
  console.log(`\n=== Seeding workspace: ${config.companyName} ===`);

  const registerRes = await api('POST', '/auth/register', {
    email: config.email,
    password: DEMO_PASSWORD,
    firstName: config.ownerFirstName,
    lastName: config.ownerLastName,
  });
  const userId = registerRes.user.id;
  console.log(`User created: ${config.email} (${userId})`);

  const workspaceRes = await api('POST', `/workspace/${userId}`, {
    name: config.workspaceName,
    companyName: config.companyName,
    companyUrl: '',
    phoneNumber: config.phoneNumber,
    size: config.size,
    createdByUserId: userId,
    logoUrl: '',
    theme: 'light',
    category: config.category,
  });
  const workspaceId = workspaceRes.payload.id;
  console.log(`Workspace created: ${config.workspaceName} (${workspaceId})`);

  const customers = [];
  for (let i = 0; i < config.customerCount; i++) {
    const firstName = pick(FIRST_NAMES, index * 10 + i);
    const lastName = pick(LAST_NAMES, index * 7 + i);
    const location = pick(CITIES, i);
    const customerRes = await api('POST', '/customer', {
      workspaceId,
      firstName,
      lastName,
      companyName: '',
      displayName: `${firstName} ${lastName}`,
      emails: [`${firstName.toLowerCase()}.${lastName.toLowerCase()}${index}${i}@example.com`],
      isReceiveJobNotifications: true,
      isReceiveQuoteNotifications: true,
      isReceiveInvoiceNotifications: true,
      customerPhones: [
        {
          phoneType: PhoneType.Mobile,
          phoneNumber: `555${(1000 + i).toString().padStart(4, '0')}`,
          isReceiveMessage: true,
        },
      ],
      properties: [
        {
          street: `${100 + i} ${pick(STREETS, i)}`,
          city: location.city,
          state: location.state,
          postalCode: location.postalCode,
          country: 'USA',
          isBillingAddress: true,
        },
      ],
    });
    const customer = customerRes.payload;
    customers.push(customer);
    console.log(`  Customer: ${customer.displayName}`);
  }

  const lineItem = (name, unitPrice, quantity = 1) => ({
    name,
    description: `${name} - standard service`,
    unitPrice,
    cost: Math.round(unitPrice * 0.4),
    quantity,
    isTaxable: true,
    isOptional: false,
  });

  for (let i = 0; i < customers.length; i++) {
    const customer = customers[i];
    const property = customer.properties?.[0];

    // Job — mix of scheduled/completed
    const jobStatus = i % 3 === 0 ? JobStatus.Completed : JobStatus.Scheduled;
    await api('POST', '/job', {
      workspaceId,
      title: `${config.category.split(' ')[0]} service for ${customer.displayName}`,
      description: 'Routine service call',
      customerId: customer.id,
      propertyId: property?.id ?? null,
      jobType: JobType.OneTime,
      lineItems: [lineItem('Service call', 150)],
      status: jobStatus,
      statusHistory: [],
      priority: pick([JobPriority.Normal, JobPriority.Low, JobPriority.High], i),
      startDateTime: daysFromNow(i - 3),
      endDateTime: daysFromNow(i - 3),
      estimatedDurationMinutes: 60,
      assignedTeamMembers: [],
      paymentStatus: jobStatus === JobStatus.Completed ? PaymentStatus.Paid : PaymentStatus.Unpaid,
      discountType: DiscountType.Percentage,
      discountValue: 0,
      taxRate: 8.25,
      sendInvoice: false,
      sendReminder: false,
      reminderDaysBefore: 1,
      confirmationSent: false,
      reminderSent: false,
      invoiceSent: false,
      createdBy: config.ownerFirstName,
      tags: [],
    });

    // Quote — mix of statuses
    const quoteStatus = pick(
      [QuoteStatus.Draft, QuoteStatus.Sent, QuoteStatus.Approved, QuoteStatus.AwaitingResponse],
      i
    );
    await api('POST', '/quote', {
      workspaceId,
      customerId: customer.id,
      createdByUserId: userId,
      status: quoteStatus,
      title: `Estimate for ${customer.displayName}`,
      propertyId: property?.id ?? '00000000-0000-0000-0000-000000000000',
      lineItems: [lineItem('Parts and labor', 320)],
      discountType: DiscountType.Percentage,
      discountValue: 0,
      taxRate: 8.25,
    });

    // Invoice — mix of recent/overdue due dates
    await api('POST', '/invoice', {
      customerId: customer.id,
      workspaceId,
      propertyId: property?.id ?? '00000000-0000-0000-0000-000000000000',
      jobId: null,
      title: `Invoice for ${customer.displayName}`,
      lineItems: [lineItem('Service call', 150)],
      taxRate: 8.25,
      discount: 0,
      discountType: DiscountType.Percentage,
      issueDate: daysFromNow(-10 + i),
      dueDate: daysFromNow(i % 2 === 0 ? -2 : 14),
      paymentTerms: 'Net 14',
      notes: '',
      internalNotes: '',
    });

    // Lead — only for about half the customers
    if (i % 2 === 0) {
      await api('POST', '/lead', {
        customerId: customer.id,
        workspaceId,
        description: `Interested in ${config.category.toLowerCase()}`,
        priority: pick([LeadPriority.Normal, LeadPriority.High, LeadPriority.Low], i),
        notes: 'Follow up next week',
        lineItems: [],
      });
    }

    console.log(`  Job + Quote + Invoice${i % 2 === 0 ? ' + Lead' : ''} created for ${customer.displayName}`);
  }

  return { email: config.email, password: DEMO_PASSWORD, workspaceName: config.workspaceName };
}

async function main() {
  console.log(`Seeding against ${BASE_URL} ...`);
  const created = [];
  for (let i = 0; i < WORKSPACES.length; i++) {
    created.push(await seedWorkspace(WORKSPACES[i], i));
  }

  console.log('\n=== Done ===');
  console.log('Log in with any of these accounts:');
  for (const c of created) {
    console.log(`  ${c.email} / ${c.password}  (${c.workspaceName})`);
  }
}

main().catch((err) => {
  console.error('\nSeed failed:', err.message);
  process.exit(1);
});
