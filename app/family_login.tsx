import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
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
  surfaceBright: '#2c2c2c',
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

export default function FamilyLoginScreen() {
  const [selectedChar, setSelectedChar] = useState(0);
  const [guildCode, setGuildCode] = useState('');
  const [codeFocused, setCodeFocused] = useState(false);
  const [btnPressed, setBtnPressed] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    checkExistingFamily();
  }, []);

  async function checkExistingFamily() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: member, error: memberError } = await supabase
        .from('family_members')
        .select('family_id')
        .eq('user_id', user.id)
        .single();

      console.log('user.id:', user.id);
      console.log('member:', JSON.stringify(member));
      console.log('memberError:', JSON.stringify(memberError));

      if (member?.family_id) {
        router.replace('/family' as any);
      }
    } catch {
      // ยังไม่มีครอบครัว อยู่หน้านี้ต่อ
    }
  }

  async function handleQuestStart() {
    if (!guildCode) {
      Alert.alert('Error', 'กรุณากรอก Secret Family Code');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('ไม่พบ user');

      // หา family จาก pin_code ตรงๆ
      const { data: family, error: familyError } = await supabase
        .from('families')
        .select('id')
        .eq('pin_code', guildCode)
        .single();

      if (familyError || !family) {
        Alert.alert('Error', 'ไม่พบครอบครัว หรือรหัสไม่ถูกต้อง');
        return;
      }

      // insert ลง family_members
      const { error: joinError } = await supabase
        .from('family_members')
        .insert({
          user_id: user.id,
          family_id: family.id,
          member_role: 'member',
          avatar_key: `cha${selectedChar + 1}`,
          member_nickname: '',
        });

      if (joinError) throw joinError;

      router.replace('/family' as any);

    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  }

  return (
    <ImageBackground
      source={require('../assets/images/dungeonwalkway.png')}
      style={styles.bg}
      resizeMode="cover"
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Branding */}
          <View style={styles.brandingBlock}>
            <View style={styles.catFrame}>
              <Image
                source={require('../assets/images/cat.png')}
                style={styles.catImage}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.title}>FAMILY START!</Text>
            <Text style={styles.titleSub}>READY YOUR QUESTING PARTY</Text>
          </View>

          {/* Main Card */}
          <View style={styles.card}>

            {/* Select Character */}
            <Text style={styles.sectionLabel}>Select Character</Text>
            <FlatList
              ref={flatListRef}
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

            {/* Secret Family Code */}
            <View style={styles.fieldGroup}>
              <Text style={styles.sectionLabel}>Secret Family Code</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputIcon}>🔑</Text>
                <TextInput
                  style={[styles.input, codeFocused && styles.inputFocused]}
                  placeholder="••••••"
                  placeholderTextColor={COLORS.outlineVariant}
                  value={guildCode}
                  onChangeText={setGuildCode}
                  onFocus={() => setCodeFocused(true)}
                  onBlur={() => setCodeFocused(false)}
                  secureTextEntry
                  autoCapitalize="none"
                />
                <View style={styles.blinkDot} />
              </View>
            </View>

            {/* Quest Start Button */}
            <Pressable
              onPressIn={() => setBtnPressed(true)}
              onPressOut={() => setBtnPressed(false)}
              onPress={handleQuestStart}
            >
              <View style={styles.btnOuter}>
                <View style={styles.btnShadowLayer} />
                <View style={[styles.btn, btnPressed && styles.btnPressed]}>
                  <Text style={styles.btnText}>QUEST START</Text>
                </View>
              </View>
            </Pressable>
          </View>

          {/* Footer links */}
          <View style={styles.footer}>
            <Pressable onPress={() => router.push('/family_create' as any)}>
              <Text style={styles.footerSecondary}>[ Wanna create family? ]</Text>
              <Text style={styles.footerPrimary}>[ CREATE NEW FAMILY ]</Text>
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
    backgroundColor: COLORS.background,
  },
  scroll: {
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 20,
  },

  // Branding
  brandingBlock: {
    alignItems: 'center',
    marginBottom: 28,
  },
  catFrame: {
    backgroundColor: COLORS.surfaceHigh,
    padding: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
  },
  catImage: {
    width: 96,
    height: 96,
  },
  title: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 38,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: 4,
    textTransform: 'uppercase',
    textShadowColor: COLORS.primaryShadow,
    textShadowOffset: { width: 4, height: 4 },
    textShadowRadius: 0,
  },
  titleSub: {
    fontFamily: 'SpaceGrotesk-Regular',
    fontSize: 11,
    color: COLORS.onSurfaceVariant,
    letterSpacing: 4,
    textTransform: 'uppercase',
    marginTop: 6,
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
  sectionLabel: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.secondary,
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: 12,
  },

  // Character selector
  charList: {
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  charSlot: {
    width: CHAR_SIZE,
    height: CHAR_SIZE,
    backgroundColor: COLORS.surfaceLow,
    borderWidth: 2,
    borderColor: COLORS.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  charSlotSelected: {
    borderColor: COLORS.primary,
    borderWidth: 3,
    backgroundColor: COLORS.surfaceBright,
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
    marginBottom: 20,
  },

  // Input
  fieldGroup: {
    marginBottom: 24,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLowest,
    borderWidth: 2,
    borderColor: COLORS.outline,
    position: 'relative',
  },
  inputIcon: {
    fontSize: 16,
    paddingLeft: 12,
  },
  input: {
    flex: 1,
    color: COLORS.onSurface,
    paddingHorizontal: 12,
    paddingVertical: 16,
    fontSize: 22,
    fontFamily: 'SpaceGrotesk-Bold',
    letterSpacing: 8,
    borderWidth: 0,
  },
  inputFocused: {
    borderColor: COLORS.tertiary,
  },
  blinkDot: {
    width: 10,
    height: 4,
    backgroundColor: COLORS.tertiary,
    marginRight: 12,
  },

  // Button
  btnOuter: {
    position: 'relative',
    marginBottom: 4,
  },
  btnShadowLayer: {
    position: 'absolute',
    top: 4,
    left: 2,
    right: -2,
    bottom: -4,
    backgroundColor: COLORS.primaryShadow,
  },
  btn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  btnPressed: {
    transform: [{ translateY: 2 }, { translateX: 1 }],
  },
  btnText: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.onPrimary,
    letterSpacing: 4,
    textTransform: 'uppercase',
  },

  // Footer
  footer: {
    alignItems: 'center',
    alignContent: 'center',
    marginTop: 28,
    gap: 10,
  },
  footerSecondary: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    color: COLORS.onSurfaceVariant,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  footerPrimary: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 12,
    fontWeight: '900',
    marginTop: 10,
    color: COLORS.primary,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
});