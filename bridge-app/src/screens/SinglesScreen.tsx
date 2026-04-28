import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  Alert,
  TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '../services/api';
import { colors, spacing, borderRadius, typography } from '../theme';
import { SingleUser } from '../types';
import { ChatModal } from '../components/ChatModal';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - spacing.lg * 2;
const CARD_HEIGHT = CARD_WIDTH * 1.3;

export const SinglesScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [singles, setSingles] = useState<SingleUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState<Record<string, number>>({});
  const [selectedUser, setSelectedUser] = useState<SingleUser | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [chatModalVisible, setChatModalVisible] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);

  const handleProfilePress = (user: SingleUser) => {
    setSelectedUser(user);
    navigation.navigate('ProfileDetail', { user });
  };

  const handleMessagePress = async (user: SingleUser) => {
    try {
      const { chatId } = await api.startChat(user.id);
      setCurrentChatId(chatId);
      setChatModalVisible(true);
    } catch (error) {
      console.error('Failed to start chat:', error);
      Alert.alert('Error', 'Failed to start chat');
    }
  };

  const loadSingles = useCallback(async (pageNum: number = 1, refresh: boolean = false) => {
    if (loading) return;
    
    if (!refresh && pageNum > 1 && !hasMore) return;

    console.info(`Loading singles - Page: ${pageNum}, Refresh: ${refresh}`);
    setLoading(true);
    try {
      const result = await api.getSingles(pageNum, 2);
      
      if (refresh || pageNum === 1) {
        setSingles(result.singles);
      } else {
        setSingles(prev => [...prev, ...result.singles]);
      }
      
      setHasMore(result.page < result.totalPages);
      setPage(pageNum);
    } catch (error) {
      console.error('Failed to load singles:', error);
      Alert.alert('Error', 'Failed to load people');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [loading, hasMore]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(1);
    loadSingles(1, true);
  }, [loadSingles]);

  const handleLoadMore = useCallback(() => {
    if (!loading && hasMore) {
      loadSingles(page + 1);
    }
  }, [loading, hasMore, page, loadSingles]);

  const handleScroll = useCallback((event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const isAtBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 100;
    
    if (isAtBottom && !loading && hasMore) {
      handleLoadMore();
    }
  }, [loading, hasMore, handleLoadMore]);

  const handleSwipePhoto = (userId: string, direction: 'left' | 'right') => {
    const single = singles.find(s => s.id === userId);
    const photos = single?.photos || [];
    if (!single || photos.length <= 1) return;

    const currentIndex = currentPhotoIndex[userId] || 0;
    let newIndex = direction === 'right' ? currentIndex + 1 : currentIndex - 1;

    if (newIndex < 0) newIndex = photos.length - 1;
    if (newIndex >= photos.length) newIndex = 0;

    setCurrentPhotoIndex(prev => ({ ...prev, [userId]: newIndex }));
  };

  React.useEffect(() => {
    loadSingles(1);
  }, []);

  const renderSingleCard = ({ item }: { item: SingleUser }) => {
    const photos = item.photos || [];
    const allPhotos = item.profilePhoto ? [item.profilePhoto, ...photos.filter(p => p !== item.profilePhoto)] : photos;
    const currentIndex = currentPhotoIndex[item.id] || 0;
    const currentPhoto = allPhotos[currentIndex] || item.profilePhoto;

    return (
      <View style={styles.card}>
        <View style={styles.photoContainer}>
          <TouchableOpacity
            style={styles.photoSwipeLeftArea}
            onPress={() => allPhotos.length > 1 && handleSwipePhoto(item.id, 'left')}
            activeOpacity={0.7}
          />
          <Image source={{ uri: currentPhoto }} style={styles.cardImage} />
          <TouchableOpacity
            style={styles.photoSwipeRightArea}
            onPress={() => allPhotos.length > 1 && handleSwipePhoto(item.id, 'right')}
            activeOpacity={0.7}
          />
          {allPhotos.length > 1 && (
            <View style={styles.photoCounter}>
              <Text style={styles.photoCounterText}>
                {currentIndex + 1}/{allPhotos.length}
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.cardInfo}>
          <TouchableWithoutFeedback onPress={() => handleProfilePress(item)}>
            <Text style={styles.cardName}>{item.name}, {item.age}, {item.gender}</Text>
          </TouchableWithoutFeedback>
          {item.location && <Text style={styles.cardLocation}>{item.location}</Text>}
          
          {item.bio && (
            <Text style={styles.cardBio} numberOfLines={3}>
              {item.bio}
            </Text>
          )}
          
          {(item.interests?.length || 0) > 0 && (
            <View style={styles.interestsContainer}>
              {(item.interests || []).slice(0, 3).map((interest, idx) => (
                <View key={idx} style={styles.interestTag}>
                  <Text style={styles.interestText}>{interest}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Singles</Text>
      </View>

      <FlatList
        data={singles}
        renderItem={renderSingleCard}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
        ListFooterComponent={renderFooter}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>No singles yet</Text>
              <Text style={styles.emptyText}>
                Check back later for new people
              </Text>
            </View>
          ) : null
        }
        contentContainerStyle={!loading || singles.length === 0 ? styles.emptyListContent : styles.listContent}
      />

      {loading && singles.length === 0 && !refreshing && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}

      <ChatModal
        chatId={currentChatId}
        user={selectedUser}
        visible={chatModalVisible}
        onClose={() => setChatModalVisible(false)}
      />
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface,
  },
  title: {
    ...typography.headingMedium,
    color: colors.textPrimary,
  },
  listContent: {
    paddingVertical: spacing.md,
  },
  emptyListContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  emptyTitle: {
    ...typography.headingMedium,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  emptyText: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  card: {
    width: CARD_WIDTH,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: borderRadius.large,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  cardImage: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },
  cardInfo: {
    padding: spacing.md,
  },
  cardName: {
    ...typography.headingMedium,
    color: colors.textPrimary,
  },
  cardLocation: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  cardBio: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    marginTop: spacing.sm,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.sm,
  },
  interestTag: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
  interestText: {
    ...typography.bodySmall,
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  photoContainer: {
    position: 'relative',
  },
  photoSwipeLeftArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '50%',
    height: CARD_HEIGHT,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    paddingTop: spacing.sm,
    paddingLeft: spacing.sm,
    zIndex: 10,
  },
  photoSwipeRightArea: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '50%',
    height: CARD_HEIGHT,
    zIndex: 10,
  },
  photoCounter: {
    position: 'absolute',
    bottom: spacing.sm,
    right: spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  photoCounterText: {
    ...typography.bodySmall,
    color: '#fff',
  },
});