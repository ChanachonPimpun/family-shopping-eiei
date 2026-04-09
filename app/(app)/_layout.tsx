import { router, Tabs } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { supabase } from '../../lib/supabase';

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

function AppHeader() {
  const [avatarKey, setAvatarKey] = useState('cha1');
  const [showMenu, setShowMenu] = useState(false);
  const [familyName, setFamilyName] = useState('FAMILY_GROCERY');

  // ดึง avatar ของ user ปัจจุบัน
  useState(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase
        .from('family_members')
        .select('avatar_key, family_id')
        .eq('user_id', user.id)
        .maybeSingle()
        .then(({ data: member }) => {
          if (member?.avatar_key) setAvatarKey(member.avatar_key);
          if (member?.family_id) {
            // ดึง family_name
            supabase
              .from('families')
              .select('family_name')
              .eq('id', member.family_id)
              .single()
              .then(({ data: family }) => {
                if (family?.family_name) setFamilyName(family.family_name.toUpperCase());
              });
          }
        });
    });
  });

  async function handleLogout() {
    Alert.alert('ออกจากระบบ', 'ต้องการออกจากระบบไหม?', [
      { text: 'ยกเลิก', style: 'cancel' },
      {
        text: 'ออก', style: 'destructive', onPress: async () => {
          setShowMenu(false);
          await supabase.auth.signOut();
          router.replace('/login' as any);
        }
      },
    ]);
  }

  return (
    <>
      <View style={styles.header}>
        <Pressable style={styles.headerIcon}>
          {/* <Text style={styles.headerIconText}>☰</Text> */}
        </Pressable>
        <Text style={styles.headerTitle}>{familyName}</Text>
        <Pressable
          style={styles.avatarBtn}
          onPress={() => setShowMenu(true)}
        >
          <Image
            source={CHARACTERS[avatarKey]}
            style={styles.avatarImg}
            resizeMode="contain"
          />
        </Pressable>
      </View>

      {/* Profile Menu Modal */}
      <Modal
        visible={showMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowMenu(false)}
        >
          <View style={styles.menuCard}>
            <View style={styles.menuHeader}>
              <Image
                source={CHARACTERS[avatarKey]}
                style={styles.menuAvatar}
                resizeMode="contain"
              />
            </View>
            <Pressable
              style={styles.menuItem}
              onPress={handleLogout}
            >
              <Text style={styles.menuItemIcon}>⚠</Text>
              <Text style={styles.menuItemText}>LOGOUT</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        header: () => <AppHeader />,
        tabBarStyle: {
          backgroundColor: '#131313',
          borderTopWidth: 4,
          borderTopColor: '#1a1919',
          height: 72,
        },
        tabBarActiveTintColor: '#9cff93',
        tabBarInactiveTintColor: '#767575',
        tabBarLabelStyle: {
          fontFamily: 'SpaceGrotesk-Bold',
          fontSize: 9,
          letterSpacing: 2,
          textTransform: 'uppercase',
        },
      }}
    >
      <Tabs.Screen
        name="family_quest"
        options={{
          title: 'Quests',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🛒</Text>,
        }}
      />
      <Tabs.Screen
        name="family_history"
        options={{
          title: 'History',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>📜</Text>,
        }}
      />
      <Tabs.Screen
        name="family"
        options={{
          title: 'Family',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>👥</Text>,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 64,
    backgroundColor: '#0e0e0e',
    borderBottomWidth: 4,
    borderBottomColor: '#1a1919',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    shadowColor: '#262626',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
  },
  headerIcon: { padding: 8 },
  headerTitle: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 18,
    color: '#9cff93',
    textTransform: 'uppercase',
  },
  avatarBtn: {
    width: 40,
    height: 40,
    backgroundColor: '#2c2c2c',
    borderWidth: 2,
    borderColor: '#9cff93',
    overflow: 'hidden',
  },
  avatarImg: { width: '100%', height: '100%' },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 72,
    paddingRight: 16,
  },
  menuCard: {
    backgroundColor: '#201f1f',
    borderWidth: 2,
    borderColor: '#484847',
    minWidth: 180,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },
  menuHeader: {
    padding: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#484847',
  },
  menuAvatar: {
    width: 64,
    height: 64,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 16,
  },
  menuItemIcon: { fontSize: 14 },
  menuItemText: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 13,
    fontWeight: '900',
    color: '#ff7351',
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
});