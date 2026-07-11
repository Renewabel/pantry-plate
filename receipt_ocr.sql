-- Scanned receipts with extracted items
create table if not exists scanned_receipts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  image_url text,
  extracted_items jsonb, -- [{name, quantity, unit, estimated_price}, ...]
  status text check (status in ('pending','reviewed','added')) default 'pending',
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Row Level Security
alter table scanned_receipts enable row level security;
drop policy if exists "own receipts" on scanned_receipts;
create policy "own receipts" on scanned_receipts for all using (auth.uid() = user_id);

-- Index
create index if not exists scanned_receipts_user_idx on scanned_receipts(user_id, status);
