import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
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
  tertiary: '#fffeac',
  outline: '#767575',
  outlineVariant: '#484847',
  onSurface: '#ffffff',
  onSurfaceVariant: '#adaaaa',
  error: '#ff7351',
};

const CHAR_SIZE = 72;
const CHAR_GAP = 12;

const CHARACTERS = [
  { id: 1, source: require('../assets/images/cha1.png') },
  { id: 2, source: require('../assets/images/cha2.png') },
  { id: 3, source: require('../assets/images/cha3.png') },
  { id: 4, source: require('../assets/images/cha4.png') },
  { id: 5, source: require('../assets/images/cha5.png') },
  { id: 6, source: require('../assets/images/cha6.png') },
  { id: 7, source: require('../assets/images/cha7.png') },
  { id: 8, source: require('../assets/images/cha8.png') },
  { id: 9, source: require('../assets/images/cha9.png') },
  { id: 10, source: require('../assets/images/cha10.png') },
  { id: 11, source: require('../assets/images/cha11.png') },
  { id: 12, source: require('../assets/images/cha12.png') },
  { id: 13, source: require('../assets/images/cha13.png') },
  { id: 14, source: require('../assets/images/cha14.png') },
  { id: 15, source: require('../assets/images/cha15.png') },
  { id: 16, source: require('../assets/images/cha16.png') },
  { id: 17, source: require('../assets/images/cha17.png') },
  { id: 18, source: require('../assets/images/cha18.png') },
  { id: 19, source: require('../assets/images/cha19.png') },
  { id: 20, source: require('../assets/images/cha20.png') },
  { id: 21, source: require('../assets/images/cha21.png') },
];

