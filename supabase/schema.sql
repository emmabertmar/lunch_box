-- ============================================================
-- PROFILES
-- Supabase handles login/signup automatically in "auth.users".
-- This table extends that with extra info like a username.
-- It's linked to auth.users via the "id" column.
-- ============================================================
create table profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  username text unique not null,
  avatar_url text,
  created_at timestamptz default now()
);

-- ============================================================
-- RECIPES
-- Each recipe belongs to one user.
-- week_number and year tell us which weekly competition
-- this recipe is part of (e.g. week 8 of 2026).
-- views is a simple counter that goes up each time someone
-- opens the recipe page.
-- ============================================================
create table recipes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  title text not null,
  description text,
  ingredients text not null,
  instructions text not null,
  photo_url text,
  views integer default 0,
  week_number integer not null,
  year integer not null,
  created_at timestamptz default now()
);

-- ============================================================
-- LIKES
-- Each row = one user liking one recipe.
-- The UNIQUE constraint means a user can only like a
-- recipe once (no double-liking).
-- ============================================================
create table likes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  recipe_id uuid references recipes(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(user_id, recipe_id)
);

-- ============================================================
-- WEEKLY WINNERS
-- Stores the winning recipe for each week.
-- Populated every Sunday (we'll handle this logic in the app).
-- ============================================================
create table weekly_winners (
  id uuid default gen_random_uuid() primary key,
  recipe_id uuid references recipes(id) on delete cascade not null,
  week_number integer not null,
  year integer not null,
  created_at timestamptz default now(),
  unique(week_number, year)
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- Supabase locks down all tables by default.
-- RLS policies define who is allowed to read/write what.
-- ============================================================

alter table profiles enable row level security;
alter table recipes enable row level security;
alter table likes enable row level security;
alter table weekly_winners enable row level security;

-- Profiles: anyone can read, only you can update your own
create policy "Public profiles are viewable by everyone"
  on profiles for select using (true);

create policy "Users can insert their own profile"
  on profiles for insert with check (auth.uid() = id);

create policy "Users can update their own profile"
  on profiles for update using (auth.uid() = id);

-- Recipes: anyone can read, only logged-in users can create,
-- only the owner can update or delete
create policy "Recipes are viewable by everyone"
  on recipes for select using (true);

create policy "Logged-in users can create recipes"
  on recipes for insert with check (auth.uid() = user_id);

create policy "Users can update their own recipes"
  on recipes for update using (auth.uid() = user_id);

create policy "Users can delete their own recipes"
  on recipes for delete using (auth.uid() = user_id);

-- Likes: anyone can read, logged-in users can like/unlike
create policy "Likes are viewable by everyone"
  on likes for select using (true);

create policy "Logged-in users can like"
  on likes for insert with check (auth.uid() = user_id);

create policy "Users can remove their own like"
  on likes for delete using (auth.uid() = user_id);

-- Weekly winners: only readable publicly, not writable by users
create policy "Weekly winners are viewable by everyone"
  on weekly_winners for select using (true);

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- When a new user signs up, this function automatically
-- creates a row in "profiles" for them.
-- ============================================================
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, username)
  values (
    new.id,
    split_part(new.email, '@', 1)
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();
