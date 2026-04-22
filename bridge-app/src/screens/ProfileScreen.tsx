import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  Modal,
  Dimensions,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components';
import { colors, spacing, borderRadius, typography } from '../theme';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const ProfileScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
    } catch (error) {
      Alert.alert('Error', 'Failed to logout');
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = () => {
    navigation.navigate('EditProfile');
  };

  const handleSettings = () => {
    navigation.navigate('Settings');
  };

  if (!user?.profile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loading}>
          <Text>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const { profile } = user;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
          <TouchableOpacity onPress={handleSettings}>
            <Text style={styles.settingsButton}>⚙</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.photosSection}>
          {profile.photos?.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {profile.photos.map((photo, index) => (
                <View key={index} style={styles.photoWrapper}>
                  <TouchableOpacity onPress={() => setSelectedPhotoIndex(index)}>
                    <Image 
                      source={{ uri: photo }} 
                      style={[
                        styles.photo, 
                        profile.profilePhoto === photo && styles.photoSelected
                      ]} 
                    />
                  </TouchableOpacity>
                  {profile.profilePhoto === photo && (
                    <View style={styles.profilePhotoBadge}>
                      <Text style={styles.profilePhotoBadgeText}>Profile</Text>
                    </View>
                  )}
                </View>
              ))}
            </ScrollView>
          ) : (
            <View style={[styles.photo, styles.photoPlaceholder]}>
              <Text style={styles.photoPlaceholderText}>No photos</Text>
            </View>
          )}
          <TouchableOpacity style={styles.editPhotosButton} onPress={handleEditProfile}>
            <Text style={styles.editPhotosText}>Edit Photos</Text>
          </TouchableOpacity>
        </View>

        <Modal visible={selectedPhotoIndex !== null} transparent animationType="fade" onRequestClose={() => setSelectedPhotoIndex(null)}>
          <StatusBar hidden />
          <View style={styles.modalContainer}>
            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setSelectedPhotoIndex(null)}>
              <Text style={styles.modalCloseText}>×</Text>
            </TouchableOpacity>
            {selectedPhotoIndex !== null && profile.photos?.[selectedPhotoIndex] && (
              <Image
                source={{ uri: profile.photos[selectedPhotoIndex] }}
                style={styles.modalImage}
                resizeMode="contain"
              />
            )}
            {profile.photos && profile.photos.length > 1 && (
              <View style={styles.modalNav}>
                <TouchableOpacity
                  style={[styles.modalNavButton, selectedPhotoIndex === 0 && styles.modalNavButtonDisabled]}
                  disabled={selectedPhotoIndex === 0}
                  onPress={() => setSelectedPhotoIndex(selectedPhotoIndex! - 1)}
                >
                  <Text style={styles.modalNavText}>←</Text>
                </TouchableOpacity>
                <Text style={styles.modalCounter}>
                  {(selectedPhotoIndex || 0) + 1} / {profile.photos.length}
                </Text>
                <TouchableOpacity
                  style={[styles.modalNavButton, selectedPhotoIndex === profile.photos.length - 1 && styles.modalNavButtonDisabled]}
                  disabled={selectedPhotoIndex === profile.photos.length - 1}
                  onPress={() => setSelectedPhotoIndex(selectedPhotoIndex! + 1)}
                >
                  <Text style={styles.modalNavText}>→</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </Modal>

        <View style={styles.infoSection}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{profile.name}</Text>
          </View>
          <Text style={styles.age}>{new Date().getFullYear() - new Date(profile.dob).getFullYear()} {' years old'}</Text>
          <Text style={styles.location}>{profile.location?.city}</Text>
        </View>

        <View style={styles.bioSection}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.bio}>{profile.bio || 'No bio yet'}</Text>
        </View>

        {profile.interests?.length > 0 && (
          <View style={styles.interestsSection}>
            <Text style={styles.sectionTitle}>Interests</Text>
            <View style={styles.interests}>
              {profile.interests.map((interest, index) => (
                <View key={index} style={styles.interestTag}>
                  <Text style={styles.interestText}>{interest}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.goalsSection}>
          <Text style={styles.sectionTitle}>Looking for</Text>
          <Text style={styles.goal}>{profile.preferredGender.charAt(0).toUpperCase() + profile.preferredGender.slice(1)}</Text>
          <Text style={styles.goal}>
            {profile.relationshipGoal === 'serious'
              ? 'Serious relationship'
              : profile.relationshipGoal === 'casual'
              ? 'Casual dating'
              // Don't know yet
              : ""}
          </Text>
        </View>

        <View style={styles.actions}>
          <Button
            title="Edit Profile"
            onPress={handleEditProfile}
            variant="secondary"
          />
          <Button title="Log Out" onPress={handleLogout} loading={loading} variant="ghost" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    padding: spacing.md,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.headingMedium,
    color: colors.textPrimary,
  },
  settingsButton: {
    fontSize: 24,
  },
  photosSection: {
    marginBottom: spacing.lg,
  },
  photo: {
    width: 150,
    height: 200,
    borderRadius: borderRadius.medium,
    marginRight: spacing.sm,
  },
  photoWrapper: {
    position: 'relative',
  },
  photoSelected: {
    borderWidth: 4,
    borderColor: colors.primary,
  },
  profilePhotoBadge: {
    position: 'absolute',
    top: spacing.xs,
    left: '50%',
    marginLeft: -30,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  profilePhotoBadgeText: {
    ...typography.bodySmall,
    color: '#fff',
    fontWeight: '600',
    fontSize: 10,
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
  editPhotosButton: {
    position: 'absolute',
    bottom: spacing.sm,
    right: spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  editPhotosText: {
    ...typography.bodySmall,
    color: '#fff',
  },
  infoSection: {
    marginBottom: spacing.lg,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    ...typography.headingLarge,
    color: colors.textPrimary,
  },
  age: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  location: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  bioSection: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  bio: {
    ...typography.bodyLarge,
    color: colors.textPrimary,
  },
  interestsSection: {
    marginBottom: spacing.lg,
  },
  interests: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  interestTag: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  interestText: {
    ...typography.bodySmall,
    color: '#fff',
  },
  goalsSection: {
    marginBottom: spacing.lg,
  },
  goal: {
    ...typography.bodyLarge,
    color: colors.textPrimary,
  },
  actions: {
    marginTop: spacing.xl,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
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
    width: screenWidth,
    height: screenHeight * 0.7,
  },
  modalNav: {
    position: 'absolute',
    bottom: 60,
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