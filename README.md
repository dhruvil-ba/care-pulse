# VitalSync - Population Health Management MVP

Next.js + Supabase starter implementation aligned with the PRD for a hackathon-grade population health platform focused on chronic disease management.

## What is included
- Next.js App Router project scaffold with TypeScript.
- MVP UI flows:
  - Patient registration and onboarding
  - Care plan management
  - Appointment scheduling
  - Medication tracking
  - Care team messaging
  - Population analytics dashboard
- Simple risk stratification logic.
- EHR adapter abstraction with one mock major-provider integration.
- Supabase migration with core entities + row-level security policies.
- Frontend stack upgrade:
  - Tailwind CSS + shadcn-style component setup (`components.json`, `components/ui/*`)
  - Deep dark premium theme with green accents and glassmorphism surfaces
  - Framer Motion landing animations loaded via dynamic import for better initial load behavior

## Local setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy env values:
   ```bash
   cp .env.example .env.local
   ```
3. Run app:
   ```bash
   npm run dev
   ```
4. Open `http://localhost:3000`.

## Supabase schema
- Migration path: `supabase/migrations/20260314_001_init_vitalsync.sql`
- Apply via Supabase SQL editor or CLI.

## Notes
- The app currently uses an in-memory store for quick demo behavior.
- API contracts are implemented under `app/api/*` and can be switched to Supabase queries directly.
- For HIPAA production readiness, add encryption at rest/key management, audit logging pipelines, BAA-covered infra controls, and robust IAM/SSO integration.
