-- FigSuite v1.1: PRIVATE, NON-EXECUTABLE PRIZE DRAFT SCHEMA.
-- Not an approval to run a contest. Not a public Data API schema.
-- This migration intentionally has no transfer function, no provider credentials,
-- no user-facing RPC and no permitted payout/activation status.
create schema if not exists prize_control;
revoke all on schema prize_control from public, anon, authenticated;

create table if not exists prize_control.contest_drafts (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(trim(title)) >= 8),
  currency text not null default 'USD' check (currency = 'USD'),
  prize_pool_cents bigint not null check (prize_pool_cents > 0),
  written_rules_ref text not null check (length(written_rules_ref) >= 3),
  sponsor_funding_ref text not null check (length(sponsor_funding_ref) >= 8),
  closing_at timestamptz not null,
  free_entry_parity boolean not null default true check (free_entry_parity),
  purchase_required boolean not null default false check (purchase_required = false),
  state text not null default 'draft_review' check (state = 'draft_review'),
  provider_egress_enabled boolean not null default false check (provider_egress_enabled = false),
  payout_enabled boolean not null default false check (payout_enabled = false),
  created_at timestamptz not null default now()
);
create table if not exists prize_control.fixed_award_slots (
  id uuid primary key default gen_random_uuid(),
  contest_id uuid not null references prize_control.contest_drafts(id) on delete restrict,
  award_rank integer not null check (award_rank > 0),
  amount_cents bigint not null check (amount_cents > 0),
  unique (contest_id, award_rank)
);
create table if not exists prize_control.review_attestations (
  id uuid primary key default gen_random_uuid(),
  contest_id uuid not null references prize_control.contest_drafts(id) on delete restrict,
  review_scope text not null check (review_scope in ('legal','payments','payouts','finance','security','executive')),
  reviewer_ref text not null check (length(trim(reviewer_ref)) >= 2),
  evidence_ref text not null check (length(trim(evidence_ref)) >= 8),
  effect text not null default 'documentation_only' check (effect = 'documentation_only'),
  activation_granted boolean not null default false check (activation_granted = false),
  created_at timestamptz not null default now()
);
create table if not exists prize_control.payout_previews (
  id uuid primary key default gen_random_uuid(),
  contest_id uuid not null references prize_control.contest_drafts(id) on delete restrict,
  opaque_entry_ref text not null check (length(opaque_entry_ref) between 8 and 80),
  amount_cents bigint not null check (amount_cents > 0),
  state text not null default 'preview_not_payable' check (state = 'preview_not_payable'),
  provider_request_sent boolean not null default false check (provider_request_sent = false),
  created_at timestamptz not null default now(),
  unique (contest_id, opaque_entry_ref)
);
create table if not exists prize_control.audit_events (
  id uuid primary key default gen_random_uuid(),
  contest_id uuid references prize_control.contest_drafts(id) on delete restrict,
  event_kind text not null check (length(trim(event_kind)) >= 3),
  actor_ref text not null check (length(trim(actor_ref)) >= 2),
  note jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table prize_control.contest_drafts enable row level security;
alter table prize_control.fixed_award_slots enable row level security;
alter table prize_control.review_attestations enable row level security;
alter table prize_control.payout_previews enable row level security;
alter table prize_control.audit_events enable row level security;

revoke all privileges on all tables in schema prize_control from public, anon, authenticated;
revoke all privileges on all sequences in schema prize_control from public, anon, authenticated;
-- Deliberately no policies granting access to anon/authenticated.
-- Separate reviewed migration + service boundary would be needed for any
-- actual contest eligibility management, legal activation or fund transfer.
