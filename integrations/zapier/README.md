# FieldSyncHub Zapier connector

This package is the publishable Zapier Platform app for FieldSyncHub. It provides
API-key authentication, polling triggers for new customers and invoices, and a
webhook trigger for paid invoices.

The API key must include `read` for polling triggers and `webhooks` for the paid
invoice trigger. Set the connector's API URL to the public FieldSyncHub origin
when promoting the app between development, staging, and production.

Run `npm install` and `npm test` in this directory, then use the Zapier Platform
CLI to validate and deploy the app.
