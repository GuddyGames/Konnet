import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { getAvatarColor } from '../utils/helpers';

const UserContext = createContext(null);

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used inside UserProvider');
  return ctx;
};

// Konnet keeps its username-first interface while Supabase Auth uses email internally.
const usernameToEmail = (username) => `${username.trim().toLowerCase()}@konnet.app`;

const toKonnetUser = (profile, following = [], followers = []) => ({
  id: profile.id,
  username: profile.username,
  name: profile.display_name || profile.username,
  bio: profile.bio || '',
  avatarColor: getAvatarColor(profile.username || 'konnet'),
  avatarImage: profile.avatar_url || null,
  isPrivate: Boolean(profile.is_private),
  following,
  followers,
  timestamp: profile.created_at ? new Date(profile.created_at).getTime() : Date.now(),
});

const loadKonnetUser = async (userId) => {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, username, display_name, bio, avatar_url, is_private, created_at')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;
  if (!profile) return null;

  const [followingResult, followersResult] = await Promise.all([
    supabase.from('follows').select('following_id').eq('follower_id', userId),
    supabase.from('follows').select('follower_id').eq('following_id', userId),
  ]);

  if (followingResult.error) throw followingResult.error;
  if (followersResult.error) throw followersResult.error;

  return toKonnetUser(
    profile,
    (followingResult.data || []).map((row) => row.following_id),
    (followersResult.data || []).map((row) => row.follower_id),
  );
};

export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [profileSetupRequired, setProfileSetupRequired] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('konnet_darkmode') === 'true');

  useEffect(() => {
    let active = true;

    const applySession = async (session) => {
      if (!session?.user) {
        if (active) { setCurrentUser(null); setProfileSetupRequired(false); }
        return;
      }

      try {
        const user = await loadKonnetUser(session.user.id);
        if (active) {
          const needsUsername = !user || user.username?.startsWith('pending_');
          setProfileSetupRequired(needsUsername);
          setCurrentUser(needsUsername ? null : user);
        }
      } catch (error) {
        console.error('Could not load Konnet profile:', error);
        if (active) { setCurrentUser(null); setProfileSetupRequired(true); }
      }
    };

    supabase.auth.getSession().then(async ({ data, error }) => {
      if (error) console.error('Supabase session error:', error);
      await applySession(data?.session);
      if (active) setAuthLoading(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      // Defer profile queries until after the auth callback completes.
      Promise.resolve().then(() => applySession(session));
    });

    return () => {
      active = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signup = async (username, password, name) => {
    if (!username?.trim() || !password?.trim() || !name?.trim()) {
      return { error: 'Please fill in all fields.' };
    }

    const normalizedUsername = username.trim().toLowerCase();
    if (!/^[a-z0-9_]{3,20}$/.test(normalizedUsername) || normalizedUsername.startsWith('pending_')) {
      return { error: 'Choose 3–20 characters using letters, numbers or underscores. The pending_ prefix is reserved.' };
    }

    try {
      const { data: available, error: availabilityError } = await supabase.rpc(
        'is_username_available',
        { input_username: normalizedUsername },
      );
      if (availabilityError) throw availabilityError;
      if (!available) return { error: 'Username already taken.' };

      const { error } = await supabase.auth.signUp({
        email: usernameToEmail(normalizedUsername),
        password,
        options: {
          data: {
            username: normalizedUsername,
            display_name: name.trim(),
          },
        },
      });

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Supabase signup error:', error);
      return { error: error.message || 'Could not create your account.' };
    }
  };

  const login = async (username, password) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: usernameToEmail(username),
        password,
      });
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Supabase login error:', error);
      return { error: 'Invalid username or password.' };
    }
  };

  const loginWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin },
      });
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Supabase Google sign-in error:', error);
      return { error: error.message || 'Google sign-in is not configured yet.' };
    }
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setCurrentUser(null);
    setProfileSetupRequired(false);
  };

  const completeProfile = async (username) => {
    const normalizedUsername = username.trim().toLowerCase();
    if (!/^[a-z0-9_]{3,20}$/.test(normalizedUsername)) return { error: 'Username must be 3–20 characters and contain only letters, numbers or underscores.' };
    const { error } = await supabase.rpc('complete_my_profile', { input_username: normalizedUsername });
    if (error) return { error: error.message };
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const profile = await loadKonnetUser(user.id);
      if (!profile) return { error: 'Profile saved, but could not be loaded. Please refresh.' };
      setCurrentUser(profile);
      setProfileSetupRequired(false);
      return { success: true };
    } catch (error) {
      return { error: error.message || 'Could not load your profile.' };
    }
  };

  const updateProfile = async (updates) => {
    if (!currentUser) return { error: 'Not logged in.' };

    const profileUpdates = {};
    if (updates.name !== undefined) profileUpdates.display_name = updates.name;
    if (updates.bio !== undefined) profileUpdates.bio = updates.bio;
    if (updates.avatarImage !== undefined) profileUpdates.avatar_url = updates.avatarImage;
    if (updates.isPrivate !== undefined) profileUpdates.is_private = updates.isPrivate;

    const { error } = await supabase.from('profiles').update(profileUpdates).eq('id', currentUser.id);
    if (error) return { error: error.message };

    setCurrentUser((previous) => ({ ...previous, ...updates }));
    return { success: true };
  };

  const toggleFollow = async (targetUserId) => {
    if (!currentUser || !targetUserId || targetUserId === currentUser.id) return;

    const isFollowing = currentUser.following?.includes(targetUserId);
    const result = isFollowing
      ? await supabase.from('follows').delete().eq('follower_id', currentUser.id).eq('following_id', targetUserId)
      : await supabase.from('follows').insert({ follower_id: currentUser.id, following_id: targetUserId });

    if (result.error) throw result.error;

    setCurrentUser((previous) => ({
      ...previous,
      following: isFollowing
        ? previous.following.filter((id) => id !== targetUserId)
        : [...(previous.following || []), targetUserId],
    }));
  };

  const getUserById = async (id) => {
    if (!id) return null;
    try {
      return await loadKonnetUser(id);
    } catch (error) {
      console.error('Could not load user:', error);
      return null;
    }
  };

  const getUserByUsername = async (username) => {
    if (!username) return null;
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, display_name, bio, avatar_url, is_private, created_at')
      .eq('username', username.trim().toLowerCase())
      .maybeSingle();

    if (error || !data) return null;
    return loadKonnetUser(data.id);
  };

  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem('konnet_darkmode', String(next));
    document.documentElement.classList.toggle('dark', next);
  };

  return (
    <UserContext.Provider value={{
      currentUser, darkMode, authLoading, profileSetupRequired,
      signup, login, loginWithGoogle, logout, completeProfile, updateProfile, toggleFollow,
      getUserById, getUserByUsername, toggleDarkMode,
    }}>
      {children}
    </UserContext.Provider>
  );
};
