import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { supabase } from '../../lib/supabase';


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

const CHARACTERS: Record<string, any> = {
  cha1: require('../../assets/images/cha1.png'),
  cha2: require('../../assets/images/cha2.png'),
  cha3: require('../../assets/images/cha3.png'),
  cha4: require('../../assets/images/cha4.png'),
  cha5: require('../../assets/images/cha5.png'),
  cha6: require('../../assets/images/cha6.png'),
  cha7: require('../../assets/images/cha7.png'),
  cha8: require('../../assets/images/cha8.png'),
  cha9: require('../../assets/images/cha9.png'),
  cha10: require('../../assets/images/cha10.png'),
  cha11: require('../../assets/images/cha11.png'),
  cha12: require('../../assets/images/cha12.png'),
  cha13: require('../../assets/images/cha13.png'),
  cha14: require('../../assets/images/cha14.png'),
  cha15: require('../../assets/images/cha15.png'),
  cha16: require('../../assets/images/cha16.png'),
  cha17: require('../../assets/images/cha17.png'),
  cha18: require('../../assets/images/cha18.png'),
  cha19: require('../../assets/images/cha19.png'),
  cha20: require('../../assets/images/cha20.png'),
  cha21: require('../../assets/images/cha21.png'),
};

type Member = {
  user_id: string;
  member_nickname: string;
  avatar_key: string;
  member_role: string;
};

type FamilyInfo = {
  family_name: string;
  pin_code: string;
};

