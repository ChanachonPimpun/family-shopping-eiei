import { Tabs } from 'expo-router';
import { Text } from 'react-native';

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
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