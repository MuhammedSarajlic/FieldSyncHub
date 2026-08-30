# Critical-flow smoke tests

The five Playwright tests are opt-in because they create and mutate application data. Run them against a running local or staging stack:

```powershell
$env:E2E_LIVE='true'
$env:E2E_EMAIL='qa@example.test'
$env:E2E_PASSWORD='TestPassword123!'
npm run test:e2e
```

Without `E2E_LIVE=true`, the suite is skipped rather than changing a developer database.
