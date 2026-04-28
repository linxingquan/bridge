import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '../services/api';
import { SwipeCard } from '../components';
import { colors, spacing, borderRadius, typography } from '../theme';
import { ProfileCard } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const HomeScreen: React.FC = () => {
  const [profiles, setProfiles] = useState<ProfileCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [chatModal, setChatModal] = useState(false);
  const [matchedUser, setMatchedUser] = useState<any>(null);

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      const data = await api.getDiscoveryFeed();
      setProfiles(data);
    } catch (error) {
      console.error('Failed to load profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = async (userId: string, type: 'like' | 'pass' | 'superlike') => {
    try {
      const result = await api.swipeUser(userId, type);
      if (result.matched) {
        setMatchedUser(profiles.find((p) => p.id === userId));
        setChatModal(true);
        setTimeout(() => setChatModal(false), 3000);
      }
      setProfiles((prev) => prev.filter((p) => p.id !== userId));
    } catch (error) {
      console.error('Failed to swipe:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Bridge</Text>
      </View>

      <View style={styles.swipeContainer}>
        {profiles.length > 0 ? (
          profiles.map((profile, index) => (
            <SwipeCard
              key={profile.id}
              profile={profile}
              onSwipeRight={() => handleSwipe(profile.id, 'like')}
              onSwipeLeft={() => handleSwipe(profile.id, 'pass')}
              isTop={index === profiles.length - 1}
            />
          ))
        ) : (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No more people nearby</Text>
            <Text style={styles.emptySubtext}>
              Check back later for more potential chats
            </Text>
          </View>
        )}
      </View>

      {chatModal && (
        <View style={styles.chatOverlay}>
          <Text style={styles.chatTitle}>It's a Match!</Text>
          <Text style={styles.chatText}>
            You and {matchedUser?.name} liked each other.
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  title: {
    ...typography.headingLarge,
    color: colors.primary,
  },
  swipeContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  empty: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    ...typography.headingMedium,
    color: colors.textPrimary,
  },
  emptySubtext: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  chatOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,107,107,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  chatTitle: {
    ...typography.headingLarge,
    color: '#fff',
    fontSize: 48,
  },
  chatText: {
    ...typography.bodyLarge,
    color: '#fff',
    marginTop: spacing.md,
    textAlign: 'center',
  },
});
