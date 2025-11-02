
-- DTH seed schema (vNext 2025 Q4)
create extension if not exists pgcrypto;
create table if not exists pillar (id serial primary key, name text unique);
create table if not exists business_unit (id serial primary key, name text unique);
create table if not exists shared_service (id serial primary key, name text unique);
create table if not exists autonomy_level (code text primary key);

create table if not exists pod (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  pillar_id int references pillar(id),
  purpose text,
  type text,
  priority text,
  autonomy_code text references autonomy_level(code),
  budget text,
  owner text,
  kpis text, deliverables text, milestones text,
  version text default 'vNext_2025Q4',
  created_at timestamptz default now()
);

create table if not exists pod_bu (
  pod_id uuid references pod(id),
  bu_id int references business_unit(id),
  primary key(pod_id, bu_id)
);

create table if not exists pod_service (
  pod_id uuid references pod(id),
  service_id int references shared_service(id),
  primary key(pod_id, service_id)
);

create table if not exists agent (
  id uuid primary key default gen_random_uuid(),
  name text,
  title text,
  autonomy_code text references autonomy_level(code),
  pod_id uuid references pod(id),
  status text default 'active'
);

-- Seed lookups
insert into pillar(name) values ('Imagination') on conflict do nothing;
insert into pillar(name) values ('Innovation') on conflict do nothing;
insert into pillar(name) values ('Impact') on conflict do nothing;
insert into business_unit(name) values ('Fab Card Co.') on conflict do nothing;
insert into business_unit(name) values ('TFBC') on conflict do nothing;
insert into business_unit(name) values ('dreamshitter.com') on conflict do nothing;
insert into business_unit(name) values ('OUAS') on conflict do nothing;
insert into business_unit(name) values ('SparkBooks') on conflict do nothing;
insert into business_unit(name) values ('Studio DS Creative') on conflict do nothing;
insert into business_unit(name) values ('SymbiosoAi') on conflict do nothing;
insert into business_unit(name) values ('Dream Team Hub') on conflict do nothing;
insert into business_unit(name) values ('iCadence') on conflict do nothing;
insert into business_unit(name) values ('Parallax Translate') on conflict do nothing;
insert into business_unit(name) values ('Gigster Garage') on conflict do nothing;
insert into business_unit(name) values ('GlobalCollabs') on conflict do nothing;
insert into business_unit(name) values ('Think Tank Ai') on conflict do nothing;
insert into business_unit(name) values ('vSuite HQ') on conflict do nothing;
insert into business_unit(name) values ('MindOrchestra') on conflict do nothing;
insert into shared_service(name) values ('Finance & BizOps') on conflict do nothing;
insert into shared_service(name) values ('Legal/IP') on conflict do nothing;
insert into shared_service(name) values ('Security & Compliance') on conflict do nothing;
insert into shared_service(name) values ('HR/Ops') on conflict do nothing;
insert into shared_service(name) values ('Marketing & PR') on conflict do nothing;
insert into shared_service(name) values ('Tech Infra') on conflict do nothing;
insert into autonomy_level(code) values ('L0') on conflict do nothing;
insert into autonomy_level(code) values ('L1') on conflict do nothing;
insert into autonomy_level(code) values ('L2') on conflict do nothing;
insert into autonomy_level(code) values ('L3') on conflict do nothing;

-- Seed pods & starter agents

-- Impact Programs Office (IPO)
with p as (
  insert into pod(name, pillar_id, autonomy_code, type, priority)
  values ('Impact Programs Office (IPO)', (select id from pillar where name='Impact'), 'L2', 'New', 'High')
  on conflict (name) do update set autonomy_code=excluded.autonomy_code
  returning id
)
insert into agent(title, autonomy_code, pod_id) select 'Impact Programs Lead', 'L2', id from p;
insert into agent(title, autonomy_code, pod_id) select 'Impact Data Analyst', 'L1', id from p;
insert into agent(title, autonomy_code, pod_id) select 'Coalition PM', 'L2', id from p;

-- Education & Cohorts Pod
with p as (
  insert into pod(name, pillar_id, autonomy_code, type, priority)
  values ('Education & Cohorts Pod', (select id from pillar where name='Impact'), 'L2', 'New', 'High')
  on conflict (name) do update set autonomy_code=excluded.autonomy_code
  returning id
)
insert into agent(title, autonomy_code, pod_id) select 'Education Programs Manager', 'L2', id from p;
insert into agent(title, autonomy_code, pod_id) select 'Cohort Ops Lead', 'L1', id from p;

-- Accessibility & Captioning Pod
with p as (
  insert into pod(name, pillar_id, autonomy_code, type, priority)
  values ('Accessibility & Captioning Pod', (select id from pillar where name='Impact'), 'L1', 'New', 'High')
  on conflict (name) do update set autonomy_code=excluded.autonomy_code
  returning id
)
insert into agent(title, autonomy_code, pod_id) select 'Accessibility Lead', 'L1', id from p;
insert into agent(title, autonomy_code, pod_id) select 'Captioning Producer', 'L1', id from p;

