-- Run this migration in the Supabase SQL Editor before publishing posts/reels/videos.
alter table public.posts
add column if not exists post_type text not null default 'photo'
check (post_type in ('photo', 'reel', 'video'));

-- Existing rows remain standard photo posts by default.
