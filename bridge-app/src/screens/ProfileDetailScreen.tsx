import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  Dimensions,
  Modal,
  StatusBar,
  PanResponder,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { api } from '../services/api';
import { borderRadius, colors, spacing, typography } from '../theme';
import { SingleUser } from '../types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const PHOTO_SIZE = (SCREEN_WIDTH - spacing.lg * 2 - spacing.sm * 2) / 3;

interface Props {
  route: {
    params: {
      user: SingleUser;
    };
  };
}

export const ProfileDetailScreen: React.FC<Props> = ({ route }) => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const user = route.params.user;
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);

  const allPhotos = [
    user.profilePhoto,
    ...(user.photos || []).filter(p => p !== user.profilePhoto)
  ].filter(Boolean);

  const handlePrevPhoto = () => {
    if (selectedPhotoIndex === null) return;
    const newIndex = selectedPhotoIndex === 0 ? allPhotos.length - 1 : selectedPhotoIndex - 1;
    setSelectedPhotoIndex(newIndex);
  };

  const handleNextPhoto = () => {
    if (selectedPhotoIndex === null) return;
    const newIndex = selectedPhotoIndex === allPhotos.length - 1 ? 0 : selectedPhotoIndex + 1;
    setSelectedPhotoIndex(newIndex);
  };

  const SWIPE_THRESHOLD = 50;

  const photoPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 10;
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -SWIPE_THRESHOLD) {
          handleNextPhoto();
        } else if (gestureState.dx > SWIPE_THRESHOLD) {
          handlePrevPhoto();
        }
      },
    })
  ).current;

  const handleMessagePress = async () => {
    try {
      const { chatId } = await api.startChat(user.id);
      navigation.navigate('Chat', { chatId, user });
    } catch (error) {
      console.error('Failed to start chat:', error);
      Alert.alert('Error', 'Failed to start chat');
    }
  };

  const handleCloseModal = () => {
    setSelectedPhotoIndex(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.infoContainer}>
          {allPhotos.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {allPhotos.map((photo, index) => (
                <View key={index} style={styles.photoWrapper}>
                  <TouchableOpacity onPress={() => setSelectedPhotoIndex(index)}>
                    <Image 
                      source={{ uri: photo }} 
                      style={styles.photo} 
                    />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          ) : (
            <View style={[styles.photo, styles.photoPlaceholder]}>
              <Text style={styles.photoPlaceholderText}>No photos</Text>
            </View>
          )}
          <Text style={styles.name}>{user.name}, {user.age}, {user.gender}</Text>
          {user.location && <Text style={styles.detail}>{user.location}</Text>}
          {user.height && <Text style={styles.detail}>Height: {user.height}</Text>}
          {user.education && <Text style={styles.detail}>Education: {user.education}</Text>}
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.bio}>{user.bio || 'No bio available'}</Text>
          <Text style={styles.sectionTitle}>Interests</Text>
          <View style={styles.interestsContainer}>
            {(user.interests || []).map((interest, index) => (
              <View key={index} style={styles.interestTag}>
                <Text style={styles.interestText}>{interest}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity 
            style={styles.messageButton} 
            onPress={handleMessagePress}
          >
            <Text style={styles.messageButtonText}>Message</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal visible={selectedPhotoIndex !== null} transparent animationType="fade" onRequestClose={() => setSelectedPhotoIndex(null)}>
        <StatusBar hidden />
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.modalCloseButton} onPress={() => setSelectedPhotoIndex(null)}>
            <Text style={styles.modalCloseText}>×</Text>
          </TouchableOpacity>
          <View 
            style={styles.modalPhotoWrapper}
            {...photoPanResponder.panHandlers}
          >
            {selectedPhotoIndex !== null && allPhotos[selectedPhotoIndex] && (
              <Image
                source={{ uri: allPhotos[selectedPhotoIndex] }}
                style={styles.modalImage}
                resizeMode="contain"
              />
            )}
          </View>
          {allPhotos.length > 1 && (
            <View style={styles.modalNav}>
              <TouchableOpacity
                style={styles.modalNavButton}
                onPress={handlePrevPhoto}
              >
                <Text style={styles.modalNavText}>←</Text>
              </TouchableOpacity>
              <Text style={styles.modalCounter}>
                {(selectedPhotoIndex || 0) + 1} / {allPhotos.length}
              </Text>
              <TouchableOpacity
                style={styles.modalNavButton}
                onPress={handleNextPhoto}
              >
                <Text style={styles.modalNavText}>→</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>
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
    paddingVertical: spacing.sm,
  },
  backButton: {
    padding: spacing.sm,
  },
  backButtonText: {
    fontSize: 28,
    color: colors.primary,
  },
  infoContainer: {
    padding: spacing.lg,
  },
  photoWrapper: {
    position: 'relative',
    marginRight: spacing.sm,
  },
  photo: {
    width: 150,
    height: 200,
    borderRadius: borderRadius.medium,
  },
  photoPlaceholder: {
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoPlaceholderText: {
    ...typography.bodyMedium,
    color: colors.textMuted,
  },
  name: {
    ...typography.headingLarge,
    color: colors.textPrimary,
  },
  detail: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  sectionTitle: {
    ...typography.headingSmall,
    color: colors.textPrimary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  bio: {
    ...typography.bodyLarge,
    color: colors.textPrimary,
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
  messageButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.large,
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  messageButtonText: {
    ...typography.bodyLarge,
    color: '#fff',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseButton: {
    position: 'absolute',
    bottom: 160,
    alignSelf: 'center',
    left: '50%',
    marginLeft: -25,
    zIndex: 10,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseText: {
    fontSize: 28,
    color: '#fff',
    fontWeight: '300',
  },
  modalImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.7,
  },
  modalPhotoWrapper: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.7,
  },
  modalNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalNavButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: spacing.md,
  },
  modalNavButtonDisabled: {
    opacity: 0.3,
  },
  modalNavText: {
    fontSize: 24,
    color: '#fff',
  },
  modalCounter: {
    ...typography.bodyMedium,
    color: '#fff',
    minWidth: 60,
    textAlign: 'center',
  },
});