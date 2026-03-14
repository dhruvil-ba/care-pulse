# VitalSync MVP Architecture

## Stack
- Frontend: Next.js App Router + React + TypeScript
- Backend: Next.js Route Handlers
- Data: Supabase (PostgreSQL + Auth + RLS)

## Rendering Strategy
- Public/low-volatility content: ISR or static rendering (home page, condition education pages)
- Secure dynamic workflows: SSR with server-side data access for patient/provider data

## MVP Modules
1. Patient Registration and Onboarding
2. Care Plan Management
3. Appointment Scheduling
4. Medication Tracking
5. Care Team Messaging
6. Risk Stratification
7. Population Analytics
8. One EHR Integration adapter interface

## HIPAA-Oriented Guardrails (MVP)
- Enforce least-privilege access using row-level security policies.
- Keep PHI reads server-side by default; avoid exposing sensitive data in client bundles.
- Use immutable communication logs with actor and timestamp metadata.
- Encrypt secrets in environment variables; never commit credentials.

## EHR Integration (MVP placeholder)
- `lib/ehr.ts` defines an adapter interface to integrate one major EHR.
- Initial implementation can be mocked or use a sandbox endpoint for demo data.

## Demo Metrics
- Patient engagement rate
- Care plan adherence
- Medication adherence
- Care gap closure rate
