import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SwipeCard } from '../components';
import { api } from '../services/api';
import { colors, spacing, borderRadius, typography } from '../theme';
import { ProfileCard } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const HomeScreen: React.FC = () => {
  const [feed, setFeed] = useState<ProfileCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [matchModal, setMatchModal] = useState(false);

  const loadFeed = async () => {
    try {
      const profiles = await api.getDiscoveryFeed();
      setFeed(profiles);
    } catch (error) {
      console.error('Failed to load feed:', error);
    }
  };

  useEffect(() => {
    loadFeed();
  }, []);

  const handleSwipeLeft = useCallback(async () => {
    if (!feed[currentIndex]) return;
    setLoading(true);
    try {
      await api.swipeUser(feed[currentIndex].id, 'pass');
      setCurrentIndex(currentIndex + 1);
    } catch (error) {
      console.error('Swipe error:', error);
    } finally {
      setLoading(false);
    }
  }, [feed, currentIndex]);

  const handleSwipeRight = useCallback(async () => {
    if (!feed[currentIndex]) return;
    setLoading(true);
    try {
      const result = await api.swipeUser(feed[currentIndex].id, 'like');
      if (result.matched) {
        setMatchModal(true);
        setTimeout(() => setMatchModal(false), 3000);
      }
      setCurrentIndex(currentIndex + 1);
    } catch (error) {
      console.error('Swipe error:', error);
    } finally {
      setLoading(false);
    }
  }, [feed, currentIndex]);

  const renderCard = () => {
    if (currentIndex >= feed.length) {
      return (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No more profiles</Text>
          <Text style={styles.emptyText}>
            Check back later for more matches
          </Text>
        </View>
      );
    }

    return (
      <SwipeCard
        profile={feed[currentIndex]}
        onSwipeLeft={handleSwipeLeft}
        onSwipeRight={handleSwipeRight}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>Bridge</Text>
        <TouchableOpacity>
          <Text style={styles.filterButton}>Filters</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.cardsContainer}>{renderCard()}</View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.passButton]}
          onPress={handleSwipeLeft}
          disabled={loading}
        >
          <Text style={styles.actionIcon}>✕</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.likeButton]}
          onPress={handleSwipeRight}
          disabled={loading}
        >
          <Text style={styles.actionIcon}>♥</Text>
        </TouchableOpacity>
      </View>

      {matchModal && (
        <View style={styles.matchOverlay}>
          <Text style={styles.matchTitle}>It's a Match!</Text>
          <Text style={styles.matchText}>
            You and {feed[currentIndex]?.name} liked each other
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  logo: {
    ...typography.headingMedium,
    color: colors.primary,
  },
  filterButton: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
  },
  cardsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCard: {
    width: SCREEN_WIDTH - spacing.lg * 2,
    height: SCREEN_WIDTH * 1.2,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.large,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: {
    ...typography.headingMedium,
    color: colors.textPrimary,
  },
  emptyText: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
  },
  actionButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  passButton: {
    backgroundColor: colors.surface,
  },
  likeButton: {
    backgroundColor: colors.primary,
  },
  actionIcon: {
    fontSize: 28,
  },
  matchOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  matchTitle: {
    ...typography.headingLarge,
    fontSize: 48,
    color: colors.primary,
  },
  matchText: {
    ...typography.bodyLarge,
    color: '#fff',
    marginTop: spacing.md,
  },
});