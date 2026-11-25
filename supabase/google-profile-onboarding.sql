-- Konnet: Google sign-up profile onboarding
-- Run this once in Supabase Dashboard -> SQL Editor.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  generated_username text;
  chosen_name text;
begin
  generated_username := coalesce(
    nullif(lower(trim(new.raw_user_meta_data ->> 'username')), ''),
    'user_' || left(replace(new.id::text, '-', ''), 12)
  );

  chosen_name := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''),
    nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
    nullif(trim(new.raw_user_meta_data ->> 'name'), ''),
    nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
    'New user'
  );

  insert into public.profiles (id, username, display_name)
  values (new.id, generated_username, chosen_name)
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.complete_my_profile(input_username text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  normalized_username text := lower(trim(coalesce(input_username, '')));
begin
  if current_user_id is null then
    raise exception 'You must be signed in.';
  end if;

  if normalized_username !~ '^[a-z0-9_]{3,20}$' then
    raise exception 'Username must be 3–20 characters and contain only letters, numbers or underscores.';
  end if;

  if exists (
    select 1
    from public.profiles
    where username = normalized_username
      and id <> current_user_id
  ) then
    raise exception 'That username is already taken.';
  end if;

  update public.profiles
  set username = normalized_username
  where id = current_user_id;

  if not found then
    raise exception 'Your profile could not be found. Please contact support.';
  end if;
end;
$$;

revoke all on function public.complete_my_profile(text) from public;
grant execute on function public.complete_my_profile(text) to authenticated;
