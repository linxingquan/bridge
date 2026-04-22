import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../theme';
import { Message } from '../types';

interface ChatBubbleProps {
  message: Message;
  isOwn: boolean;
  isRead: boolean;
  onLongPress: () => void;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({
  message,
  isOwn,
  isRead,
  onLongPress,
}) => {
  const time = new Date(message.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <TouchableOpacity
      onLongPress={onLongPress}
      style={[styles.container, isOwn ? styles.ownContainer : styles.otherContainer]}
    >
      <View
        style={[
          styles.bubble,
          isOwn ? styles.ownBubble : styles.otherBubble,
        ]}
      >
        {message.photo && (
          <Image source={{ uri: message.photo }} style={styles.image} />
        )}
        {message.text && (
          <Text style={[styles.text, isOwn ? styles.ownText : styles.otherText]}>
            {message.text}
          </Text>
        )}
      </View>
      <View style={styles.meta}>
        <Text style={styles.time}>{time}</Text>
        {isOwn && isRead && <Text style={styles.read}>✓✓</Text>}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.xs,
    maxWidth: '80%',
  },
  ownContainer: {
    alignSelf: 'flex-end',
  },
  otherContainer: {
    alignSelf: 'flex-start',
  },
  bubble: {
    padding: spacing.md,
    borderRadius: borderRadius.large,
  },
  ownBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: spacing.xs,
  },
  otherBubble: {
    backgroundColor: colors.surface,
    borderBottomLeftRadius: spacing.xs,
  },
  image: {
    width: 200,
    height: 150,
    borderRadius: borderRadius.medium,
    marginBottom: spacing.xs,
  },
  text: {
    ...typography.bodyLarge,
  },
  ownText: {
    color: '#fff',
  },
  otherText: {
    color: colors.textPrimary,
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: spacing.xs,
  },
  time: {
    ...typography.caption,
    color: colors.textMuted,
  },
  read: {
    ...typography.caption,
    color: colors.secondary,
    marginLeft: spacing.xs,
  },
});