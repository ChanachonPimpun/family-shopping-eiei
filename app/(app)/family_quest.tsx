import { useHeaderHeight } from '@react-navigation/elements';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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
  primaryShadow: '#006513',
  secondary: '#ff51fa',
  tertiary: '#fffeac',
  tertiaryDim: '#f0f000',
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

type SortType = 'manual' | 'name' | 'price_desc' | 'price_asc';

type Item = {
  id: string;
  item_name: string;
  current_price: number | null;
  is_bought: boolean;
  created_by: string;
  item_month: string;
};

const SORT_OPTIONS: { label: string; value: SortType }[] = [
  { label: 'เพิ่มก่อนหลัง', value: 'manual' },
  { label: 'ชื่อ', value: 'name' },
  { label: 'ราคามาก → น้อย', value: 'price_desc' },
  { label: 'ราคาน้อย → มาก', value: 'price_asc' },
];

function getCurrentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function getMonthLabel(month: string) {
  const [year, m] = month.split('-');
  const thMonths = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
  return `${thMonths[parseInt(m) - 1]} ${year}`;
}

export default function FamilyQuestScreen() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [familyId, setFamilyId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserAvatar, setCurrentUserAvatar] = useState('cha1');
  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [sortBy, setSortBy] = useState<SortType>('manual');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [addBtnPressed, setAddBtnPressed] = useState(false);
  const headerHeight = useHeaderHeight();

  useFocusEffect(
  useCallback(() => {
    loadData();
  }, [])
);

  async function loadData() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setCurrentUserId(user.id);

      const { data: member } = await supabase
        .from('family_members')
        .select('family_id, avatar_key')
        .eq('user_id', user.id)
        .single();

      if (!member) return;
      setFamilyId(member.family_id);
      setCurrentUserAvatar(member.avatar_key ?? 'cha1');

      await loadItems(member.family_id);
    } catch (err) {
      console.log('loadData error:', err);
    } finally {
      setLoading(false);
    }
  }

  async function loadItems(fid: string) {
    const { data, error } = await supabase
      .from('shopping_items')
      .select('id, item_name, current_price, is_bought, created_by, item_month')
      .eq('family_id', fid)
      .order('created_at', { ascending: true });

    if (data) setItems(data);
  }

  async function handleAddItem() {
    if (!itemName.trim() || !familyId || !currentUserId) return;

    const { error } = await supabase
      .from('shopping_items')
      .insert({
        family_id: familyId,
        item_name: itemName.trim().toUpperCase(),
        current_price: itemPrice ? parseFloat(itemPrice) : null,
        is_bought: false,
        created_by: currentUserId,
        item_month: getCurrentMonth(),
      });

    if (error) {
      Alert.alert('Error', error.message);
      return;
    }

    setItemName('');
    setItemPrice('');
    await loadItems(familyId);
  }

  async function handleToggle(item: Item) {
    const { error } = await supabase
      .from('shopping_items')
      .update({
        is_bought: !item.is_bought,
        last_price: item.current_price,
      })
      .eq('id', item.id);

    if (!error && familyId) await loadItems(familyId);
  }

  async function handleDelete(id: string) {
    Alert.alert('ลบรายการ', 'ต้องการลบรายการนี้ไหม?', [
      { text: 'ยกเลิก', style: 'cancel' },
      {
        text: 'ลบ', style: 'destructive', onPress: async () => {
          await supabase.from('shopping_items').delete().eq('id', id);
          if (familyId) await loadItems(familyId);
        }
      },
    ]);
  }

  function getSortedItems() {
    const currentMonth = getCurrentMonth();
    const thisMonth = items.filter(i => i.item_month === currentMonth);
    const prevMonths = items.filter(i => i.item_month !== currentMonth);

    const sortFn = (a: Item, b: Item) => {
      if (sortBy === 'name') return a.item_name.localeCompare(b.item_name);
      if (sortBy === 'price_desc') return (b.current_price ?? 0) - (a.current_price ?? 0);
      if (sortBy === 'price_asc') return (a.current_price ?? 0) - (b.current_price ?? 0);
      return 0;
    };

    return [...thisMonth.sort(sortFn), ...prevMonths.sort(sortFn)];
  }

  const totalPrice = items.reduce((sum, i) => sum + (i.current_price ?? 0), 0);
  const boughtPrice = items.filter(i => i.is_bought).reduce((sum, i) => sum + (i.current_price ?? 0), 0);
  const currentMonth = getCurrentMonth();
  const sortedItems = getSortedItems();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={COLORS.primary} size="large" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={headerHeight}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.listHeader}>
          <View style={styles.listHeaderLeft}>
            <Text style={styles.listHeaderSub}>Active List</Text>
            <Text style={styles.listHeaderTitle}>Quests</Text>
          </View>
          <View style={styles.listHeaderRight}>
            <Text style={styles.budgetValue}>
              {totalPrice.toFixed(2)} <Text style={styles.budgetUnit}>THB</Text>
            </Text>
            <Text style={styles.budgetLabel}>Total price
            </Text>
          </View>
        </View>

        {/* Add item */}
        <View style={styles.addSection}>
          <Text style={styles.addSectionTitle}>ADD NEW QUEST</Text>
          <View style={styles.addInputRow}>
            <View style={[styles.addInputWrapper, { flex: 3 }]}>
              <TextInput
                style={styles.addInput}
                placeholder="ENTER ITEM NAME..."
                placeholderTextColor={COLORS.outline}
                value={itemName}
                onChangeText={setItemName}
                autoCapitalize="characters"
                autoCorrect={false}
              />
            </View>
            <View style={[styles.addInputWrapper, { flex: 1 }]}>
              <TextInput
                style={[styles.addInput, { textAlign: 'center' }]}
                placeholder="THB?"
                placeholderTextColor={COLORS.outline}
                value={itemPrice}
                onChangeText={setItemPrice}
                keyboardType="numeric"
              />
            </View>
          </View>
          <Pressable
            onPressIn={() => setAddBtnPressed(true)}
            onPressOut={() => setAddBtnPressed(false)}
            onPress={handleAddItem}
            disabled={!itemName.trim()}
          >
            <View style={styles.addBtnOuter}>
              <View style={styles.addBtnShadow} />
              <View style={[styles.addBtn, addBtnPressed && styles.addBtnPressed, !itemName.trim() && { opacity: 0.5 }]}>
                <Text style={styles.addBtnText}>ADD ITEM +</Text>
              </View>
            </View>
          </Pressable>
        </View>

        {/* Sort */}
        <View style={styles.sortRow}>
          <Pressable
            style={styles.sortBtn}
            onPress={() => setShowSortMenu(!showSortMenu)}
          >
            <Text style={styles.sortBtnLabel}>Sort By:</Text>
            <Text style={styles.sortBtnValue}>
              {SORT_OPTIONS.find(s => s.value === sortBy)?.label}
            </Text>
            <Text style={styles.sortBtnIcon}>▾</Text>
          </Pressable>
        </View>

        {/* Sort menu */}
        {showSortMenu && (
          <View style={styles.sortMenu}>
            {SORT_OPTIONS.map(opt => (
              <Pressable
                key={opt.value}
                style={[styles.sortMenuItem, sortBy === opt.value && styles.sortMenuItemActive]}
                onPress={() => { setSortBy(opt.value); setShowSortMenu(false); }}
              >
                <Text style={[styles.sortMenuItemText, sortBy === opt.value && styles.sortMenuItemTextActive]}>
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        {/* Items */}
        <View style={styles.itemList}>
          {sortedItems.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>ยังไม่มีรายการ</Text>
              <Text style={styles.emptySubText}>เพิ่ม Quest แรกได้เลย!</Text>
            </View>
          )}
          {sortedItems.map((item) => {
            const isOldMonth = item.item_month !== currentMonth;
            return (
              <View
                key={item.id}
                style={[
                  styles.itemRow,
                  item.is_bought && styles.itemRowBought,
                  !item.is_bought && isOldMonth && styles.itemRowOld,
                ]}
              >
                {/* Checkbox */}
                <Pressable
                  style={[styles.checkbox, item.is_bought && styles.checkboxChecked]}
                  onPress={() => handleToggle(item)}
                >
                  {item.is_bought && <Text style={styles.checkboxTick}>✓</Text>}
                </Pressable>

                {/* Content */}
                <View style={styles.itemContent}>
                  <View style={styles.itemNameRow}>
                    <Text style={[styles.itemName, item.is_bought && styles.itemNameBought]}>
                      {item.item_name}
                    </Text>
                    {isOldMonth && (
                      <View style={styles.oldMonthBadge}>
                        <Text style={styles.oldMonthText}>📌 {getMonthLabel(item.item_month)}</Text>
                      </View>
                    )}
                  </View>
                  {item.current_price != null && (
                    <Text style={[styles.itemPrice, item.is_bought && styles.itemPriceBought]}>
                      {item.current_price.toFixed(2)} THB
                    </Text>
                  )}
                </View>

                {/* Delete */}
                <Pressable style={styles.deleteBtn} onPress={() => handleDelete(item.id)}>
                  <Text style={styles.deleteBtnText}>🗑</Text>
                </Pressable>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  scroll: { flexGrow: 1 },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },

  // List header
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.secondary,
    paddingLeft: 16,
    marginBottom: 20,
  },
  listHeaderLeft: {},
  listHeaderSub: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.secondary,
    letterSpacing: 4,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  listHeaderTitle: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 36,
    fontWeight: '900',
    color: COLORS.onSurface,
    letterSpacing: -1,
  },
  listHeaderRight: {
    alignItems: 'flex-end',
  },
  budgetValue: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.tertiary,
  },
  budgetUnit: {
    fontSize: 11,
  },
  budgetLabel: {
    fontFamily: 'SpaceGrotesk-Regular',
    fontSize: 9,
    color: COLORS.outline,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },

  // Sort
  sortRow: {
    marginBottom: 16,
    marginTop: 16,
  },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.surfaceHighest,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 2,
    borderColor: COLORS.outline,
    alignSelf: 'flex-start',
  },
  sortBtnLabel: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 9,
    fontWeight: '900',
    color: COLORS.outline,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  sortBtnValue: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 9,
    fontWeight: '900',
    color: COLORS.onSurface,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  sortBtnIcon: {
    color: COLORS.outline,
    fontSize: 12,
  },
  sortMenu: {
    backgroundColor: COLORS.surfaceHigh,
    borderWidth: 2,
    borderColor: COLORS.outline,
    marginBottom: 16,
  },
  sortMenuItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
  },
  sortMenuItemActive: {
    backgroundColor: COLORS.surfaceBright,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  sortMenuItemText: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sortMenuItemTextActive: {
    color: COLORS.primary,
  },

  // Items
  itemList: {
    gap: 8,
    marginBottom: 32,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 16,
    color: COLORS.outline,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  emptySubText: {
    fontFamily: 'SpaceGrotesk-Regular',
    fontSize: 11,
    color: COLORS.outlineVariant,
    marginTop: 4,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: 13,
    gap: 12,
  },
  itemRowBought: {
    opacity: 0.5,
  },
  itemRowOld: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.secondary,
    backgroundColor: COLORS.surfaceBright,
  },
  checkbox: {
    width: 40,
    height: 40,
    borderWidth: 3,
    borderColor: COLORS.outline,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  checkboxTick: {
    color: COLORS.onPrimary,
    fontSize: 14,
    fontWeight: '900',
  },
  itemContent: {
    flex: 1,
  },
  itemNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  itemName: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.onSurface,
    letterSpacing: -0.5,
  },
  itemNameBought: {
    textDecorationLine: 'line-through',
    color: COLORS.outline,
  },
  oldMonthBadge: {
    backgroundColor: COLORS.surfaceHighest,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  oldMonthText: {
    fontFamily: 'SpaceGrotesk-Regular',
    fontSize: 9,
    color: COLORS.onSurfaceVariant,
    letterSpacing: 1,
  },
  itemPrice: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.tertiaryDim,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  itemPriceBought: {
    color: COLORS.outline,
  },
  deleteBtn: {
    padding: 8,
  },
  deleteBtnText: {
    fontSize: 18,
  },

  // Add section
  addSection: {
    gap: 12,
  },
  addSectionTitle: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.outline,
    letterSpacing: 5,
    textTransform: 'uppercase',
  },
  addInputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  addInputWrapper: {
    backgroundColor: COLORS.surfaceLowest,
    borderWidth: 2,
    borderColor: COLORS.outline,
  },
  addInput: {
    color: COLORS.onSurface,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 13,
    fontFamily: 'SpaceGrotesk-Bold',
    fontWeight: '700',
  },
  addBtnOuter: {
    position: 'relative',
  },
  addBtnShadow: {
    position: 'absolute',
    bottom: -4,
    left: 0,
    right: -4,
    height: '100%',
    backgroundColor: COLORS.primaryShadow,
  },
  addBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  addBtnPressed: {
    transform: [{ translateY: 2 }, { translateX: 1 }],
  },
  addBtnText: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.onPrimary,
    letterSpacing: 4,
    textTransform: 'uppercase',
  },
});