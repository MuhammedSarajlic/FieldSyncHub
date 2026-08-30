# ADR-0003: Migration timestamp history

- Status: Accepted
- Date: 2026-08-30

## Context

The migration history contains `20260726200816_AddPasswordResetFields` alongside
the `20250828212507_InitialCreate` migration. The password-reset migration was
created with a clock/date configuration that is ahead of the initial schema.

## Decision

Keep the existing migration identifier unchanged because it is part of the
database history and may already be applied in deployed environments. New
migrations should use the current UTC timestamp and the team should treat the
older-looking future-dated entry as historical metadata, not as evidence of a
second deployment timeline.
