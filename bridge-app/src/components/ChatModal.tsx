import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { io, Socket } from 'socket.io-client';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ChatBubble } from './ChatBubble';
import { colors, spacing, borderRadius, typography } from '../theme';
import { Message, SingleUser } from '../types';

const SOCKET_URL = 'http://localhost:3000';

interface Props {
  chatId: string | null;
  user: SingleUser | null;
  visible: boolean;
  onClose: () => void;
}

export const ChatModal: React.FC<Props> = ({ chatId, user, visible, onClose }) => {
  const { user: currentUser } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (visible && chatId) {
      loadMessages();
      connectSocket();
    }
    return () => {
      socketRef.current?.disconnect();
    };
  }, [visible, chatId]);

  const connectSocket = () => {
    if (!chatId) return;
    socketRef.current = io(SOCKET_URL);
    socketRef.current.emit('join_room', chatId);
    socketRef.current.on('receive_message', (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });
  };

  const loadMessages = async () => {
    if (!chatId) return;
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
    if (!chatId || !text.trim()) return;
    try {
      const message = await api.sendMessage(chatId, text.trim());
      setMessages((prev) => [...prev, message]);
      socketRef.current?.emit('send_message', { chatId, message });
      setText('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  if (!user) return null;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeButton}>Close</Text>
          </TouchableOpacity>
          <Text style={styles.headerName}>{user.name}</Text>
          <View style={{ width: 40 }} />
        </View>

        <KeyboardAvoidingView
          style={styles.chatArea}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={60}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              data={[...messages].reverse()}
              inverted
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => {
                const senderId = typeof item.senderId === 'string' ? item.senderId : (item.senderId as any)._id;
                return (
                  <ChatBubble
                    message={item}
                    isOwn={senderId === currentUser?._id}
                  />
                );
              }}
              contentContainerStyle={styles.messageList}
            />
          )}

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Type a message..."
              value={text}
              onChangeText={setText}
              onSubmitEditing={sendMessage}
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
    </Modal>
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
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface,
  },
  closeButton: {
    ...typography.bodyLarge,
    color: colors.primary,
  },
  headerName: {
    ...typography.headingSmall,
    color: colors.textPrimary,
  },
  chatArea: {
    flex: 1,
  },
  messageList: {
    padding: spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.surface,
    backgroundColor: colors.background,
  },
  input: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...typography.bodyLarge,
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
