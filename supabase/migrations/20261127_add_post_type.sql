-- Run this migration in the Supabase SQL Editor before publishing posts/reels/videos.
alter table public.posts
add column if not exists post_type text not null default 'photo'
check (post_type in ('photo', 'reel', 'video'));

-- Existing rows remain standard photo posts by default.


-- Enable live notification inserts for Supabase Realtime.
do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'notifications'
  ) then
    alter publication supabase_realtime add table public.notifications;
  end if;
end
$$;
