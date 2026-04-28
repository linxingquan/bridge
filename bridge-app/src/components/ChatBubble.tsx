import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../theme';
import { Message } from '../types';

interface ChatBubbleProps {
  message: Message;
  isOwn: boolean;
  isRead?: boolean;
  onLongPress?: () => void;
  onNamePress?: () => void;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({
  message,
  isOwn,
  isRead,
  onLongPress,
  onNamePress,
}) => {
  const dateTime = new Date(message.createdAt).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const senderName = (message as any).senderId?.profile?.name || 'User';

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
      <View style={[styles.meta, !isOwn && styles.otherMeta]}>
        {!isOwn && onNamePress ? (
          <TouchableOpacity onPress={onNamePress} style={styles.nameContainer}>
            <Text style={styles.senderName}>{senderName}</Text>
            <Text style={styles.time}> • </Text>
          </TouchableOpacity>
        ) : !isOwn ? (
          <Text style={styles.time}>{senderName} • </Text>
        ) : null}
        <Text style={styles.time}>{dateTime}</Text>
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
    backgroundColor: '#FF6B6B',
    borderBottomRightRadius: spacing.xs,
  },
  otherBubble: {
    backgroundColor: '#65b457',
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
    color: '#fff',
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: spacing.xs,
  },
  otherMeta: {
    justifyContent: 'flex-start',
  },
  time: {
    ...typography.caption,
    color: colors.textMuted,
  },
  senderName: {
    ...typography.caption,
    color: '#65b457',
    fontWeight: '600',
  },
  nameContainer: {
    flexDirection: 'row',
  },
  read: {
    ...typography.caption,
    color: colors.secondary,
    marginLeft: spacing.xs,
  },
});