// app/register.tsx
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
  onTertiary: '#4e4e00',
  outline: '#767575',
  outlineVariant: '#484847',
  onSurface: '#ffffff',
  onSurfaceVariant: '#adaaaa',
  error: '#ff7351',
};

export default function RegisterScreen() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [btnPressed, setBtnPressed] = useState(false);

  const [focused, setFocused] = useState<string | null>(null);

  const inputStyle = (field: string) => [
    styles.input,
    focused === field && styles.inputFocused,
  ];

  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!displayName || !email || !password || !confirm) {
      Alert.alert('Error', 'กรุณากรอกข้อมูลให้ครบ');
      return;
    }
    if (password !== confirm) {
      Alert.alert('Error', 'Password ไม่ตรงกัน');
      return;
    }

    setLoading(true);
    try {
      // สมัคร Supabase Auth ด้วย email สมมติ
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });
      if (signUpError) throw signUpError;

      // insert ลง profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user?.id,
          username: email,
          display_name: displayName,
        });
      if (profileError) throw profileError;

      Alert.alert('สำเร็จ!', 'สร้างบัญชีแล้ว', [
        { text: 'OK', onPress: () => router.replace('/login') },
      ]);
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
            <Text style={styles.title}>CREATE ACCOUNT</Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            {/* Corner pixel dots */}
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />

            {/* Display Name */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Display Name</Text>
              <TextInput
                style={inputStyle('displayName')}
                placeholder="E.G. PLAYER ONE"
                placeholderTextColor={COLORS.outlineVariant}
                value={displayName}
                onChangeText={setDisplayName}
                onFocus={() => setFocused('displayName')}
                onBlur={() => setFocused(null)}
                autoCorrect={false}
              />
            </View>

            {/* gmail */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={inputStyle('email')}
                placeholder="example@gmail.com"
                placeholderTextColor={COLORS.outlineVariant}
                value={email}
                onChangeText={setEmail}
                onFocus={() => setFocused('email')}
                onBlur={() => setFocused(null)}
                autoCapitalize="none"
                keyboardType="email-address"
                autoCorrect={false}
              />
            </View>

            {/* Password row */}
            <View style={styles.passwordRow}>
              <View style={[styles.fieldGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>Password</Text>
                <TextInput
                  style={inputStyle('password')}
                  placeholder="••••••••"
                  placeholderTextColor={COLORS.outlineVariant}
                  value={password}
                  onChangeText={setPassword}
                  onFocus={() => setFocused('password')}
                  onBlur={() => setFocused(null)}
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>
              <View style={[styles.fieldGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>Confirm</Text>
                <TextInput
                  style={inputStyle('confirm')}
                  placeholder="••••••••"
                  placeholderTextColor={COLORS.outlineVariant}
                  value={confirm}
                  onChangeText={setConfirm}
                  onFocus={() => setFocused('confirm')}
                  onBlur={() => setFocused(null)}
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Submit Button */}
            <Pressable
              style={styles.btnWrapper}
              onPressIn={() => !loading && setBtnPressed(true)}
              onPressOut={() => setBtnPressed(false)}
              onPress={handleRegister}
              disabled={loading}
            >
              <View style={[styles.btn, btnPressed && styles.btnActive, loading && { opacity: 0.6 }]}>
                <View style={[styles.btnShadow, btnPressed && styles.btnShadowActive]} />
                <Text style={styles.btnText}>{loading ? 'LOADING...' : '🛡 CREATE ACCOUNT'}</Text>
              </View>
            </Pressable>

            {/* Back to login */}
            <View style={styles.loginRow}>
              <Text style={styles.loginText}>Already registered? </Text>
              <Pressable onPress={() => router.push('/login')}>
                <Text style={styles.loginLink}>Login here</Text>
              </Pressable>
            </View>
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
    marginBottom: 28,
  },
  title: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 30,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: -1,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: COLORS.surface,
    padding: 28,
    position: 'relative',
    // chunky shadow
    shadowColor: '#000000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },
  corner: {
    position: 'absolute',
    width: 8,
    height: 8,
  },
  cornerTL: { top: 0, left: 0, backgroundColor: COLORS.primary },
  cornerTR: { top: 0, right: 0, backgroundColor: COLORS.secondary },
  cornerBL: { bottom: 0, left: 0, backgroundColor: COLORS.tertiary },
  cornerBR: { bottom: 0, right: 0, backgroundColor: COLORS.error },
  fieldGroup: {
    marginBottom: 20,
  },
  label: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.secondary,
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.surfaceLowest,
    borderWidth: 2,
    borderColor: COLORS.outline,
    color: COLORS.onSurface,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 13,
    fontFamily: 'SpaceGrotesk-Regular',
    letterSpacing: 1,
  },
  inputFocused: {
    borderColor: COLORS.tertiary,
  },
  passwordRow: {
    flexDirection: 'row',
  },
  btnWrapper: {
    marginTop: 8,
    marginBottom: 4,
  },
  btn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    alignItems: 'center',
    position: 'relative',
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
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.onPrimary,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    alignItems: 'center',
  },
  loginText: {
    fontFamily: 'SpaceGrotesk-Regular',
    fontSize: 11,
    color: COLORS.outline,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  loginLink: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    textDecorationLine: 'underline',
  },
});