export default function FamilyScreen() {
  const [members, setMembers] = useState<Member[]>([]);
  const [familyInfo, setFamilyInfo] = useState<FamilyInfo | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  async function handleRefresh() {
    setRefreshing(true);
    await loadData()
    setRefreshing(false);
  }

  async function loadData() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setCurrentUserId(user.id);

      // หา family_id ของ user นี้
      const { data: myMember } = await supabase
        .from('family_members')
        .select('family_id')
        .eq('user_id', user.id)
        .single();

      if (!myMember) return;

      // ดึงข้อมูล family
      const { data: family } = await supabase
        .from('families')
        .select('family_name, pin_code')
        .eq('id', myMember.family_id)
        .single();

      if (family) setFamilyInfo(family);

      // ดึง members ทั้งหมดในครอบครัว
      const { data: memberList } = await supabase
        .from('family_members')
        .select('user_id, member_nickname, avatar_key, member_role')
        .eq('family_id', myMember.family_id);

      if (memberList) setMembers(memberList);

    } catch (err) {
      console.log('loadData error:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={COLORS.primary} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      >
        {/* Header */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionSubtitle}>Active Squad</Text>
            <Text style={styles.sectionTitle}>MEMBERS</Text>
          </View>
        </View>
        <View style={styles.divider} />

        {/* Member Grid */}
        <View style={styles.grid}>
          {members.map((member) => {
            const isOwner = member.member_role === 'owner';
            const isCurrentUser = member.user_id === currentUserId;
            const avatarSource = CHARACTERS[member.avatar_key] ?? CHARACTERS['cha1'];

            return (
              <View
                key={member.user_id}
                style={[
                  styles.memberCard,
                  isOwner && styles.memberCardOwner,
                ]}
              >
                {/* Owner badge */}
                {isOwner && (
                  <View style={styles.ownerBadge}>
                    <Text style={styles.ownerBadgeText}>OWNER</Text>
                  </View>
                )}

                {/* Avatar */}
                <View style={styles.avatarWrapper}>
                  <View style={styles.avatarFrame}>
                    <Image
                      source={avatarSource}
                      style={styles.avatarImage}
                      resizeMode="contain"
                    />
                  </View>
                  {/* Online tick — current user */}
                  {isCurrentUser && (
                    <View style={styles.activeTick}>
                      <Text style={styles.activeTickText}>✓</Text>
                    </View>
                  )}
                </View>

                <Text style={styles.memberName}>
                  {member.member_nickname || 'HERO'}
                </Text>
                <Text style={styles.memberRole}>
                  {member.member_role?.toUpperCase()}
                </Text>
              </View>
            );
          })}

          {/* Add seat placeholder */}
          <View style={styles.addCard}>
            <View style={styles.addIcon}>
              <Text style={styles.addIconText}>+</Text>
            </View>
            <Text style={styles.addText}>EMPTY Seat</Text>
          </View>
        </View>

        {/* Family Code section */}
        <View style={styles.codeSection}>
          <View style={styles.codeSectionHeader}>
            <Text style={styles.codeSectionIcon}>⚙</Text>
            <Text style={styles.codeSectionTitle}>Family Code</Text>
          </View>
          <View style={styles.codeBox}>
            <View>
              <Text style={styles.codeLabel}>FAMILY CODE</Text>
              <Text style={styles.codeValue}>{familyInfo?.pin_code ?? '------'}</Text>
            </View>
          </View>
        </View>

        {/* Leave Family */}
        <Pressable
          onPress={() => {
            Alert.alert(
              'ออกจากครอบครัว',
              'ต้องการออกจากครอบครัวนี้ไหม?',
              [
                { text: 'ยกเลิก', style: 'cancel' },
                {
                  text: 'ออก', style: 'destructive',
                  onPress: async () => {
                    const { data: { user } } = await supabase.auth.getUser();
                    if (!user) return;

                    // เช็คว่าเป็น owner ไหม
                    const { data: myMember } = await supabase
                      .from('family_members')
                      .select('member_role, family_id')
                      .eq('user_id', user.id)
                      .single();

                    if (myMember?.member_role === 'owner') {
                      // หาสมาชิกคนอื่นที่เข้ามาก่อน (joined_at น้อยสุด)
                      const { data: nextOwner } = await supabase
                        .from('family_members')
                        .select('user_id')
                        .eq('family_id', myMember.family_id)
                        .neq('user_id', user.id)
                        .order('joined_at', { ascending: true })
                        .limit(1)
                        .single();

                      if (nextOwner) {
                        // โอน ownership
                        await supabase
                          .from('family_members')
                          .update({ member_role: 'owner' })
                          .eq('user_id', nextOwner.user_id);
                      }
                    }

                    // ลบตัวเองออก
                    await supabase
                      .from('family_members')
                      .delete()
                      .eq('user_id', user.id);

                    router.push('/family_login' as any);
                  }
                },
              ]
            );
          }}
        >
          <View style={styles.leaveBtn}>
            <Text style={styles.leaveBtnText}>⚠ LEAVE FAMILY</Text>
          </View>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Scroll
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 100,
  },

  // Section header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.secondary,
    letterSpacing: 4,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  sectionTitle: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 36,
    fontWeight: '900',
    color: COLORS.onSurface,
    letterSpacing: -1,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.surfaceHighest,
    marginBottom: 24,
  },

  // Grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 40,
  },

  // Member card
  memberCard: {
    width: '47%',
    backgroundColor: COLORS.surfaceHigh,
    padding: 16,
    alignItems: 'center',
    position: 'relative',
    shadowColor: COLORS.surface,
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  memberCardOwner: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.secondary,
    backgroundColor: COLORS.surfaceBright,
  },
  ownerBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: COLORS.tertiary,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  ownerBadgeText: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 9,
    fontWeight: '900',
    color: COLORS.onTertiary,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 12,
    marginTop: 8,
  },
  avatarFrame: {
    width: 80,
    height: 80,
    backgroundColor: COLORS.surfaceLowest,
    padding: 4,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  activeTick: {
    position: 'absolute',
    bottom: -4,
    left: -4,
    width: 22,
    height: 22,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTickText: {
    color: COLORS.onPrimary,
    fontSize: 12,
    fontWeight: '900',
  },
  memberName: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.onSurface,
    textTransform: 'uppercase',
    letterSpacing: -0.5,
    textAlign: 'center',
    marginBottom: 2,
  },
  memberRole: {
    fontFamily: 'SpaceGrotesk-Regular',
    fontSize: 10,
    color: COLORS.outline,
    letterSpacing: 2,
    textTransform: 'uppercase',
    textAlign: 'center',
  },

  // Add card
  addCard: {
    width: '47%',
    borderWidth: 4,
    borderStyle: 'dashed',
    borderColor: COLORS.surfaceHighest,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 160,
    opacity: 0.6,
  },
  addIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: COLORS.surfaceHighest,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  addIconText: {
    color: COLORS.outline,
    fontSize: 24,
    fontWeight: '300',
  },
  addText: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.outline,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },

  // Family code section
  codeSection: {
    backgroundColor: COLORS.surfaceLow,
    padding: 24,
    marginBottom: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  codeSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  codeSectionIcon: {
    fontSize: 18,
    color: COLORS.tertiary,
  },
  codeSectionTitle: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.onSurface,
    textTransform: 'uppercase',
    letterSpacing: -0.5,
  },
  codeBox: {
    backgroundColor: COLORS.surfaceLowest,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.tertiary,
    padding: 16,
  },
  codeLabel: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.outline,
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  codeValue: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.onSurface,
    letterSpacing: -1,
  },
  leaveBtn: {
    borderWidth: 2,
    borderColor: COLORS.error,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  leaveBtnText: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.error,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
});