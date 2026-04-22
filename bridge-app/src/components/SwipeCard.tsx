import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions, Animated, PanResponder } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../theme';
import { ProfileCard } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SwipeCardProps {
  profile: ProfileCard;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
}

export const SwipeCard: React.FC<SwipeCardProps> = ({
  profile,
  onSwipeLeft,
  onSwipeRight,
}) => {
  const position = new Animated.ValueXY();

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gesture) => {
      position.setValue({ x: gesture.dx, y: gesture.dy });
    },
    onPanResponderRelease: (_, gesture) => {
      if (gesture.dx > 120) {
        Animated.spring(position, {
          toValue: { x: SCREEN_WIDTH + 100, y: gesture.dy },
          useNativeDriver: false,
        }).start(() => {
          onSwipeRight();
          position.setValue({ x: 0, y: 0 });
        });
      } else if (gesture.dx < -120) {
        Animated.spring(position, {
          toValue: { x: -SCREEN_WIDTH - 100, y: gesture.dy },
          useNativeDriver: false,
        }).start(() => {
          onSwipeLeft();
          position.setValue({ x: 0, y: 0 });
        });
      } else {
        Animated.spring(position, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false,
        }).start();
      }
    },
  });

  const rotate = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: ['-10deg', '0deg', '10deg'],
  });

  const likeOpacity = position.x.interpolate({
    inputRange: [0, SCREEN_WIDTH / 4],
    outputRange: [0, 1],
  });

  const nopeOpacity = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 4, 0],
    outputRange: [1, 0],
  });

  return (
    <Animated.View
      style={[
        styles.card,
        {
          transform: [
            { translateX: position.x },
            { translateY: position.y },
            { rotate },
          ],
        },
      ]}
      {...panResponder.panHandlers}
    >
      {profile.photo ? (
        <Image source={{ uri: profile.photo }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.placeholder]}>
          <Text style={styles.placeholderText}>No Photo</Text>
        </View>
      )}
      
      <View style={styles.overlay}>
        <Animated.Text style={[styles.likeLabel, { opacity: likeOpacity }]}>
          LIKE
        </Animated.Text>
        <Animated.Text style={[styles.nopeLabel, { opacity: nopeOpacity }]}>
          NOPE
        </Animated.Text>
      </View>

      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{profile.name}</Text>
          <Text style={styles.age}>{profile.age}</Text>
        </View>
        <Text style={styles.distance}>{profile.distance} km away</Text>
        {profile.bio && <Text style={styles.bio} numberOfLines={2}>{profile.bio}</Text>}
      </View>

      {profile.interests.length > 0 && (
        <View style={styles.interests}>
          {profile.interests.slice(0, 3).map((interest, index) => (
            <View key={index} style={styles.interestTag}>
              <Text style={styles.interestText}>{interest}</Text>
            </View>
          ))}
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    width: SCREEN_WIDTH - spacing.lg * 2,
    height: SCREEN_WIDTH * 1.2,
    backgroundColor: colors.background,
    borderRadius: borderRadius.large,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  image: {
    width: '100%',
    height: '80%',
  },
  placeholder: {
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    ...typography.bodyLarge,
    color: colors.textMuted,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '80%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  likeLabel: {
    position: 'absolute',
    top: 50,
    left: 20,
    fontSize: 48,
    fontWeight: '700',
    color: colors.success,
    borderWidth: 4,
    borderColor: colors.success,
    padding: 10,
    borderRadius: borderRadius.small,
    transform: [{ rotate: '-20deg' }],
  },
  nopeLabel: {
    position: 'absolute',
    top: 50,
    right: 20,
    fontSize: 48,
    fontWeight: '700',
    color: colors.error,
    borderWidth: 4,
    borderColor: colors.error,
    padding: 10,
    borderRadius: borderRadius.small,
    transform: [{ rotate: '20deg' }],
  },
  info: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.md,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    ...typography.headingMedium,
    color: '#fff',
  },
  age: {
    ...typography.headingMedium,
    color: '#fff',
    marginLeft: spacing.sm,
  },
  distance: {
    ...typography.bodyMedium,
    color: 'rgba(255,255,255,0.8)',
    marginTop: spacing.xs,
  },
  bio: {
    ...typography.bodyMedium,
    color: 'rgba(255,255,255,0.9)',
    marginTop: spacing.sm,
  },
  interests: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 100,
    left: spacing.md,
    right: spacing.md,
  },
  interestTag: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    marginRight: spacing.xs,
  },
  interestText: {
    ...typography.caption,
    color: '#fff',
  },
});