Seed CSV pack for the VitalSync / Care Pulse schema.

What this includes:
- Public-table CSVs with consistent UUIDs and foreign keys.
- Realistic demo data for providers, patients, conditions, plans, medications, appointments, messages, invites, and provider-patient relationships.
- `auth_users_reference.csv` as the prerequisite user list for `auth.users`.

Important constraint:
- `profiles.user_id`, `patients.user_id`, and `care_providers.user_id` all depend on rows existing in `auth.users`.
- Supabase dashboard CSV import does not normally seed `auth.users` for you.
- Create the auth users first using the IDs in `auth_users_reference.csv`, then import the public table CSVs.

Recommended import order:
1. `auth_users_reference.csv`
2. `profiles.csv`
3. `care_providers.csv`
4. `health_conditions.csv`
5. `patients.csv`
6. `patient_conditions.csv`
7. `care_team_relationships.csv`
8. `care_plans.csv`
9. `medications.csv`
10. `appointments.csv`
11. `communication_logs.csv`
12. `invitations.csv`

Notes:
- `profiles.csv` matches the migration schema and does not include an `email` column.
- `health_conditions.csv` overlaps with the migration seed. If those rows already exist, either skip importing that file or use upsert logic keyed by `code`.
- Timestamps are static so repeated imports stay predictable.
