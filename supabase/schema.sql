create extension if not exists pgcrypto;

create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null,
  title text not null,
  job_role text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists answers (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references sessions(id) on delete cascade,
  clerk_user_id text not null,
  question text not null,
  question_category text,
  answer_text text not null,
  created_at timestamptz not null default now()
);

create table if not exists feedback (
  id uuid primary key default gen_random_uuid(),
  answer_id uuid not null references answers(id) on delete cascade,
  clerk_user_id text not null,
  situation_score int check (situation_score between 1 and 10),
  task_score int check (task_score between 1 and 10),
  action_score int check (action_score between 1 and 10),
  result_score int check (result_score between 1 and 10),
  overall_score int check (overall_score between 1 and 10),
  situation_feedback text,
  task_feedback text,
  action_feedback text,
  result_feedback text,
  overall_summary text,
  strengths text[] default '{}',
  weaknesses text[] default '{}',
  improved_answer text,
  keywords_used text[] default '{}',
  keywords_missing text[] default '{}',
  created_at timestamptz not null default now()
);

create index if not exists idx_sessions_user on sessions(clerk_user_id);
create index if not exists idx_answers_session on answers(session_id);
create index if not exists idx_feedback_answer on feedback(answer_id);