-- Packaging & Pre-Press Pod
with p as (
  insert into pod(name, pillar_id, autonomy_code, type, priority)
  values ('Packaging & Pre-Press Pod', (select id from pillar where name='Imagination'), 'L2', 'New', 'High')
  on conflict (name) do update set autonomy_code=excluded.autonomy_code
  returning id
)
insert into agent(title, autonomy_code, pod_id) select 'Packaging/Pre-press Lead', 'L2', id from p;
insert into agent(title, autonomy_code, pod_id) select 'Vendor QA', 'L1', id from p;

-- WMS / 3PL Ops Pod
with p as (
  insert into pod(name, pillar_id, autonomy_code, type, priority)
  values ('WMS / 3PL Ops Pod', (select id from pillar where name='Imagination'), 'L1', 'New', 'High')
  on conflict (name) do update set autonomy_code=excluded.autonomy_code
  returning id
)
insert into agent(title, autonomy_code, pod_id) select '3PL Integration Owner', 'L1', id from p;
insert into agent(title, autonomy_code, pod_id) select 'Returns/Kitting Coordinator', 'L1', id from p;

-- Channel Integrations Pod
with p as (
  insert into pod(name, pillar_id, autonomy_code, type, priority)
  values ('Channel Integrations Pod', (select id from pillar where name='Innovation'), 'L1', 'New', 'High')
  on conflict (name) do update set autonomy_code=excluded.autonomy_code
  returning id
)
insert into agent(title, autonomy_code, pod_id) select 'Channel Integrations Lead', 'L1', id from p;
insert into agent(title, autonomy_code, pod_id) select 'QA', 'L0', id from p;

-- Author Platform Studio
with p as (
  insert into pod(name, pillar_id, autonomy_code, type, priority)
  values ('Author Platform Studio', (select id from pillar where name='Imagination'), 'L1', 'New', 'High')
  on conflict (name) do update set autonomy_code=excluded.autonomy_code
  returning id
)
insert into agent(title, autonomy_code, pod_id) select 'Author Platform Producer', 'L1', id from p;
insert into agent(title, autonomy_code, pod_id) select 'Copy/Design', 'L0', id from p;

-- Music Rights & Distribution Pod
with p as (
  insert into pod(name, pillar_id, autonomy_code, type, priority)
  values ('Music Rights & Distribution Pod', (select id from pillar where name='Imagination'), 'L1', 'New', 'High')
  on conflict (name) do update set autonomy_code=excluded.autonomy_code
  returning id
)
insert into agent(title, autonomy_code, pod_id) select 'Rights Admin', 'L1', id from p;
insert into agent(title, autonomy_code, pod_id) select 'Distro Ops', 'L0', id from p;

-- Agent Governance Pod
with p as (
  insert into pod(name, pillar_id, autonomy_code, type, priority)
  values ('Agent Governance Pod', (select id from pillar where name='Innovation'), 'L2', 'New', 'High')
  on conflict (name) do update set autonomy_code=excluded.autonomy_code
  returning id
)
insert into agent(title, autonomy_code, pod_id) select 'Governance Designer', 'L2', id from p;
insert into agent(title, autonomy_code, pod_id) select 'Policy Librarian', 'L1', id from p;

-- Tenant & Billing Pod
with p as (
  insert into pod(name, pillar_id, autonomy_code, type, priority)
  values ('Tenant & Billing Pod', (select id from pillar where name='Innovation'), 'L2', 'New', 'High')
  on conflict (name) do update set autonomy_code=excluded.autonomy_code
  returning id
)
insert into agent(title, autonomy_code, pod_id) select 'Tenant/Billing PM', 'L2', id from p;
insert into agent(title, autonomy_code, pod_id) select 'Billing Engineer', 'L1', id from p;

-- GlobalCollabs Partnerships Pod
with p as (
  insert into pod(name, pillar_id, autonomy_code, type, priority)
  values ('GlobalCollabs Partnerships Pod', (select id from pillar where name='Impact'), 'L2', 'New', 'High')
  on conflict (name) do update set autonomy_code=excluded.autonomy_code
  returning id
)
insert into agent(title, autonomy_code, pod_id) select 'Partner Ops', 'L2', id from p;
insert into agent(title, autonomy_code, pod_id) select 'Contracts Desk', 'L1', id from p;

-- Data Stewardship & Metrics Pod
with p as (
  insert into pod(name, pillar_id, autonomy_code, type, priority)
  values ('Data Stewardship & Metrics Pod', (select id from pillar where name='Innovation'), 'L1', 'New', 'High')
  on conflict (name) do update set autonomy_code=excluded.autonomy_code
  returning id
)
insert into agent(title, autonomy_code, pod_id) select 'Data Steward', 'L1', id from p;
insert into agent(title, autonomy_code, pod_id) select 'Analyst', 'L1', id from p;
