import { TAddCustomer } from '../../types/Customer';
import { TAddInvoice } from '../../types/Invoice';
import { TAddJob } from '../../types/Job';
import { TAddNote } from '../../types/Note';
import { TAddServiceItem } from '../../types/ServiceItem';

export const addCustomerInitialState: TAddCustomer = {
  workspaceId: '',
  firstName: '',
  lastName: '',
  companyName: '',
  displayName: '',
  emails: [],
  isReceiveJobNotifications: true,
  isReceiveQuoteNotifications: true,
  isReceiveInvoiceNotifications: true,
  billingStreet: '',
  billingCity: '',
  billingState: '',
  billingCountry: '',
  billingPostalCode: '',
  customFieldValues: [],
  properties: [],
  customerPhones: [],
};

export const addNoteInitialState: TAddNote = {
  createdBy: '',
  createdAt: '',
  noteText: '',
  pathFile: '',
  customerId: '',
};

export const addServiceItemInitialState: TAddServiceItem = {
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

export const addJobInitialState: TAddJob = {
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
