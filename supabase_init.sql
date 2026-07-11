-- Profiles (usuario + macros)
create table if not exists profiles (
  id uuid references auth.users primary key,
  weight_kg numeric,
  height_cm numeric,
  target_preset text check (target_preset in ('standard','performance','deficit','keto','high_protein','custom')),
  target_protein_pct numeric,
  target_carbs_pct numeric,
  target_fat_pct numeric,
  target_calories numeric,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Stock items (despensa)
create table if not exists stock_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  name text not null,
  is_staple boolean default false,
  quantity numeric,
  unit text,
  status text check (status in ('ok','low','out')),
  updated_at timestamp default now()
);

-- Recipes
create table if not exists recipes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  name text not null,
  instructions text,
  servings integer default 1,
  created_at timestamp default now()
);

-- Recipe ingredients
create table if not exists recipe_ingredients (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid references recipes on delete cascade not null,
  stock_item_id uuid references stock_items,
  name text not null,
  quantity numeric not null,
  unit text not null,
  calories_per_unit numeric,
  protein_per_unit numeric,
  carbs_per_unit numeric,
  fat_per_unit numeric
);

-- Row Level Security
alter table profiles enable row level security;
alter table stock_items enable row level security;
alter table recipes enable row level security;
alter table recipe_ingredients enable row level security;

-- Drop old policies if they exist
drop policy if exists "own profile" on profiles;
drop policy if exists "own stock" on stock_items;
drop policy if exists "own recipes" on recipes;
drop policy if exists "own recipe ingredients" on recipe_ingredients;

-- Create RLS policies
create policy "own profile" on profiles for all using (auth.uid() = id);
create policy "own stock" on stock_items for all using (auth.uid() = user_id);
create policy "own recipes" on recipes for all using (auth.uid() = user_id);
create policy "own recipe ingredients" on recipe_ingredients for all
  using (auth.uid() = (select user_id from recipes where recipes.id = recipe_id));

-- Indexes for performance
create index if not exists profiles_id_idx on profiles(id);
create index if not exists stock_items_user_id_idx on stock_items(user_id);
create index if not exists recipes_user_id_idx on recipes(user_id);
create index if not exists recipe_ingredients_recipe_id_idx on recipe_ingredients(recipe_id);
