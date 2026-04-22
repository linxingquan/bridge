import {
  Modal,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { borderRadius, colors, spacing, typography } from '../theme';
import { SingleUser } from '../types';

interface Props {
  user: SingleUser | null;
  visible: boolean;
  onClose: () => void;
}
export const ProfileDetailModal: React.FC<Props> = ({ user, visible, onClose }) => {
  if (!user) return null;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.infoContainer}>
            <Text style={styles.name}>{user.name}, {user.age}, {user.gender}</Text>
            {user.location && <Text style={styles.detail}>{user.location}</Text>}
            {user.height && <Text style={styles.detail}>Height: {user.height}</Text>}
            {user.education && <Text style={styles.detail}>Education: {user.education}</Text>}
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.bio}>{user.bio}</Text>
            <Text style={styles.sectionTitle}>Interests</Text>
            <View style={styles.interestsContainer}>
              {user.interests.map((interest, index) => (
                <View key={index} style={styles.interestTag}>
                  <Text style={styles.interestText}>{interest}</Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  closeButton: {
    padding: spacing.md,
    alignSelf: 'flex-start',
    zIndex: 10,
    elevation: 10,
  },
  closeButtonText: {
    ...typography.bodyLarge,
    color: colors.primary,
  },
  infoContainer: {
    padding: spacing.lg,
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
});
