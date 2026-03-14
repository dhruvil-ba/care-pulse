# PRD to MVP Mapping

## Scope focus
- Chronic disease management: diabetes, hypertension, COPD.

## Requirement coverage
- Patient registration: `/patients`, `POST /api/patients`
- Care plan management: `/care-plans`, `POST /api/care-plans`
- Appointment scheduling: `/appointments`, `POST /api/appointments`
- Medication tracking: `/medications`, `POST /api/medications`
- Care team messaging: `/messages`, `POST /api/messages`
- Risk stratification: `lib/risk.ts`, generated during patient onboarding
- Population analytics dashboard: `/analytics`, `GET /api/analytics`
- One major EHR integration: `lib/ehr.ts` mock Epic adapter

## Data model
- User/Auth roles: `public.profiles`
- Patient: `public.patients`
- CareProvider: `public.care_providers`
- CarePlan: `public.care_plans`
- HealthCondition: `public.health_conditions`
- Medication: `public.medications`
- Appointment: `public.appointments`
- CommunicationLog: `public.communication_logs`

## Demo metrics surfaced
- Patient engagement rate
- Care plan adherence
- Medication adherence
- Care gap closure rate
