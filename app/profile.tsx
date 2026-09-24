import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Typography, Spacing, BorderRadius, Shadows } from '../src/constants/theme';
import { useTheme } from '../src/context/ThemeContext';
import { useAuth } from '../src/context/AuthContext';
import { getEffectiveSocials, updateOwnProfile } from '../src/lib/profilesApi';
import { uploadAvatar, AvatarUploadError } from '../src/lib/avatarUpload';
import { changeOwnPassword, PasswordChangeError } from '../src/lib/accountSecurity';
import { changeOwnUsername } from '../src/lib/adminAccountsApi';
import { studentsData } from '../src/data/students';
import { teachersData } from '../src/data/teachers';
import { ALLOWED_SOCIAL_KEYS, SOCIAL_META } from '../src/lib/socials';
import { BIO_MAX_WORDS, countWords } from '../src/types/profile';
import { ConfirmModal } from '../src/components/ConfirmModal';
import {
  UserCircleIcon,
  CameraIcon,
  TrashIcon,
  LogOutIcon,
  ShieldCheckIcon,
  KeyIcon,
  CheckIcon,
  ArrowLeftIcon,
  ChevronDownIcon,
} from '../src/components/Icons';
import { getSocialIcon } from '../src/lib/socials';

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { session, profile, loading, signOut, refreshProfile } = useAuth();

  const staticData = useMemo(() => {
    if (!profile) return null;
    if (profile.member_type === 'student') {
      return studentsData.find((s) => s.id === profile.member_id) ?? null;
    }
    return teachersData.find((t) => t.id === profile.member_id) ?? null;
  }, [profile]);

  const [nickname, setNickname] = useState('');
  const [bio, setBio] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [age, setAge] = useState('');
  const [socials, setSocials] = useState<Record<string, string>>({});
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [pickedImage, setPickedImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [removePhoto, setRemovePhoto] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [securityOpen, setSecurityOpen] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    if (!loading && !session) {
      router.replace('/login');
    }
  }, [loading, session]);

  useEffect(() => {
    if (!profile) return;
    const effectiveSocials = getEffectiveSocials(staticData?.socials, profile);
    setNickname(profile.nickname ?? '');
    setBio(profile.bio ?? '');
    setBirthdate(profile.birthdate ?? staticData?.birthdate ?? '');
    setAge(profile.age != null ? String(profile.age) : staticData?.age != null ? String(staticData.age) : '');
    setSocials(effectiveSocials);
    setPhotoPreview(profile.photo_url ?? null);
    setPickedImage(null);
    setRemovePhoto(false);
  }, [profile?.id]);

  if (loading || !profile || !session) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.foreground} />
      </View>
    );
  }

  const bioWords = countWords(bio);

  async function pickImage() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Izin diperlukan', 'Aplikasi butuh akses galeri untuk mengganti foto profil.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]) {
      setPickedImage(result.assets[0]);
      setPhotoPreview(result.assets[0].uri);
      setRemovePhoto(false);
    }
  }

  function updateSocial(key: string, value: string) {
    setSocials((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    if (bioWords > BIO_MAX_WORDS) {
      setSaveError(`Bio maksimal ${BIO_MAX_WORDS} kata.`);
      return;
    }
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    try {
      let photoUrl = profile!.photo_url;
      if (pickedImage) {
        photoUrl = await uploadAvatar(
          session!.user.id,
          {
            uri: pickedImage.uri,
            fileName: pickedImage.fileName,
            mimeType: pickedImage.mimeType,
          },
          profile!.photo_url,
        );
      } else if (removePhoto) {
        photoUrl = null;
      }

      await updateOwnProfile(session!.user.id, {
        nickname: nickname.trim() || null,
        bio: bio.trim() || null,
        birthdate: birthdate.trim() || null,
        age: age.trim() ? Number(age) : null,
        photo_url: photoUrl,
        socials,
      });
      await refreshProfile();
      setPickedImage(null);
      setRemovePhoto(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      const message =
        err instanceof AvatarUploadError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Gagal menyimpan perubahan.';
      setSaveError(message);
    } finally {
      setSaving(false);
    }
  }

  function handleSignOut() {
    setLogoutModalVisible(true);
  }

  async function confirmSignOut() {
    setSigningOut(true);
    try {
      await signOut();
      router.replace('/');
    } finally {
      setSigningOut(false);
      setLogoutModalVisible(false);
    }
  }

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: insets.bottom + 40 }}
    >
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={10}>
          <ArrowLeftIcon size={18} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground, fontFamily: Typography.heading }]}>
          Profil Saya
        </Text>
        <TouchableOpacity onPress={handleSignOut} style={styles.backBtn} hitSlop={10}>
          <LogOutIcon size={18} color={colors.red} />
        </TouchableOpacity>
      </View>

      {/* Avatar */}
      <View style={styles.avatarSection}>
        <View style={[styles.avatarWrap, { borderColor: colors.cardBorder }]}>
          {photoPreview ? (
            <Image source={{ uri: photoPreview }} style={styles.avatarImg} />
          ) : (
            <View style={[styles.avatarPlaceholder, { backgroundColor: colors.surface2 }]}>
              <UserCircleIcon size={48} color={colors.mutedForeground} />
            </View>
          )}
          <TouchableOpacity
            onPress={pickImage}
            style={[styles.cameraBtn, { backgroundColor: colors.primary }]}
            activeOpacity={0.85}
          >
            <CameraIcon size={14} color={colors.primaryForeground} />
          </TouchableOpacity>
        </View>
        {photoPreview && (
          <TouchableOpacity
            onPress={() => {
              setPhotoPreview(null);
              setPickedImage(null);
              setRemovePhoto(true);
            }}
            style={styles.removePhotoBtn}
          >
            <TrashIcon size={12} color={colors.mutedForeground} />
            <Text style={[styles.removePhotoLabel, { color: colors.mutedForeground }]}>Hapus foto</Text>
          </TouchableOpacity>
        )}
        <Text style={[styles.fullName, { color: colors.foreground }]}>{profile.full_name}</Text>
        <View style={[styles.badge, { backgroundColor: colors.surface2, borderColor: colors.cardBorder }]}>
          {profile.is_admin && <ShieldCheckIcon size={11} color={colors.emerald} />}
          <Text style={[styles.badgeLabel, { color: colors.mutedForeground }]}>
            @{profile.username} · {profile.member_type === 'student' ? 'Murid' : 'Wali Kelas'}
            {profile.is_admin ? ' · Admin' : ''}
          </Text>
        </View>
      </View>

      {/* Editable fields */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Info Pribadi</Text>

        <Field label="Nama panggilan" colors={colors}>
          <TextInput
            value={nickname}
            onChangeText={setNickname}
            placeholder="Nama panggilan"
            placeholderTextColor={colors.mutedForeground}
            style={[styles.input, { color: colors.foreground, borderColor: colors.cardBorder, backgroundColor: colors.inputBg }]}
          />
        </Field>

        <Field label={`Bio · ditulis sendiri (${bioWords}/${BIO_MAX_WORDS} kata)`} colors={colors}>
          <TextInput
            value={bio}
            onChangeText={setBio}
            placeholder="Ceritakan sedikit tentang kamu..."
            placeholderTextColor={colors.mutedForeground}
            multiline
            numberOfLines={4}
            style={[
              styles.input,
              styles.textArea,
              { color: colors.foreground, borderColor: colors.cardBorder, backgroundColor: colors.inputBg },
            ]}
          />
        </Field>

        <View style={styles.row}>
          <Field label="Tanggal lahir" colors={colors} style={{ flex: 1.4 }}>
            <TextInput
              value={birthdate}
              onChangeText={setBirthdate}
              placeholder="cth. 17 Agustus 2008"
              placeholderTextColor={colors.mutedForeground}
              style={[styles.input, { color: colors.foreground, borderColor: colors.cardBorder, backgroundColor: colors.inputBg }]}
            />
          </Field>
          <Field label="Usia" colors={colors} style={{ flex: 0.6 }}>
            <TextInput
              value={age}
              onChangeText={setAge}
              placeholder="17"
              keyboardType="number-pad"
              placeholderTextColor={colors.mutedForeground}
              style={[styles.input, { color: colors.foreground, borderColor: colors.cardBorder, backgroundColor: colors.inputBg }]}
            />
          </Field>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Sosial Media</Text>
        {ALLOWED_SOCIAL_KEYS.map((key) => (
          <Field key={key} label={SOCIAL_META[key].label} colors={colors}>
            <View style={[styles.socialInputWrap, { borderColor: colors.cardBorder, backgroundColor: colors.inputBg }]}>
              {getSocialIcon(key, 15, colors.mutedForeground)}
              <TextInput
                value={socials[key] ?? ''}
                onChangeText={(v) => updateSocial(key, v)}
                placeholder={SOCIAL_META[key].placeholder}
                placeholderTextColor={colors.mutedForeground}
                autoCapitalize="none"
                style={[styles.socialInput, { color: colors.foreground }]}
              />
            </View>
          </Field>
        ))}
      </View>

      {saveError && (
        <View style={[styles.errorBox]}>
          <Text style={{ color: colors.red, fontFamily: Typography.bodyMedium, fontSize: 12.5 }}>
            {saveError}
          </Text>
        </View>
      )}
      {saveSuccess && (
        <View style={styles.successBox}>
          <CheckIcon size={13} color={colors.emerald} />
          <Text style={{ color: colors.emerald, fontFamily: Typography.bodyMedium, fontSize: 12.5 }}>
            Perubahan tersimpan.
          </Text>
        </View>
      )}

      <TouchableOpacity
        onPress={handleSave}
        disabled={saving}
        style={[styles.saveBtn, { backgroundColor: colors.primary }, saving && { opacity: 0.7 }]}
        activeOpacity={0.85}
      >
        {saving ? (
          <ActivityIndicator size="small" color={colors.primaryForeground} />
        ) : (
          <CheckIcon size={16} color={colors.primaryForeground} />
        )}
        <Text style={[styles.saveLabel, { color: colors.primaryForeground }]}>
          {saving ? 'Menyimpan...' : 'Simpan perubahan'}
        </Text>
      </TouchableOpacity>

      {/* Account security */}
      <TouchableOpacity
        onPress={() => setSecurityOpen((v) => !v)}
        style={[styles.securityHeader, { borderColor: colors.cardBorder }]}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <KeyIcon size={15} color={colors.foreground} />
          <Text style={{ color: colors.foreground, fontFamily: Typography.bodyMedium, fontSize: 13.5 }}>
            Keamanan Akun
          </Text>
        </View>
        <ChevronDownIcon size={16} color={colors.mutedForeground} />
      </TouchableOpacity>
      {securityOpen && (
        <AccountSecuritySection
          colors={colors}
          userId={session.user.id}
          username={profile.username}
        />
      )}

      <ConfirmModal
        visible={logoutModalVisible}
        title="Keluar akun?"
        message="Kamu akan keluar dari akun kelas ini. Kamu perlu masuk lagi untuk mengakses profil dan fitur lainnya."
        icon={<LogOutIcon size={22} color={colors.red} />}
        confirmLabel="Keluar"
        cancelLabel="Batal"
        danger
        loading={signingOut}
        onConfirm={confirmSignOut}
        onCancel={() => setLogoutModalVisible(false)}
      />
    </ScrollView>
  );
}

