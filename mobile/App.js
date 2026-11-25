import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { supabase } from './src/lib/supabase';

const BLUE = '#2563EB';
const DARK = '#111827';

function ActionButton({ title, onPress, disabled, secondary }) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      style={[styles.button, secondary && styles.secondaryButton, disabled && styles.disabled]}
    >
      <Text style={[styles.buttonText, secondary && styles.secondaryButtonText]}>{title}</Text>
    </TouchableOpacity>
  );
}

export default function App() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [screen, setScreen] = useState('login');
  const [authLoading, setAuthLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    let alive = true;
    supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (sessionError) setError(sessionError.message);
      if (alive) {
        setSession(data.session);
        setAuthLoading(false);
      }
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });
    return () => {
      alive = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    let alive = true;
    const loadProfile = async () => {
      if (!session?.user) {
        setProfile(null);
        return;
      }
      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('id, username, display_name, bio, avatar_url')
        .eq('id', session.user.id)
        .maybeSingle();
      if (!alive) return;
      if (profileError) {
        setError(profileError.message);
        setProfile(null);
      } else {
        setProfile(data);
        if (!data || data.username?.startsWith('pending_')) setScreen('username');
        else setScreen('home');
      }
    };
    loadProfile();
    return () => { alive = false; };
  }, [session]);

  const emailForUsername = (value) => `${value.trim().toLowerCase()}@konnet.app`;

  const signIn = async () => {
    setBusy(true);
    setError('');
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: emailForUsername(username),
      password,
    });
    if (signInError) setError('Could not sign in. Check your username and password.');
    setBusy(false);
  };

  const signUp = async () => {
    const normalized = username.trim().toLowerCase();
    if (!/^[a-z0-9_]{3,20}$/.test(normalized) || normalized.startsWith('pending_')) {
      setError('Username must be 3–20 characters. Letters, numbers and underscores only.');
      return;
    }
    if (!name.trim() || password.length < 6) {
      setError('Enter your name and a password of at least 6 characters.');
      return;
    }
    setBusy(true);
    setError('');
    const { data: available, error: checkError } = await supabase.rpc(
      'is_username_available',
      { input_username: normalized },
    );
    if (checkError || !available) {
      setError(checkError?.message || 'That username is already taken.');
      setBusy(false);
      return;
    }
    const { error: signUpError } = await supabase.auth.signUp({
      email: emailForUsername(normalized),
      password,
      options: { data: { username: normalized, display_name: name.trim() } },
    });
    if (signUpError) setError(signUpError.message);
    setBusy(false);
  };

  const finishUsername = async () => {
    const normalized = username.trim().toLowerCase();
    if (!/^[a-z0-9_]{3,20}$/.test(normalized) || normalized.startsWith('pending_')) {
      setError('Choose 3–20 characters using letters, numbers or underscores.');
      return;
    }
    setBusy(true);
    setError('');
    const { error: rpcError } = await supabase.rpc('complete_my_profile', {
      input_username: normalized,
    });
    if (rpcError) {
      setError(rpcError.message);
    } else {
      const { error: metadataError } = await supabase.auth.updateUser({
        data: { username: normalized },
      });
      if (metadataError) setError(metadataError.message);
      else setScreen('home');
    }
    setBusy(false);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUsername('');
    setPassword('');
    setScreen('login');
  };

  if (authLoading || (session && !profile && screen !== 'username')) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color={BLUE} />
        <Text style={styles.muted}>Loading Konnet…</Text>
      </SafeAreaView>
    );
  }

  if (session && screen === 'home' && profile?.username && !profile.username.startsWith('pending_')) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.homeHeader}>
          <Text style={styles.logo}>konnet</Text>
          <Text style={styles.handle}>@{profile.username}</Text>
        </View>
        <View style={styles.homeContent}>
          <Text style={styles.welcome}>Welcome to Konnet</Text>
          <Text style={styles.muted}>Your mobile social space is being set up.</Text>
          <View style={styles.featureCard}>
            <Text style={styles.featureTitle}>Your community starts here.</Text>
            <Text style={styles.muted}>Feed, stories, reels, messaging and notifications will be connected in the next build stages.</Text>
          </View>
          <ActionButton title="Sign out" secondary onPress={signOut} />
        </View>
      </SafeAreaView>
    );
  }

  const isUsernameSetup = Boolean(session) && screen === 'username';
  const isRegister = screen === 'register';

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.authContainer} keyboardShouldPersistTaps="handled">
          <View style={styles.brandMark}><Text style={styles.brandMarkText}>K</Text></View>
          <Text style={styles.logo}>konnet</Text>
          <Text style={styles.heading}>
            {isUsernameSetup ? 'Choose your username' : isRegister ? 'Create your account' : 'Connect with your people'}
          </Text>
          <Text style={styles.subtitle}>
            {isUsernameSetup
              ? 'One last step before you join Konnet.'
              : 'A place to share moments and stay connected.'}
          </Text>

          {!isUsernameSetup && isRegister && (
            <TextInput value={name} onChangeText={setName} placeholder="Your name" style={styles.input} />
          )}
          <TextInput
            value={username}
            onChangeText={(value) => setUsername(value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
            placeholder="Username"
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.input}
          />
          {!isUsernameSetup && (
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              secureTextEntry
              style={styles.input}
            />
          )}

          {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}

          <ActionButton
            title={busy ? 'Please wait…' : isUsernameSetup ? 'Finish setup' : isRegister ? 'Create account' : 'Sign in'}
            disabled={busy}
            onPress={isUsernameSetup ? finishUsername : isRegister ? signUp : signIn}
          />
          {!isUsernameSetup && (
            <ActionButton
              secondary
              title={isRegister ? 'I already have an account' : 'Create a new account'}
              onPress={() => { setError(''); setScreen(isRegister ? 'login' : 'register'); }}
            />
          )}
          {isUsernameSetup && <ActionButton secondary title="Sign out" onPress={signOut} />}
          <Text style={styles.footnote}>Built for your community.</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safe: { flex: 1, backgroundColor: '#F8FAFC' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FAFC', gap: 12 },
  authContainer: { flexGrow: 1, justifyContent: 'center', padding: 28 },
  brandMark: { width: 58, height: 58, borderRadius: 19, backgroundColor: BLUE, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  brandMarkText: { color: '#FFFFFF', fontSize: 32, fontWeight: '900' },
  logo: { color: BLUE, fontSize: 31, fontWeight: '900', letterSpacing: -1 },
  heading: { color: DARK, fontSize: 25, fontWeight: '800', marginTop: 28 },
  subtitle: { color: '#64748B', fontSize: 15, lineHeight: 22, marginTop: 8, marginBottom: 26 },
  input: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 15, fontSize: 16, marginBottom: 13, color: DARK },
  button: { backgroundColor: BLUE, borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  secondaryButton: { backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#DBEAFE' },
  secondaryButtonText: { color: BLUE },
  disabled: { opacity: 0.55 },
  error: { color: '#DC2626', marginVertical: 8, lineHeight: 20 },
  footnote: { color: '#94A3B8', textAlign: 'center', marginTop: 30 },
  muted: { color: '#64748B', fontSize: 14, lineHeight: 21, marginTop: 8 },
  homeHeader: { paddingHorizontal: 24, paddingVertical: 18, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  handle: { color: '#64748B', fontWeight: '600' },
  homeContent: { flex: 1, padding: 24, justifyContent: 'center' },
  welcome: { fontSize: 28, fontWeight: '900', color: DARK },
  featureCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, marginTop: 26, marginBottom: 20, borderWidth: 1, borderColor: '#E2E8F0' },
  featureTitle: { fontSize: 18, color: DARK, fontWeight: '800', marginBottom: 6 },
});