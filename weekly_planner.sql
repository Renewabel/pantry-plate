-- Weekly meal plans (recetas por día)
create table if not exists meal_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  recipe_id uuid references recipes not null,
  day_of_week integer check (day_of_week >= 0 and day_of_week <= 6), -- 0=Lun, 1=Mar, ..., 6=Dom
  week_start_date date not null,
  created_at timestamp default now(),
  unique(user_id, recipe_id, day_of_week, week_start_date)
);

-- Row Level Security
alter table meal_plans enable row level security;
drop policy if exists "own meal plans" on meal_plans;
create policy "own meal plans" on meal_plans for all using (auth.uid() = user_id);

-- Index
create index if not exists meal_plans_user_week_idx on meal_plans(user_id, week_start_date);
