create extension if not exists "uuid-ossp";

create table if not exists public.invitations (
  id uuid default uuid_generate_v4() primary key,
  provider_id uuid references public.profiles(id) not null,
  patient_email text not null,
  invite_code text unique not null,
  status text check (status in ('pending', 'accepted')) default 'pending',
  created_at timestamp with time zone default now()
);

create table if not exists public.care_team_relationships (
  id uuid default uuid_generate_v4() primary key,
  provider_id uuid references public.profiles(id) not null,
  patient_id uuid references public.profiles(id) not null,
  created_at timestamp with time zone default now(),
  unique(provider_id, patient_id)
);

alter table public.invitations enable row level security;
alter table public.care_team_relationships enable row level security;

create policy "Providers create invitations" on public.invitations
  for insert with check (
    auth.uid() = provider_id
  );

create policy "Providers view their invitations" on public.invitations
  for select using (auth.uid() = provider_id);

create policy "Patients read their invite" on public.invitations
  for select using (lower(patient_email) = lower(auth.jwt() ->> 'email'));

create policy "Providers update their invitations" on public.invitations
  for update using (auth.uid() = provider_id);

create policy "Patients accept their invitations" on public.invitations
  for update using (lower(patient_email) = lower(auth.jwt() ->> 'email'));

create policy "Providers delete their invitations" on public.invitations
  for delete using (auth.uid() = provider_id);

create policy "Provider-patient relationships are viewable by participants" on public.care_team_relationships
  for select using (auth.uid() = provider_id or auth.uid() = patient_id);

create policy "Providers create relationships" on public.care_team_relationships
  for insert with check (auth.uid() = provider_id);

create policy "Patients create relationships from invite" on public.care_team_relationships
  for insert with check (
    auth.uid() = patient_id
    and exists (
      select 1
      from public.invitations i
      where i.provider_id = care_team_relationships.provider_id
        and lower(i.patient_email) = lower(auth.jwt() ->> 'email')
        and i.status = 'pending'
    )
  );

create index if not exists invitations_provider_id_idx on public.invitations (provider_id);
create index if not exists invitations_invite_code_idx on public.invitations (invite_code);
create index if not exists care_team_provider_idx on public.care_team_relationships (provider_id);
create index if not exists care_team_patient_idx on public.care_team_relationships (patient_id);