export default function FamilyCreateScreen() {
  const [selectedChar, setSelectedChar] = useState(0);
  const [familyName, setFamilyName] = useState('');
  const [pincode, setPincode] = useState('');
  const [nameFocused, setNameFocused] = useState(false);
  const [pinFocused, setPinFocused] = useState(false);
  const [btnPressed, setBtnPressed] = useState(false);
  const [loading, setLoading] = useState(false);

  const pinError = pincode.length > 0 && pincode.length < 6;

  async function handleCreateGuild() {
    if (!familyName.trim()) {
      Alert.alert('Error', 'กรุณากรอก Family Name');
      return;
    }
    if (pincode.length < 6) {
      Alert.alert('Error', 'Secret Access Code ต้องมีอย่างน้อย 6 ตัว');
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('ไม่พบ user');

      // ดึง display_name จาก profiles
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('id', user.id)
        .single();

      // insert ลง families
      const { data: family, error: familyError } = await supabase
        .from('families')
        .insert({
          family_name: familyName.trim(),
          pin_code: pincode,
        })
        .select()
        .single();

      if (familyError) {
        if (familyError.code === '23505') {
          Alert.alert('Error', 'รหัสนี้ถูกใช้ไปแล้ว กรุณาเลือกรหัสใหม่');
        } else {
          Alert.alert('Error', familyError.message);
        }
        return;
      }

      // insert ลง family_members
      const { error: memberError } = await supabase
        .from('family_members')
        .insert({
          user_id: user.id,
          family_id: family.id,
          member_role: 'owner',
          avatar_key: `cha${selectedChar + 1}`,
          member_nickname: profile?.display_name ?? '',
        });

      if (memberError) throw memberError;

      Alert.alert(
        'สำเร็จ!',
        `สร้าง Guild "${familyName.trim()}" แล้ว!`,
        [{ text: 'OK', onPress: () => router.replace('/(app)/family' as any) }]
      );
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.headerRow}>
            <Pressable onPress={() => router.back()} style={styles.backBtn}>
              <Text style={styles.backIcon}>←</Text>
            </Pressable>
            <Text style={styles.headerTitle}>Join Family</Text>
            <Text style={styles.headerIcon}>🏰</Text>
          </View>

          {/* Hero section */}
          <View style={styles.heroBlock}>
            <View style={styles.castleFrame}>
              <Image
                source={require('../assets/images/castleicon.png')}
                style={styles.castleIcon}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.heroTitle}>
              CREATE <Text style={styles.heroTitleAccent}>FAMILY</Text>
            </Text>
            <Text style={styles.heroSub}>start shopping list with your family members</Text>
          </View>

          {/* card */}
          <View style={styles.card}>
            {/* Form */}
            <View style={styles.form}>

              {/* Select Character */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Select Your Character</Text>
                <FlatList
                  data={CHARACTERS}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={(item) => item.id.toString()}
                  contentContainerStyle={styles.charList}
                  ItemSeparatorComponent={() => <View style={{ width: CHAR_GAP }} />}
                  renderItem={({ item, index }) => {
                    const isSelected = selectedChar === index;
                    return (
                      <Pressable onPress={() => setSelectedChar(index)}>
                        <View style={[styles.charSlot, isSelected && styles.charSlotSelected]}>
                          <Image
                            source={item.source}
                            style={[styles.charImage, !isSelected && styles.charImageDim]}
                            resizeMode="contain"
                          />
                          {isSelected && <View style={styles.charSelectedDot} />}
                        </View>
                      </Pressable>
                    );
                  }}
                />
                <Text style={styles.scrollHint}>← เลื่อนเพื่อดูตัวละครทั้งหมด →</Text>
              </View>

              {/* Family Name */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Family Name</Text>
                <View style={[styles.inputRow, nameFocused && styles.inputRowFocused]}>
                  <TextInput
                    style={styles.input}
                    placeholder="E.G. THE IRON-BLOODS"
                    placeholderTextColor={COLORS.outline}
                    value={familyName}
                    onChangeText={(t) => t.length <= 24 && setFamilyName(t)}
                    onFocus={() => setNameFocused(true)}
                    onBlur={() => setNameFocused(false)}
                    autoCorrect={false}
                  />
                  <Text style={styles.inputIconText}>✏</Text>
                </View>
                <View style={styles.fieldMeta}>
                  <Text style={styles.metaText}>Name must be unique</Text>
                  <Text style={styles.metaText}>{familyName.length}/24 Char</Text>
                </View>
              </View>

              {/* Secret Access Code */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Secret Access Code</Text>
                <View style={[styles.inputRow, pinFocused && styles.inputRowFocused]}>
                  <TextInput
                    style={[styles.input, styles.inputPin]}
                    placeholder="••••••"
                    placeholderTextColor={COLORS.outline}
                    value={pincode}
                    onChangeText={setPincode}
                    onFocus={() => setPinFocused(true)}
                    onBlur={() => setPinFocused(false)}
                    secureTextEntry
                    keyboardType="number-pad"
                    maxLength={12}
                  />
                  <Text style={styles.inputIconText}>🔑</Text>
                </View>
                {pinError && (
                  <View style={styles.errorRow}>
                    <Text style={styles.errorText}>⚠ Minimum 6-digit passcode required</Text>
                  </View>
                )}
              </View>

              {/* Button */}
              <Pressable
                onPressIn={() => !loading && setBtnPressed(true)}
                onPressOut={() => setBtnPressed(false)}
                onPress={handleCreateGuild}
                disabled={loading}
              >
                <View style={styles.btnOuter}>
                  <View style={styles.btnShadow} />
                  <View style={[styles.btn, btnPressed && styles.btnPressed, loading && { opacity: 0.6 }]}>
                    <Text style={styles.btnText}>
                      {loading ? 'CREATING...' : 'START NEW FAMILY ⚔'}
                    </Text>
                  </View>
                </View>
              </Pressable>

            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  // Header
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 52,
    paddingBottom: 16,
    borderBottomWidth: 4,
    borderBottomColor: COLORS.surface,
    marginBottom: 32,
  },
  backBtn: {
    padding: 8,
  },
  backIcon: {
    color: COLORS.primary,
    fontSize: 20,
    fontWeight: '700',
  },
  headerTitle: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  headerIcon: {
    fontSize: 20,
  },

  // Hero
  heroBlock: {
    alignItems: 'center',
    marginBottom: 36,
  },
  castleFrame: {
    backgroundColor: COLORS.surfaceHighest,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
  },
  castleIcon: {
    width: 96,
    height: 96,
  },
  heroTitle: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.onSurface,
    textTransform: 'uppercase',
    letterSpacing: -1,
    textAlign: 'center',
    marginBottom: 6,
  },
  heroTitleAccent: {
    color: COLORS.primary,
  },
  heroSub: {
    fontFamily: 'SpaceGrotesk-Regular',
    fontSize: 11,
    color: COLORS.onSurfaceVariant,
    letterSpacing: 4,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: COLORS.surface,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 8, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 10,
  },
  // Form
  form: {
    gap: 24,
  },
  fieldGroup: {
    gap: 6,
  },
  label: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.secondary,
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: 4,
    marginLeft: 2,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLowest,
    borderWidth: 2,
    borderColor: COLORS.outline,
  },
  inputRowFocused: {
    borderColor: COLORS.tertiary,
  },
  input: {
    flex: 1,
    color: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 14,
    fontFamily: 'SpaceGrotesk-Bold',
    fontWeight: '700',
  },
  inputPin: {
    color: COLORS.tertiary,
    fontSize: 18,
    letterSpacing: 4,
  },
  inputIconText: {
    fontSize: 16,
    paddingRight: 14,
    color: COLORS.outline,
  },
  fieldMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  metaText: {
    fontFamily: 'SpaceGrotesk-Regular',
    fontSize: 10,
    color: COLORS.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  errorRow: {
    paddingHorizontal: 2,
  },
  errorText: {
    fontFamily: 'SpaceGrotesk-Regular',
    fontSize: 10,
    color: COLORS.error,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // Character selector
  charList: {
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  charSlot: {
    width: CHAR_SIZE,
    height: CHAR_SIZE,
    backgroundColor: COLORS.surfaceLowest,
    borderWidth: 2,
    borderColor: COLORS.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  charSlotSelected: {
    borderColor: COLORS.primary,
    borderWidth: 3,
    backgroundColor: COLORS.surfaceHighest,
  },
  charImage: {
    width: CHAR_SIZE - 12,
    height: CHAR_SIZE - 12,
  },
  charImageDim: {
    opacity: 0.45,
  },
  charSelectedDot: {
    position: 'absolute',
    bottom: 3,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
  },
  scrollHint: {
    fontFamily: 'SpaceGrotesk-Regular',
    fontSize: 9,
    color: COLORS.outline,
    letterSpacing: 1,
    textAlign: 'center',
    marginTop: 8,
  },

  // Button
  btnOuter: {
    position: 'relative',
    marginTop: 8,
  },
  btnShadow: {
    position: 'absolute',
    bottom: -6,
    left: 0,
    right: -4,
    height: '100%',
    backgroundColor: COLORS.surfaceHighest,
  },
  btn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPressed: {
    transform: [{ translateY: 2 }, { translateX: 1 }],
  },
  btnText: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 17,
    fontWeight: '900',
    color: COLORS.onPrimary,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
});