function Field({
  label,
  colors,
  children,
  style,
}: {
  label: string;
  colors: ReturnType<typeof useTheme>['colors'];
  children: React.ReactNode;
  style?: any;
}) {
  return (
    <View style={[{ marginBottom: Spacing.sm }, style]}>
      <Text style={{ fontFamily: Typography.bodyMedium, fontSize: 11.5, color: colors.mutedForeground, marginBottom: 5 }}>
        {label}
      </Text>
      {children}
    </View>
  );
}

function AccountSecuritySection({
  colors,
  userId,
  username,
}: {
  colors: ReturnType<typeof useTheme>['colors'];
  userId: string;
  username: string;
}) {
  const [newUsername, setNewUsername] = useState(username);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  async function handleSubmit() {
    setMsg(null);
    setBusy(true);
    try {
      if (newUsername.trim() && newUsername.trim() !== username) {
        await changeOwnUsername(userId, newUsername.trim());
      }
      if (newPassword || currentPassword || confirmPassword) {
        if (!currentPassword) throw new PasswordChangeError('Masukkan password saat ini.');
        if (newPassword !== confirmPassword) {
          throw new PasswordChangeError('Konfirmasi password baru tidak cocok.');
        }
        await changeOwnPassword(username, currentPassword, newPassword);
      }
      setMsg({ type: 'success', text: 'Perubahan keamanan akun tersimpan.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      const text = err instanceof Error ? err.message : 'Gagal menyimpan.';
      setMsg({ type: 'error', text });
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={[styles.section, { paddingTop: Spacing.sm }]}>
      <Field label="Username" colors={colors}>
        <TextInput
          value={newUsername}
          onChangeText={setNewUsername}
          autoCapitalize="none"
          style={[styles.input, { color: colors.foreground, borderColor: colors.cardBorder, backgroundColor: colors.inputBg }]}
        />
      </Field>
      <Field label="Password saat ini" colors={colors}>
        <TextInput
          value={currentPassword}
          onChangeText={setCurrentPassword}
          secureTextEntry
          placeholder="Wajib diisi untuk ganti password"
          placeholderTextColor={colors.mutedForeground}
          style={[styles.input, { color: colors.foreground, borderColor: colors.cardBorder, backgroundColor: colors.inputBg }]}
        />
      </Field>
      <Field label="Password baru" colors={colors}>
        <TextInput
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
          placeholder="Minimal 6 karakter"
          placeholderTextColor={colors.mutedForeground}
          style={[styles.input, { color: colors.foreground, borderColor: colors.cardBorder, backgroundColor: colors.inputBg }]}
        />
      </Field>
      <Field label="Konfirmasi password baru" colors={colors}>
        <TextInput
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          placeholderTextColor={colors.mutedForeground}
          style={[styles.input, { color: colors.foreground, borderColor: colors.cardBorder, backgroundColor: colors.inputBg }]}
        />
      </Field>

      {msg && (
        <Text
          style={{
            color: msg.type === 'error' ? colors.red : colors.emerald,
            fontFamily: Typography.bodyMedium,
            fontSize: 12,
            marginBottom: Spacing.sm,
          }}
        >
          {msg.text}
        </Text>
      )}

      <TouchableOpacity
        onPress={handleSubmit}
        disabled={busy}
        style={[styles.saveBtn, { backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.cardBorder }, busy && { opacity: 0.7 }]}
      >
        {busy ? (
          <ActivityIndicator size="small" color={colors.foreground} />
        ) : (
          <KeyIcon size={14} color={colors.foreground} />
        )}
        <Text style={[styles.saveLabel, { color: colors.foreground }]}>
          {busy ? 'Menyimpan...' : 'Simpan keamanan akun'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  backBtn: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17 },
  avatarSection: { alignItems: 'center', marginTop: Spacing.sm, marginBottom: Spacing.lg },
  avatarWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  avatarImg: { width: '100%', height: '100%', borderRadius: 48 },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraBtn: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
  removePhotoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: Spacing.sm,
  },
  removePhotoLabel: { fontFamily: Typography.bodyMedium, fontSize: 11 },
  fullName: { fontFamily: Typography.heading, fontSize: 17, marginTop: Spacing.sm },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderRadius: BorderRadius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 6,
  },
  badgeLabel: { fontFamily: Typography.bodyMedium, fontSize: 11 },
  section: { paddingHorizontal: Spacing.lg, marginBottom: Spacing.md },
  sectionTitle: { fontFamily: Typography.heading, fontSize: 14.5, marginBottom: Spacing.sm },
  row: { flexDirection: 'row', gap: Spacing.sm },
  input: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: 12,
    height: 42,
    fontFamily: Typography.body,
    fontSize: 13.5,
  },
  textArea: { height: 90, paddingTop: 10, textAlignVertical: 'top' },
  socialInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: 12,
    height: 42,
  },
  socialInput: { flex: 1, fontFamily: Typography.body, fontSize: 13.5 },
  errorBox: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
    padding: 10,
    borderRadius: BorderRadius.sm,
    backgroundColor: 'rgba(193,70,47,0.08)',
  },
  successBox: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  saveBtn: {
    marginHorizontal: Spacing.lg,
    height: 46,
    borderRadius: BorderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: Spacing.md,
  },
  saveLabel: { fontFamily: Typography.bodyMedium, fontSize: 13.5 },
  securityHeader: {
    marginHorizontal: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: 14,
    height: 46,
  },
});