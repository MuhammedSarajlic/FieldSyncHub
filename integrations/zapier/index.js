const zapierPlatform = require('zapier-platform-core');
const packageVersion = require('./package.json').version;

const app = {
  version: packageVersion,
  platformVersion: zapierPlatform.version,
  authentication: {
    type: 'custom',
    test: {
      url: '{{bundle.authData.baseUrl}}/api/public/v1/customers?pageSize=1',
      headers: { 'X-Api-Key': '{{bundle.authData.apiKey}}' },
    },
    fields: [
      { key: 'baseUrl', label: 'FieldSyncHub API URL', type: 'string', required: true, default: 'https://app.fieldsynchub.com' },
      { key: 'apiKey', label: 'Workspace API key', type: 'password', required: true },
    ],
    connectionLabel: '{{bundle.authData.baseUrl}}',
  },
  beforeRequest: [
    (request, z, bundle) => {
      request.headers['X-Api-Key'] = bundle.authData.apiKey;
      return request;
    },
  ],
  triggers: {
    newCustomer: {
      key: 'new_customer',
      noun: 'Customer',
      display: { label: 'New Customer', description: 'Triggers when a customer is created in FieldSyncHub.' },
      operation: {
        perform: (z, bundle) => z.request({ url: `${bundle.authData.baseUrl}/api/public/v1/customers?pageSize=100` })
          .then((response) => response.data.map((customer) => ({ ...customer, id: customer.id }))),
        canPaginate: false,
        sample: { id: '00000000-0000-0000-0000-000000000001', firstName: 'Ada', lastName: 'Lovelace' },
      },
    },
    newInvoice: {
      key: 'new_invoice',
      noun: 'Invoice',
      display: { label: 'New Invoice', description: 'Triggers when an invoice is available in FieldSyncHub.' },
      operation: {
        perform: (z, bundle) => z.request({ url: `${bundle.authData.baseUrl}/api/public/v1/invoices?pageSize=100` })
          .then((response) => response.data.map((invoice) => ({ ...invoice, id: invoice.id }))),
        canPaginate: false,
        sample: { id: '00000000-0000-0000-0000-000000000002', invoiceNumber: 'FSH-000001' },
      },
    },
    invoicePaid: {
      key: 'invoice_paid',
      noun: 'Paid Invoice',
      display: { label: 'Invoice Paid', description: 'Triggers when an invoice is fully paid.' },
      operation: {
        type: 'hook',
        performSubscribe: (z, bundle) => z.request({
          method: 'POST',
          url: `${bundle.authData.baseUrl}/api/public/v1/webhooks/subscribe`,
          body: { url: bundle.targetUrl, events: 'invoice.paid' },
        }).then((response) => response.data),
        performUnsubscribe: (z, bundle) => z.request({
          method: 'DELETE',
          url: `${bundle.authData.baseUrl}/api/public/v1/webhooks/subscribe/${bundle.subscribeData.id}`,
        }),
        perform: (z, bundle) => [bundle.cleanedRequest],
        sample: { id: '00000000-0000-0000-0000-000000000002', type: 'invoice.paid', data: { invoiceId: '00000000-0000-0000-0000-000000000002' } },
      },
    },
  },
};

module.exports = app;
