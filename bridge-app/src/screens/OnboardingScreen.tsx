import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
  Modal,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { Button, Input } from '../components';
import { colors, spacing, typography, borderRadius } from '../theme';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { OnboardingData } from '../types';

const INTERESTS = [
  'Hiking', 'Travel', 'Photography', 'Music', 'Cooking', 'Fitness',
  'Reading', 'Movies', 'Gaming', 'Art', 'Dancing', 'Yoga',
  'Foodie', 'Coffee', 'Wine', 'Pets', 'Nature', 'Outdoors',
];

const STEPS = ['Basic Info', 'Location', 'Photos', 'Interests', 'Bio'];

export const OnboardingScreen: React.FC = () => {
  const { updateUser, logout } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dobDate, setDobDate] = useState<Date>(new Date());
  const [data, setData] = useState<OnboardingData>({
    name: '',
    dob: '',
    gender: 'man',
    preferredGender: 'everyone',
    city: '',
    photos: [],
    interests: [],
    bio: '',
    prompts: [],
    relationshipGoal: 'dont_know',
  });

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android' && (event.type === 'dismissed' || !selectedDate)) {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setDobDate(selectedDate);
      setData({ ...data, dob: selectedDate.toISOString().split('T')[0] });
    }
  };

  const handleNext = async () => {
    if (currentStep === 0) {
      if (!data.name || !data.dob || !data.gender) {
        Alert.alert('Error', 'Please fill in all fields');
        return;
      }
      if (calculateAge(data.dob) < 18) {
        Alert.alert('Error', 'You must be 18 or older');
        return;
      }
    }
    if (currentStep === 1) {
      if (!data.city) {
        Alert.alert('Error', 'Please enter your city');
        return;
      }
    }
    if (currentStep === 2) {
      if (data.photos.length === 0) {
        Alert.alert('Error', 'Please add at least one photo');
        return;
      }
    }
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      await handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Upload any local photos and get their URLs
      const uploadedPhotos = [...data.photos];
      for (let i = 0; i < data.photos.length; i++) {
        if (!data.photos[i].startsWith('http')) {
          try {
            const uploaded = await api.uploadPhoto(data.photos[i]);
            uploadedPhotos[i] = uploaded.url;
          } catch (e) {
            console.log('Upload failed for photo', i, e);
          }
        }
      }

      // Set the first photo as the profile photo
      const profilePhoto = uploadedPhotos.length > 0 ? uploadedPhotos[0] : '';
      await updateUser({
        profile: {
          name: data.name,
          dob: data.dob,
          gender: data.gender,
          preferredGender: data.preferredGender,
          location: { city: data.city, coordinates: [0, 0] },
          photos: uploadedPhotos,
          profilePhoto: profilePhoto,
          bio: data.bio,
          interests: data.interests,
          prompts: data.prompts,
          relationshipGoal: data.relationshipGoal,
        },
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to complete profile');
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    console.log('[Onboarding] pickImage called');
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      console.log('[Onboarding] Permission status:', status);
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please allow access to your photo library');
        return;
      }
      console.log('[Onboarding] Launching picker...');
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.8,
      });
      console.log('[Onboarding] Picker result:', result);
      if (!result.canceled && result.assets && result.assets[0]) {
        const newPhotos = [...data.photos, result.assets[0].uri];
        console.log('[Onboarding] Adding photo, newPhotos:', newPhotos);
        setData({ ...data, photos: newPhotos });
      }
    } catch (error) {
      console.log('[Onboarding] Image picker error:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const requestLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return;
    }
    const location = await Location.getCurrentPositionAsync({});
    const [address] = await Location.reverseGeocodeAsync({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });
    if (address?.city) {
      setData({ ...data, city: address.city });
    }
  };

  const toggleInterest = (interest: string) => {
    if (data.interests.includes(interest)) {
      setData({
        ...data,
        interests: data.interests.filter((i) => i !== interest),
      });
    } else if (data.interests.length < 10) {
      setData({ ...data, interests: [...data.interests, interest] });
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <View>
            <Text style={styles.stepTitle}>{STEPS[0]}</Text>
            <Input
              label="Name"
              placeholder="What should we call you?"
              value={data.name}
              onChangeText={(name) => setData({ ...data, name })}
            />
            <View style={styles.dateInputContainer}>
              <Input
                label="Date of Birth"
                placeholder="YYYY-MM-DD"
                value={data.dob}
                onChangeText={() => {}}
                editable={false}
              />
              <TouchableOpacity 
                style={styles.dateInputOverlay}
                onPress={() => setShowDatePicker(true)}
                activeOpacity={1}
              />
            </View>
            {showDatePicker && (
              <View>
                <DateTimePicker
                  value={dobDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleDateChange}
                  maximumDate={new Date()}
                  minimumDate={new Date(1900, 0, 1)}
                />
                {Platform.OS === 'ios' && (
                  <TouchableOpacity 
                    style={styles.datePickerDone}
                    onPress={() => setShowDatePicker(false)}
                  >
                    <Text style={styles.datePickerDoneText}>Done</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
            <Text style={styles.fieldLabel}>I am a...</Text>
            <View style={styles.options}>
              {['man', 'woman', 'other'].map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.optionButton,
                    data.gender === option && styles.optionSelected,
                  ]}
                  onPress={() => setData({ ...data, gender: option as 'man' | 'woman' | 'other' })}
                >
                  <Text
                    style={[
                      styles.optionText,
                      data.gender === option && styles.optionTextSelected,
                    ]}
                  >
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.fieldLabel}>I want to meet...</Text>
            <View style={styles.options}>
              {['man', 'woman', 'everyone'].map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.optionButton,
                    data.preferredGender === option && styles.optionSelected,
                  ]}
                  onPress={() =>
                    setData({ ...data, preferredGender: option as 'man' | 'woman' | 'everyone' })
                  }
                >
                  <Text
                    style={[
                      styles.optionText,
                      data.preferredGender === option && styles.optionTextSelected,
                    ]}
                  >
                    {option === 'everyone' ? 'Everyone' : option.charAt(0).toUpperCase() + option.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );
      case 1:
        return (
          <View>
            <Text style={styles.stepTitle}>{STEPS[1]}</Text>
            <Text style={styles.stepDescription}>
              Let others know where you are
            </Text>
            <Button
              title="Use Current Location"
              onPress={requestLocation}
              variant="secondary"
            />
            <Input
              label="City"
              placeholder="Enter your city manually"
              value={data.city}
              onChangeText={(city) => setData({ ...data, city })}
            />
          </View>
        );
      case 2:
        return (
          <View>
            <Text style={styles.stepTitle}>{STEPS[2]}</Text>
            <Text style={styles.stepDescription}>
              Add your best photos (at least 1 required)
            </Text>
            <View style={styles.photosGrid}>
              {data.photos.map((photo, index) => (
                <Image key={index} source={{ uri: photo }} style={styles.photo} />
              ))}
              {data.photos.length < 6 && (
                <TouchableOpacity style={styles.addPhoto} onPress={pickImage}>
                  <Text style={styles.addPhotoText}>+</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        );
      case 3:
        return (
          <View>
            <Text style={styles.stepTitle}>{STEPS[3]}</Text>
            <Text style={styles.stepDescription}>
              Select up to 10 interests
            </Text>
            <View style={styles.interestsGrid}>
              {INTERESTS.map((interest) => (
                <TouchableOpacity
                  key={interest}
                  style={[
                    styles.interestButton,
                    data.interests.includes(interest) && styles.interestSelected,
                  ]}
                  onPress={() => toggleInterest(interest)}
                >
                  <Text
                    style={[
                      styles.interestText,
                      data.interests.includes(interest) && styles.interestTextSelected,
                    ]}
                  >
                    {interest}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );
      case 4:
        return (
          <View>
            <Text style={styles.stepTitle}>{STEPS[4]}</Text>
            <Input
              label="Bio"
              placeholder="Tell others about yourself"
              value={data.bio}
              onChangeText={(bio) => setData({ ...data, bio })}
              multiline
              numberOfLines={4}
            />
            <Text style={styles.fieldLabel}>Looking for...</Text>
            <View style={styles.options}>
              {['serious', 'casual', 'dont_know'].map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.optionButton,
                    data.relationshipGoal === option && styles.optionSelected,
                  ]}
                  onPress={() =>
                    setData({
                      ...data,
                      relationshipGoal: option as 'serious' | 'casual' | 'dont_know',
                    })
                  }
                >
                  <Text
                    style={[
                      styles.optionText,
                      data.relationshipGoal === option && styles.optionTextSelected,
                    ]}
                  >
                    {option === 'dont_know' ? "Don't know yet" : option.charAt(0).toUpperCase() + option.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.progress}>
          {STEPS.map((_, index) => (
            <View
              key={index}
              style={[
                styles.progressDot,
                index <= currentStep && styles.progressDotActive,
              ]}
            />
          ))}
        </View>
        {renderStep()}
        <View style={styles.navigation}>
          {currentStep > 0 && (
            <Button
              title="Back"
              onPress={() => setCurrentStep(currentStep - 1)}
              variant="ghost"
            />
          )}
          <Button
            title={currentStep === STEPS.length - 1 ? 'Complete' : 'Next'}
            onPress={handleNext}
            loading={loading}
          />
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
    padding: spacing.lg,
  },
  progress: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.surface,
    marginHorizontal: spacing.xs,
  },
  progressDotActive: {
    backgroundColor: colors.primary,
  },
  stepTitle: {
    ...typography.headingMedium,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  stepDescription: {
    ...typography.bodyLarge,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  fieldLabel: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  optionButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 2,
    borderColor: colors.surface,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  optionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  optionText: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
  },
  optionTextSelected: {
    color: '#fff',
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  photo: {
    width: 100,
    height: 130,
    borderRadius: borderRadius.medium,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  addPhoto: {
    width: 100,
    height: 130,
    borderRadius: borderRadius.medium,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.primary,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addPhotoText: {
    fontSize: 32,
    color: colors.textMuted,
  },
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  interestButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  interestSelected: {
    backgroundColor: colors.primary,
  },
  interestText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  interestTextSelected: {
    color: '#fff',
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xl,
  },
  datePickerDone: {
    alignSelf: 'flex-end',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  datePickerDoneText: {
    ...typography.bodyMedium,
    color: colors.primary,
    fontWeight: '600',
  },
  dateInputOverlay: {
    ...StyleSheet.absoluteFillObject,
    height: 50,
  },
  dateInputContainer: {
    position: 'relative',
  },
});