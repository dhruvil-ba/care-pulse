-- VitalSync PHM MVP schema
-- Apply inside Supabase SQL editor or via Supabase CLI migrations.

create extension if not exists "pgcrypto";

create type public.user_role as enum ('patient', 'provider', 'admin');
create type public.risk_tier as enum ('low', 'medium', 'high');
create type public.condition_code as enum ('diabetes', 'hypertension', 'copd');
create type public.appointment_type as enum ('virtual', 'in_person');
create type public.appointment_status as enum ('scheduled', 'completed', 'cancelled', 'no_show');
create type public.care_plan_status as enum ('draft', 'active', 'paused', 'completed');
create type public.message_channel as enum ('in_app', 'sms');

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.user_role not null,
  full_name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.patients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null references auth.users(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  date_of_birth date not null,
  gender text not null,
  phone text,
  address text,
  baseline_systolic integer,
  baseline_diastolic integer,
  baseline_a1c numeric(4,2),
  risk_score integer not null default 0 check (risk_score between 0 and 100),
  risk_tier public.risk_tier not null default 'low',
  created_at timestamptz not null default now()
);

create table if not exists public.care_providers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null references auth.users(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  specialty text not null,
  clinic_name text not null,
  npi text,
  created_at timestamptz not null default now()
);

create table if not exists public.health_conditions (
  id uuid primary key default gen_random_uuid(),
  code public.condition_code unique not null,
  display_name text not null,
  description text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.patient_conditions (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  condition_id uuid not null references public.health_conditions(id) on delete cascade,
  diagnosed_on date,
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  unique (patient_id, condition_id)
);

create table if not exists public.care_plans (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  provider_id uuid not null references public.care_providers(id) on delete cascade,
  condition_code public.condition_code not null,
  title text not null,
  goals text not null,
  interventions text not null,
  target_metric text not null,
  target_value numeric(8,2),
  starts_on date not null,
  ends_on date,
  adherence_percent integer not null default 0 check (adherence_percent between 0 and 100),
  status public.care_plan_status not null default 'draft',
  created_at timestamptz not null default now()
);

create table if not exists public.medications (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  prescribed_by uuid not null references public.care_providers(id) on delete cascade,
  name text not null,
  dosage text not null,
  frequency text not null,
  refill_due_on date,
  adherence_percent integer not null default 0 check (adherence_percent between 0 and 100),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  provider_id uuid not null references public.care_providers(id) on delete cascade,
  appointment_at timestamptz not null,
  appointment_type public.appointment_type not null,
  status public.appointment_status not null default 'scheduled',
  reason text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.communication_logs (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  sender_user_id uuid not null references auth.users(id) on delete cascade,
  receiver_user_id uuid not null references auth.users(id) on delete cascade,
  channel public.message_channel not null default 'in_app',
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_patients_user on public.patients(user_id);
create index if not exists idx_care_plans_patient on public.care_plans(patient_id);
create index if not exists idx_medications_patient on public.medications(patient_id);
create index if not exists idx_appointments_patient on public.appointments(patient_id);
create index if not exists idx_appointments_datetime on public.appointments(appointment_at);
create index if not exists idx_comms_patient on public.communication_logs(patient_id);

alter table public.profiles enable row level security;
alter table public.patients enable row level security;
alter table public.care_providers enable row level security;
alter table public.health_conditions enable row level security;
alter table public.patient_conditions enable row level security;
alter table public.care_plans enable row level security;
alter table public.medications enable row level security;
alter table public.appointments enable row level security;
alter table public.communication_logs enable row level security;

create or replace function public.current_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select p.role::public.user_role
  from public.profiles p
  where p.id = auth.uid();
$$;

create policy "profiles self or admin"
on public.profiles
for select
using (id = auth.uid() or public.current_role() = 'admin'::public.user_role);

create policy "profiles self update"
on public.profiles
for update
using (id = auth.uid())
with check (id = auth.uid());

create policy "profiles self insert"
on public.profiles
for insert
with check (id = auth.uid());

create policy "patients read own"
on public.patients
for select
using (user_id = auth.uid() or public.current_role() in ('provider'::public.user_role, 'admin'::public.user_role));

create policy "patients write provider admin"
on public.patients
for all
using (public.current_role() in ('provider'::public.user_role, 'admin'::public.user_role))
with check (public.current_role() in ('provider'::public.user_role, 'admin'::public.user_role));

create policy "providers read scoped"
on public.care_providers
for select
using (user_id = auth.uid() or public.current_role() = 'admin'::public.user_role or public.current_role() = 'provider'::public.user_role);

create policy "providers write admin"
on public.care_providers
for all
using (public.current_role() = 'admin'::public.user_role)
with check (public.current_role() = 'admin'::public.user_role);

create policy "conditions read all authenticated"
on public.health_conditions
for select
using (auth.uid() is not null);

create policy "conditions write admin"
on public.health_conditions
for all
using (public.current_role() = 'admin'::public.user_role)
with check (public.current_role() = 'admin'::public.user_role);

create policy "patient_conditions scoped read"
on public.patient_conditions
for select
using (
  public.current_role() in ('provider'::public.user_role, 'admin'::public.user_role)
  or exists (
    select 1
    from public.patients p
    where p.id = patient_conditions.patient_id
      and p.user_id = auth.uid()
  )
);

create policy "patient_conditions write provider admin"
on public.patient_conditions
for all
using (public.current_role() in ('provider'::public.user_role, 'admin'::public.user_role))
with check (public.current_role() in ('provider'::public.user_role, 'admin'::public.user_role));

create policy "care_plans scoped read"
on public.care_plans
for select
using (
  public.current_role() in ('provider'::public.user_role, 'admin'::public.user_role)
  or exists (
    select 1
    from public.patients p
    where p.id = care_plans.patient_id
      and p.user_id = auth.uid()
  )
);

create policy "care_plans write provider admin"
on public.care_plans
for all
using (public.current_role() in ('provider'::public.user_role, 'admin'::public.user_role))
with check (public.current_role() in ('provider'::public.user_role, 'admin'::public.user_role));

create policy "medications scoped read"
on public.medications
for select
using (
  public.current_role() in ('provider'::public.user_role, 'admin'::public.user_role)
  or exists (
    select 1
    from public.patients p
    where p.id = medications.patient_id
      and p.user_id = auth.uid()
  )
);

create policy "medications write provider admin"
on public.medications
for all
using (public.current_role() in ('provider'::public.user_role, 'admin'::public.user_role))
with check (public.current_role() in ('provider'::public.user_role, 'admin'::public.user_role));

create policy "appointments scoped read"
on public.appointments
for select
using (
  public.current_role() in ('provider'::public.user_role, 'admin'::public.user_role)
  or exists (
    select 1
    from public.patients p
    where p.id = appointments.patient_id
      and p.user_id = auth.uid()
  )
);

create policy "appointments write provider admin"
on public.appointments
for all
using (public.current_role() in ('provider'::public.user_role, 'admin'::public.user_role))
with check (public.current_role() in ('provider'::public.user_role, 'admin'::public.user_role));

create policy "communication scoped read"
on public.communication_logs
for select
using (
  sender_user_id = auth.uid()
  or receiver_user_id = auth.uid()
  or public.current_role() in ('provider'::public.user_role, 'admin'::public.user_role)
);

create policy "communication scoped write"
on public.communication_logs
for insert
with check (
  sender_user_id = auth.uid()
  and (
    public.current_role() in ('provider'::public.user_role, 'admin'::public.user_role, 'patient'::public.user_role)
  )
);

create or replace view public.population_metrics as
select
  count(*)::int as total_patients,
  count(*) filter (where p.risk_tier = 'high')::int as high_risk_patients,
  coalesce(round(avg(cp.adherence_percent))::int, 0) as avg_care_plan_adherence,
  coalesce(round(avg(m.adherence_percent))::int, 0) as avg_medication_adherence
from public.patients p
left join public.care_plans cp on cp.patient_id = p.id and cp.status = 'active'
left join public.medications m on m.patient_id = p.id and m.is_active = true;

insert into public.health_conditions (code, display_name, description)
values
  ('diabetes', 'Diabetes', 'Chronic metabolic disease requiring glucose management.'),
  ('hypertension', 'Hypertension', 'Persistent elevated blood pressure requiring ongoing control.'),
  ('copd', 'COPD', 'Chronic obstructive pulmonary disease with respiratory limitations.')
on conflict (code) do nothing;
