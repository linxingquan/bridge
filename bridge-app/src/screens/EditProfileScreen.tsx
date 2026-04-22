import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  Platform,
  Modal,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { launchImageLibraryAsync, requestMediaLibraryPermissionsAsync } from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Input } from '../components';
import { colors, spacing, borderRadius, typography } from '../theme';

export const EditProfileScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [name, setName] = useState(user?.profile?.name || '');
  const [bio, setBio] = useState(user?.profile?.bio || '');
  const [dob, setDob] = useState(user?.profile?.dob || '');
  const [gender, setGender] = useState(user?.profile?.gender || 'man');
  const [preferredGender, setPreferredGender] = useState(user?.profile?.preferredGender || 'everyone');
  const [city, setCity] = useState(user?.profile?.location?.city || '');
  const [height, setHeight] = useState(user?.profile?.height || '');
  const [education, setEducation] = useState(user?.profile?.education || '');
  const [relationshipGoal, setRelationshipGoal] = useState(user?.profile?.relationshipGoal || 'dont_know');
  const [interests, setInterests] = useState(user?.profile?.interests?.join(', ') || '');

  const [dobDate, setDobDate] = useState<Date>(
    user?.profile?.dob ? new Date(user.profile.dob) : new Date()
  );

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setDobDate(selectedDate);
      setDob(selectedDate.toISOString().split('T')[0]);
    }
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };
  const [photos, setPhotos] = useState<string[]>(user?.profile?.photos || []);
  const [photosMarkedForDeletion, setPhotosMarkedForDeletion] = useState<string[]>([]);
  const [profilePhoto, setProfilePhoto] = useState<string>(
    user?.profile?.profilePhoto || user?.profile?.photos?.[0] || ''
  );

  useEffect(() => {
    const requestPermissions = async () => {
      const { status } = await requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        console.log('Photo library permission not granted');
      }
    };
    requestPermissions();
  }, []);

  const pickImage = async () => {
    try {
      const { status } = await requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please allow access to your photo library');
        return;
      }
      const result = await launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.8,
      });
      console.log('Picker result:', result);
      if (!result.canceled && result.assets && result.assets[0]) {
        setPhotos([...photos, result.assets[0].uri]);
      }
    } catch (error) {
      console.log('Image picker error:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const removePhoto = (index: number) => {
    const photoToRemove = photos[index];
    
    // If photo was already uploaded (has full URL), mark for deletion on save
    if (photoToRemove && photoToRemove.startsWith('http')) {
      setPhotosMarkedForDeletion([...photosMarkedForDeletion, photoToRemove]);
    }
    
    const remainingPhotos = photos.filter((_, i) => i !== index);
    setPhotos(remainingPhotos);
    
    // Don't update profilePhoto here - will be computed on Save
  };

  const handleSave = async () => {
    if (photos.length === 0) {
      Alert.alert('Error', 'At least one photo is required');
      return;
    }
    
    setLoading(true);
    try {
      const profilePhotos = [...photos];
      
      // Upload new photos (local file URIs)
      let profilePhotoToUse = profilePhoto;
      for (let i = 0; i < photos.length; i++) {
        if (!photos[i].startsWith('http')) {
          try {
            const uploaded = await api.uploadPhoto(photos[i]);
            profilePhotos[i] = uploaded.url;
            if (profilePhoto === photos[i]) {
              profilePhotoToUse = uploaded.url;
            }
          } catch (e) {
            console.log('Upload failed for photo', i, e);
          }
        }
      }
      
      // Delete photos that were marked for deletion
      for (const removedUrl of photosMarkedForDeletion) {
        try {
          await api.deletePhoto(removedUrl);
        } catch (e) {
          console.log('Failed to delete removed photo:', e);
        }
      }
      setPhotosMarkedForDeletion([]);
      
      // Compute final profile photo: use the uploaded URL if local, or first photo if selected was deleted
      let finalProfilePhoto = profilePhotoToUse;
      if (!finalProfilePhoto || photosMarkedForDeletion.includes(profilePhoto)) {
        finalProfilePhoto = profilePhotos.length > 0 ? profilePhotos[0] : '';
      }

      await updateUser({
        profile: {
          name,
          bio,
          dob,
          gender,
          preferredGender,
          location: { city, coordinates: user?.profile?.location?.coordinates || [0, 0] },
          height,
          education,
          relationshipGoal,
          interests: interests.split(',').map(i => i.trim()).filter(Boolean),
          photos: profilePhotos,
          profilePhoto: finalProfilePhoto,
          prompts: user?.profile?.prompts || [],
        },
      });
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  const OptionButton = ({ label, value, current, onPress }: { label: string; value: string; current: string; onPress: () => void }) => (
    <TouchableOpacity
      style={[styles.option, current === value && styles.optionSelected]}
      onPress={onPress}
    >
      <Text style={[styles.optionText, current === value && styles.optionTextSelected]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.cancelButton}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Edit Profile</Text>
        <TouchableOpacity onPress={handleSave} disabled={loading}>
          <Text style={styles.saveButton}>{loading ? 'Saving...' : 'Save'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.sectionLabel}>Photos</Text>
        <View style={styles.photosContainer}>
          {photos.map((photo, index) => (
            <View key={index} style={styles.photoWrapper}>
              <Image source={{ uri: photo }} style={[styles.photo, profilePhoto === photo && styles.photoSelected]} />
              <TouchableOpacity style={styles.removePhoto} onPress={() => removePhoto(index)}>
                <Text style={styles.removePhotoText}>×</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.selectProfilePhoto, profilePhoto === photo && styles.selectProfilePhotoSelected]}
                onPress={async () => {
                  if (profilePhoto === photo) {
                    setProfilePhoto('');
                  } else {
                    setProfilePhoto(photo);
                  }
                }}
              >
                <Text style={styles.selectProfilePhotoText}>
                  {profilePhoto === photo ? '✓' : '◯'}
                </Text>
              </TouchableOpacity>
              {profilePhoto === photo && (
                <View style={styles.profilePhotoBadge}>
                  <Text style={styles.profilePhotoBadgeText}>Profile</Text>
                </View>
              )}
            </View>
          ))}
          {photos.length < 6 && (
            <TouchableOpacity 
              style={styles.addPhoto} 
              onPress={pickImage}
            >
              <Text style={styles.addPhotoText}>+</Text>
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.sectionHint}>Tap the circle to select profile photo</Text>

        <Input label="Name" value={name} onChangeText={setName} />
        <Input label="Bio" value={bio} onChangeText={setBio} multiline numberOfLines={4} />
        <TouchableOpacity onPress={() => setShowDatePicker(true)}>
          <Input 
            label="Date of Birth" 
            value={dob} 
            onChangeText={setDob} 
            placeholder="YYYY-MM-DD"
            editable={false}
          />
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={dobDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
            maximumDate={new Date()}
            minimumDate={new Date(1900, 0, 1)}
          />
        )}
        <Input label="City" value={city} onChangeText={setCity} />
        <Input label="Height" value={height} onChangeText={setHeight} placeholder="e.g., 5'10" />
        <Input label="Education" value={education} onChangeText={setEducation} />
        <Input label="Interests" value={interests} onChangeText={setInterests} placeholder="Comma separated" />

        <Text style={styles.sectionLabel}>Gender</Text>
        <View style={styles.optionsRow}>
          <OptionButton label="Man" value="man" current={gender} onPress={() => setGender('man')} />
          <OptionButton label="Woman" value="woman" current={gender} onPress={() => setGender('woman')} />
          <OptionButton label="Other" value="other" current={gender} onPress={() => setGender('other')} />
        </View>

        <Text style={styles.sectionLabel}>Interested In</Text>
        <View style={styles.optionsRow}>
          <OptionButton label="Men" value="man" current={preferredGender} onPress={() => setPreferredGender('man')} />
          <OptionButton label="Women" value="woman" current={preferredGender} onPress={() => setPreferredGender('woman')} />
          <OptionButton label="Everyone" value="everyone" current={preferredGender} onPress={() => setPreferredGender('everyone')} />
        </View>

        <Text style={styles.sectionLabel}>Relationship Goal</Text>
        <View style={styles.optionsRow}>
          <OptionButton label="Casual" value="casual" current={relationshipGoal} onPress={() => setRelationshipGoal('casual')} />
          <OptionButton label="Serious" value="serious" current={relationshipGoal} onPress={() => setRelationshipGoal('serious')} />
          <OptionButton label="Don't Know" value="dont_know" current={relationshipGoal} onPress={() => setRelationshipGoal('dont_know')} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface,
  },
  title: { ...typography.headingSmall, color: colors.textPrimary },
  cancelButton: { ...typography.bodyMedium, color: colors.textSecondary },
  saveButton: { ...typography.bodyMedium, color: colors.primary, fontWeight: '600' },
  scroll: { padding: spacing.md },
  sectionLabel: { ...typography.bodyMedium, color: colors.textSecondary, marginTop: spacing.md, marginBottom: spacing.sm },
  sectionHint: { ...typography.bodySmall, color: colors.textMuted, marginBottom: spacing.md },
  optionsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  option: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.surface,
    alignItems: 'center',
  },
  optionSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  optionText: { ...typography.bodyMedium, color: colors.textPrimary },
  optionTextSelected: { color: '#fff' },
  photosContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  photoWrapper: { position: 'relative' },
  photo: { width: 100, height: 133, borderRadius: borderRadius.md },
  photoSelected: { borderWidth: 4, borderColor: colors.primary },
  removePhoto: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removePhotoText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  selectProfilePhoto: {
    position: 'absolute',
    bottom: -8,
    left: -8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectProfilePhotoSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  selectProfilePhotoText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
  },
  profilePhotoBadge: {
    position: 'absolute',
    top: -12,
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
  addPhoto: {
    width: 100,
    height: 133,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  addPhotoText: { fontSize: 32, color: colors.textSecondary },
});