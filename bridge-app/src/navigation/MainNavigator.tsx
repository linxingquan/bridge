import React, { useState, useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, StyleSheet } from 'react-native';
import {
  HomeScreen,
  MatchesScreen,
  ChatListScreen,
  ChatScreen,
  ProfileScreen,
  EditProfileScreen,
  SettingsScreen,
  SinglesScreen,
  ProfileDetailScreen,
} from '../screens';
import { colors, typography } from '../theme';
import { api } from '../services/api';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TabIcon: React.FC<{ name: string; focused: boolean; hasUnread?: boolean }> = ({ name, focused, hasUnread }) => {
  const icons: Record<string, string> = {
    Singles: '👥',
    Discover: '🔥',
    Matches: '♥',
    Messages: '💬',
    Profile: '👤',
  };

  return (
    <View style={styles.tabIconContainer}>
      <Text style={[styles.tabIcon, focused && styles.tabIconFocused]}>
        {icons[name]}
      </Text>
      {name === 'Messages' && hasUnread && (
        <View style={styles.unreadBadge} />
      )}
    </View>
  );
};

const MainTabs: React.FC = () => {
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    const checkUnread = async () => {
      try {
        const currentUser = await api.getMe();
        const chats = await api.getChats();
        const hasUnreadMessages = chats.some((chat: any) => {
          if (typeof chat.unreadCount === 'number') {
            return chat.unreadCount > 0;
          }

          const lastMessage = chat.lastMessage;
          if (!lastMessage || lastMessage.isRead) {
            return false;
          }

          const senderId =
            typeof lastMessage.senderId === 'string'
              ? lastMessage.senderId
              : lastMessage.senderId?._id;
          return senderId && senderId !== currentUser?._id;
        });
        setHasUnread(hasUnreadMessages);
      } catch (error) {
        console.error('Failed to check unread:', error);
      }
    };

    checkUnread();
    const interval = setInterval(checkUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => <TabIcon name={route.name} focused={focused} hasUnread={hasUnread} />,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
      })}
    >
      <Tab.Screen name="Singles" component={SinglesScreen} />
      <Tab.Screen name="Discover" component={HomeScreen} />
      <Tab.Screen name="Matches" component={MatchesScreen} />
      <Tab.Screen name="Messages" component={ChatListScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export const MainNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="ProfileDetail" component={ProfileDetailScreen} />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
tabBar: {
    height: 85,
    paddingBottom: 24,
    paddingTop: 8,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.surface,
  },
  tabLabel: {
    ...typography.caption,
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIcon: {
    fontSize: 24,
  },
  tabIconFocused: {
    transform: [{ scale: 1.1 }],
  },
  unreadBadge: {
    position: 'absolute',
    top: 1,
    right: -4,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF3B30',
  },
});