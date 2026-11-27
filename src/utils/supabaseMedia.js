import { supabase } from '../lib/supabase';

const MAX_FILE_SIZE = 50 * 1024 * 1024;
const allowedImage = ['image/jpeg', 'image/png', 'image/webp'];
const allowedVideo = ['video/mp4', 'video/webm'];

const makePath = (userId, file) => {
  const extension = file.name.split('.').pop()?.toLowerCase() || 'bin';
  return userId + '/' + crypto.randomUUID() + '.' + extension;
};

export const publishPostWithMedia = async ({ userId, files, caption, postType = 'photo' }) => {
  if (!files?.length) throw new Error('Choose at least one photo or video.');
  if (files.length > 10) throw new Error('You can add up to 10 files to one post.');
  for (const file of files) {
    if (![...allowedImage, ...allowedVideo].includes(file.type)) throw new Error('Use JPG, PNG, WEBP, MP4 or WEBM files.');
    if (file.size > MAX_FILE_SIZE) throw new Error('Each file must be 50 MB or smaller.');
    if (postType !== 'photo' && !file.type.startsWith('video/')) throw new Error('Choose a video for this format.');
    if (postType === 'photo' && !file.type.startsWith('image/')) throw new Error('Choose photos for a standard post.');
  }

  const { data: post, error: postError } = await supabase
    .from('posts').insert({ author_id: userId, caption: caption.trim(), post_type: postType })
    .select('id').single();
  if (postError) throw postError;

  const uploaded = [];
  try {
    for (let position = 0; position < files.length; position += 1) {
      const file = files[position];
      const storagePath = makePath(userId, file);
      const { error: uploadError } = await supabase.storage.from('post-media').upload(storagePath, file, { contentType: file.type, upsert: false });
      if (uploadError) throw uploadError;
      uploaded.push(storagePath);
      const { error: mediaError } = await supabase.from('post_media').insert({
        post_id: post.id, storage_path: storagePath,
        media_type: file.type.startsWith('video/') ? 'video' : 'image', position,
      });
      if (mediaError) throw mediaError;
    }
    return post.id;
  } catch (error) {
    await supabase.from('posts').delete().eq('id', post.id);
    if (uploaded.length) await supabase.storage.from('post-media').remove(uploaded);
    throw error;
  }
};

export const publishStory = async ({ userId, file, caption }) => {
  if (!file) throw new Error('Choose a photo or video for your story.');
  if (![...allowedImage, ...allowedVideo].includes(file.type)) throw new Error('Use JPG, PNG, WEBP, MP4 or WEBM files.');
  if (file.size > MAX_FILE_SIZE) throw new Error('Story media must be 50 MB or smaller.');
  const storagePath = makePath(userId, file);
  const { error: uploadError } = await supabase.storage.from('story-media').upload(storagePath, file, { contentType: file.type, upsert: false });
  if (uploadError) throw uploadError;
  const { data, error } = await supabase.from('stories').insert({
    author_id: userId, media_path: storagePath,
    media_type: file.type.startsWith('video/') ? 'video' : 'image',
    caption: caption.trim(), expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  }).select('id').single();
  if (error) {
    await supabase.storage.from('story-media').remove([storagePath]);
    throw error;
  }
  return data.id;
};

export const getPublicMediaUrl = (bucket, path) => {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
};
