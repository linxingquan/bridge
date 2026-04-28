import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { ChatBubble } from '../components';
import { colors, spacing, borderRadius, typography } from '../theme';
import { Message, SingleUser } from '../types';

const SOCKET_URL = 'http://localhost:3000';

interface Props {
  route: {
    params: {
      chatId: string;
      user: {
        id: string;
        name: string;
        photo: string;
      };
    };
  };
  navigation: any;
}

export const ChatScreen: React.FC<Props> = ({ route, navigation }) => {
  const { chatId, user } = route.params;
  const { user: currentUser } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const [profileUser, setProfileUser] = useState<SingleUser | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    loadMessages();
    connectSocket();
    loadUserProfile();
    return () => {
      socketRef.current?.disconnect();
    };
  }, [chatId]);

  const loadUserProfile = async () => {
    try {
      const profile = await api.getProfile(user.id);
      const mappedUser: SingleUser = {
        id: profile._id,
        name: profile.profile?.name || user.name,
        age: profile.profile?.dob ? Math.floor((Date.now() - new Date(profile.profile.dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : 0,
        gender: profile.profile?.gender || 'other',
        profilePhoto: profile.profile?.profilePhoto || user.photo || '',
        photos: profile.profile?.photos || [],
        bio: profile.profile?.bio || '',
        interests: profile.profile?.interests || [],
        location: profile.profile?.location?.city || '',
        height: profile.profile?.height || '',
        education: profile.profile?.education || '',
      };
      setProfileUser(mappedUser);
    } catch (error) {
      console.error('Failed to load user profile:', error);
    }
  };

  const handleNamePress = () => {
    if (profileUser) {
      navigation.navigate('ProfileDetail', { user: profileUser });
    }
  };

  const connectSocket = () => {
    socketRef.current = io(SOCKET_URL);
    socketRef.current.emit('join_room', chatId);
    socketRef.current.on('receive_message', (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });
    socketRef.current.on('typing_start', () => setTyping(true));
    socketRef.current.on('typing_stop', () => setTyping(false));
  };

  const loadMessages = async () => {
    setLoading(true);
    try {
      const data = await api.getMessages(chatId);
      setMessages(data);
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!text.trim()) return;
    try {
      const message = await api.sendMessage(chatId, text.trim());
      setMessages((prev) => [...prev, message]);
      socketRef.current?.emit('send_message', { chatId, message });
      setText('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleTyping = () => {
    socketRef.current?.emit('typing_start', { chatId, userId: currentUser?._id });
    setTimeout(() => {
      socketRef.current?.emit('typing_stop', { chatId, userId: currentUser?._id });
    }, 2000);
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const senderId = typeof item.senderId === 'string' ? item.senderId : (item.senderId as any)._id;
    const isFromOther = senderId !== currentUser?._id;
    return (
      <ChatBubble
        message={item}
        isOwn={senderId === currentUser?._id}
        isRead={item.isRead}
        onLongPress={() => {}}
        onNamePress={isFromOther ? handleNamePress : undefined}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerInfo} onPress={handleNamePress}>
          {profileUser?.profilePhoto || user.photo ? (
            <Image source={{ uri: profileUser?.profilePhoto || user.photo }} style={styles.headerAvatar} />
          ) : (
            <View style={[styles.headerAvatar, styles.headerAvatarPlaceholder]}>
              <Text style={styles.headerAvatarText}>{user.name?.charAt(0)}</Text>
            </View>
          )}
          <Text style={styles.headerName}>{user.name}</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.chatArea}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        <FlatList
          ref={flatListRef}
          data={[...messages].reverse()}
          inverted
          keyExtractor={(item) => item._id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messageList}
        />

        {typing && (
          <View style={styles.typingIndicator}>
            <Text style={styles.typingText}>{user.name} is typing...</Text>
          </View>
        )}

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor={colors.textMuted}
            value={text}
            onChangeText={setText}
            onSubmitEditing={sendMessage}
            onFocus={handleTyping}
          />
          <TouchableOpacity
            style={[styles.sendButton, !text.trim() && styles.sendButtonDisabled]}
            onPress={sendMessage}
            disabled={!text.trim()}
          >
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface,
  },
  backButton: {
    fontSize: 24,
    color: colors.primary,
    marginRight: spacing.md,
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: spacing.sm,
  },
  headerAvatarPlaceholder: {
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerAvatarText: {
    fontSize: 16,
    color: '#fff',
  },
  headerName: {
    ...typography.bodyLarge,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  chatArea: {
    flex: 1,
  },
  messageList: {
    padding: spacing.md,
  },
  typingIndicator: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  typingText: {
    ...typography.bodySmall,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.surface,
  },
  input: {
    flex: 1,
    ...typography.bodyLarge,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    maxHeight: 100,
  },
  sendButton: {
    marginLeft: spacing.sm,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  sendButtonDisabled: {
    backgroundColor: colors.textMuted,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
