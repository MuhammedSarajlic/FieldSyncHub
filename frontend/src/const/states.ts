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
