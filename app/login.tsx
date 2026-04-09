import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import { supabase } from '../lib/supabase';

const COLORS = {
  background: '#0e0e0e',
  surface: '#1a1919',
  surfaceLow: '#131313',
  surfaceHigh: '#201f1f',
  surfaceHighest: '#262626',
  surfaceLowest: '#000000',
  primary: '#9cff93',
  onPrimary: '#006413',
  primaryShadow: '#006513',
  secondary: '#ff51fa',
  onSecondary: '#400040',
  tertiary: '#fffeac',
  outline: '#767575',
  outlineVariant: '#484847',
  onSurface: '#ffffff',
  onSurfaceVariant: '#adaaaa',
  error: '#ff7351',
};

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [userFocused, setUserFocused] = useState(false);
  const [passFocused, setPassFocused] = useState(false);
  const [btnPressed, setBtnPressed] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
  if (!username || !password) {
    Alert.alert('Error', 'กรุณากรอกข้อมูลให้ครบ');
    return;
  }

  setLoading(true);
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: username,
      password,
    });
    if (error) throw error;
    router.replace('/family_login');
  } catch (err: any) {
    Alert.alert('Error', err.message);
  } finally {
    setLoading(false);
  }
}

  return (
    <ImageBackground
      source={require('../assets/images/dungeonwalkway.png')}
      style={styles.bg}
      resizeMode="cover"
    >

      <KeyboardAvoidingView
        style={styles.root}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>FAMILY GUILD</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>SHOPPING QUESTS v1.0</Text>
            </View>
          </View>

          {/* Card */}
          <View style={styles.card}>
            {/* Corner accent */}
            <View style={styles.cornerAccent} />
            <Text style={styles.starAccent}>★</Text>

            <Text style={styles.cardTitle}>User Login</Text>

            {/* Username */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>USER_EMAIL</Text>
              <TextInput
                style={[styles.input, userFocused && styles.inputFocused]}
                placeholder="example@gmail.com"
                placeholderTextColor={COLORS.outlineVariant}
                value={username}
                onChangeText={setUsername}
                onFocus={() => setUserFocused(true)}
                onBlur={() => setUserFocused(false)}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Password */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>PASSWORD</Text>
              <TextInput
                style={[styles.input, passFocused && styles.inputFocused]}
                placeholder="••••••"
                placeholderTextColor={COLORS.outlineVariant}
                value={password}
                onChangeText={setPassword}
                onFocus={() => setPassFocused(true)}
                onBlur={() => setPassFocused(false)}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            {/* Login Button */}
            <Pressable
              onPressIn={() => !loading && setBtnPressed(true)}
              onPressOut={() => setBtnPressed(false)}
              onPress={handleLogin}
              disabled={loading}
              style={styles.btnWrapper}
            >
              <View style={[styles.btn, btnPressed && styles.btnActive, loading && { opacity: 0.6 }]}>
                <View style={[styles.btnShadow, btnPressed && styles.btnShadowActive]} />
                <Text style={styles.btnText}>{loading ? 'LOADING...' : '⚔ LOGIN'}</Text>
              </View>
            </Pressable>
          </View>

          {/* Register */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Dont have an account? </Text>
            <Pressable onPress={() => router.push('/register')}>
              <Text style={styles.footerLink}>Register Here</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
  },
  root: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    minHeight: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 36,
  },
  title: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 36,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: -1,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  badge: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.onSecondary,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: COLORS.surfaceLow,
    padding: 28,
    shadowColor: '#000000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  cornerAccent: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 48,
    height: 48,
    backgroundColor: COLORS.surfaceHighest,
  },
  starAccent: {
    position: 'absolute',
    top: 6,
    right: 8,
    fontSize: 12,
    color: COLORS.tertiary,
  },
  cardTitle: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.onSurface,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
    textAlign: 'center',
  },
  fieldGroup: {
    marginBottom: 20,
  },
  label: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.outline,
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.surfaceLowest,
    borderWidth: 2,
    borderColor: COLORS.outline,
    color: COLORS.tertiary,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
    fontFamily: 'SpaceGrotesk-Regular',
    letterSpacing: 1,
  },
  inputFocused: {
    borderColor: COLORS.tertiary,
  },
  btnWrapper: {
    marginTop: 8,
  },
  btn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    alignItems: 'center',
    position: 'relative',
    transform: [{ translateY: 0 }],
  },
  btnActive: {
    transform: [{ translateY: 4 }],
  },
  btnShadow: {
    position: 'absolute',
    bottom: -4,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: COLORS.primaryShadow,
  },
  btnShadowActive: {
    bottom: 0,
    height: 0,
  },
  btnText: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.onPrimary,
    letterSpacing: 4,
    textTransform: 'uppercase',
  },
  footer: {
    flexDirection: 'row',
    marginTop: 28,
    alignItems: 'center',
  },
  footerText: {
    fontFamily: 'SpaceGrotesk-Regular',
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  footerLink: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});