import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
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
  tertiary: '#fffeac',
  outline: '#767575',
  outlineVariant: '#484847',
  onSurface: '#ffffff',
  onSurfaceVariant: '#adaaaa',
  error: '#ff7351',
};

type ItemRecord = {
  item_name: string;
  current_price: number | null;
  item_month: string;
  updated_at: string;
};

type ComparedItem = {
  item_name: string;
  currentPrice: number | null;
  lastPrice: number | null;
  change: number | null; // % เปลี่ยนแปลง
  status: 'up' | 'down' | 'stable' | 'new';
};

function getCurrentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function getLastMonth() {
  const now = new Date();
  now.setMonth(now.getMonth() - 1);
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function compareItems(records: ItemRecord[]): ComparedItem[] {
  const currentMonth = getCurrentMonth();
  const lastMonth = getLastMonth();

  // แยกตามเดือน
  const thisMonthRecords = records.filter(r => r.item_month === currentMonth);
  const lastMonthRecords = records.filter(r => r.item_month === lastMonth);

  // group ตามชื่อ เอาอันล่าสุด
  const getLatest = (items: ItemRecord[], name: string) => {
    return items
      .filter(i => i.item_name === name)
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())[0];
  };

  // รวมชื่อทั้งหมดจากเดือนนี้
  const names = [...new Set(thisMonthRecords.map(r => r.item_name))];

  return names.map(name => {
    const current = getLatest(thisMonthRecords, name);
    const last = getLatest(lastMonthRecords, name);

    const currentPrice = current?.current_price ?? null;
    const lastPrice = last?.current_price ?? null;

    let status: ComparedItem['status'] = 'new';
    let change: number | null = null;

    if (lastPrice == null) {
      status = 'new';
    } else if (currentPrice == null || currentPrice === lastPrice) {
      status = 'stable';
      change = 0;
    } else if (currentPrice > lastPrice) {
      status = 'up';
      change = ((currentPrice - lastPrice) / lastPrice) * 100;
    } else {
      status = 'down';
      change = ((currentPrice - lastPrice) / lastPrice) * 100;
    }

    return { item_name: name, currentPrice, lastPrice, change, status };
  });
}

export default function FamilyHistoryScreen() {
  const [items, setItems] = useState<ComparedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
  useCallback(() => {
    loadHistory();
  }, [])
);

  async function loadHistory() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: member } = await supabase
        .from('family_members')
        .select('family_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!member) return;

      const currentMonth = getCurrentMonth();
      const lastMonth = getLastMonth();

      const { data } = await supabase
        .from('shopping_items')
        .select('item_name, current_price, item_month, updated_at')
        .eq('family_id', member.family_id)
        .eq('is_bought', true)
        .in('item_month', [currentMonth, lastMonth])
        .order('updated_at', { ascending: false });

      if (data) setItems(compareItems(data));
    } catch (err) {
      console.log('loadHistory error:', err);
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
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Price History</Text>
        <View style={styles.headerAccent} />
      </View>

      {items.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>ยังไม่มีประวัติ</Text>
          <Text style={styles.emptySubText}>ซื้อของแล้วติ๊กถูกเพื่อบันทึกประวัติ</Text>
        </View>
      )}

      {/* Item Cards */}
      <View style={styles.list}>
        {items.map((item, index) => {
          const isUp = item.status === 'up';
          const isDown = item.status === 'down';
          const isNew = item.status === 'new';
          const isStable = item.status === 'stable';

          const accentColor = isUp ? COLORS.error : isDown ? COLORS.primary : COLORS.outline;
          const badgeBorderColor = isUp ? COLORS.error : isDown ? COLORS.primary : COLORS.outline;
          const badgeTextColor = isUp ? COLORS.error : isDown ? COLORS.primary : COLORS.outline;

          const badgeText = isNew ? 'NEW'
            : isStable ? 'STABLE'
            : `${item.change! > 0 ? '+' : ''}${item.change!.toFixed(0)}%`;

          const trendIcon = isUp ? '↑' : isDown ? '↓' : '—';

          return (
            <View key={index} style={styles.card}>
              {/* Top row */}
              <View style={styles.cardTop}>
                <Text style={styles.itemName}>{item.item_name}</Text>
                <View style={[styles.badge, { borderColor: badgeBorderColor }]}>
                  <Text style={[styles.badgeTrend, { color: badgeTextColor }]}>
                    {trendIcon}
                  </Text>
                  <Text style={[styles.badgeText, { color: badgeTextColor }]}>
                    {badgeText}
                  </Text>
                </View>
              </View>

              {/* Price comparison */}
              <View style={styles.priceRow}>
                <View style={styles.priceBox}>
                  <Text style={styles.priceLabel}>Last Time</Text>
                  <Text style={styles.priceValue}>
                    {item.lastPrice != null ? `${item.lastPrice.toFixed(2)} THB` : '—'}
                  </Text>
                </View>
                <View style={[styles.priceBoxCurrent, { borderBottomColor: accentColor }]}>
                  <Text style={[styles.priceLabel, { color: accentColor }]}>Current</Text>
                  <Text style={styles.priceValue}>
                    {item.currentPrice != null ? `${item.currentPrice.toFixed(2)} THB` : '—'}
                  </Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
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
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },

  // Header
  header: {
    marginBottom: 24,
    gap: 8,
  },
  headerTitle: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 36,
    fontWeight: '900',
    color: COLORS.onSurface,
    textTransform: 'uppercase',
    letterSpacing: -1,
  },
  headerAccent: {
    width: 96,
    height: 4,
    backgroundColor: COLORS.primary,
  },

  // Empty
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 8,
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
    textAlign: 'center',
  },

  // List
  list: {
    gap: 12,
  },

  // Card
  card: {
    backgroundColor: COLORS.surface,
    padding: 20,
    gap: 16,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  itemName: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: -0.5,
    flex: 1,
    marginRight: 12,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 2,
    backgroundColor: COLORS.surfaceLowest,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeTrend: {
    fontSize: 13,
    fontWeight: '900',
  },
  badgeText: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },

  // Price comparison
  priceRow: {
    flexDirection: 'row',
    gap: 12,
  },
  priceBox: {
    flex: 1,
    backgroundColor: COLORS.surfaceLow,
    padding: 12,
    gap: 4,
  },
  priceBoxCurrent: {
    flex: 1,
    backgroundColor: COLORS.surfaceBright,
    padding: 12,
    gap: 4,
    borderBottomWidth: 4,
  },
  priceLabel: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.outline,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  priceValue: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.onSurface,
    letterSpacing: -0.5,
  },
});