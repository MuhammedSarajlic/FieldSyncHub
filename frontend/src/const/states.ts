import { TAddInvoice } from '../types/Invoice';

export const customerInitialState = {
  customerId: '',
  firstName: '',
  lastName: '',
  companyName: '',
  isCompany: false,
  email: [],
  visitReminders: true,
  jobFollowUps: true,
  quoteFollowUps: true,
  invoiceFollowUps: true,
  archived: false,
  tags: [],
  properties: [],
  customerPhones: [],
  customFields: [],
  notes: [],
};

export const addCustomerInitialState = {
  firstName: '',
  lastName: '',
  companyName: '',
  isCompany: false,
  email: [],
  visitReminders: true,
  jobFollowUps: true,
  quoteFollowUps: true,
  invoiceFollowUps: true,
  properties: [],
  customerPhones: [],
  customFields: [],
};

export const initialPropertyState = {
  id: '',
  street: '',
  city: '',
  state: '',
  country: '',
  postalCode: '',
  isBillingAddress: true,
  customerId: '',
};

export const initialNoteState = {
  createdBy: '',
  createdAt: '',
  noteText: '',
  pathFile: '',
  customerId: '',
};

export const addServiceItemInitialState = {
  name: '',
  description: '',
  type: 'service',
  category: '',
  sku: '',
  unitPrice: 0,
  cost: 0,
  taxRate: 0,
  isTaxable: true,
  isActive: true,
  imageUrl: '',
};

export const addJobInitialState = {
  title: '',
  description: '',
  customerId: '',
  propertyId: '',
  jobType: 'one-time',
  repeats: '',
  lineItems: [],
  status: 'scheduled',
  priority: 'normal',
  startDate: '',
  startTime: '',
  arrivalWindowStart: '',
  arrivalWindowEnd: '',
  duration: 1,
  estimatedDurationMinutes: 30,
  timeZone: '',
  assignedTeamMemberIds: [],
  paymentStatus: 'unpaid',
  sendInvoice: false,
  sendReminder: false,
  reminderDaysBefore: 0,
  createdBy: '',
};

export const initialAddInvoiceState: TAddInvoice = {
  customerId: '',
  workspaceId: '',
  items: [{ name: '', description: '', quantity: 1, unitPrice: 0 }],
  taxRate: 0.1,
  discount: 0,
  discountType: 'percentage',
  issueDate: new Date().toISOString().split('T')[0],
  customDueDate: undefined,
  paymentTerms: 'net15',
  notes: '',
  internalNotes: '',
};
