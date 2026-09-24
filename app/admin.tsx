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
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Typography, Spacing, BorderRadius, Shadows } from '../src/constants/theme';
import { useTheme } from '../src/context/ThemeContext';
import { useAuth } from '../src/context/AuthContext';
import { fetchAllProfiles, adminUpdateProfile } from '../src/lib/profilesApi';
import { uploadAvatar, AvatarUploadError } from '../src/lib/avatarUpload';
import { BIO_MAX_WORDS, countWords } from '../src/types/profile';
import {
  adminCreateAccount,
  adminDeleteAccount,
  adminResetPassword,
  adminSetAdmin,
  generateTempPassword,
  slugifyUsername,
} from '../src/lib/adminAccountsApi';
import {
  fetchSchedule,
  addLesson,
  updateLesson,
  deleteLesson,
  addDetail,
  updateDetail,
  deleteDetail,
  addPiket,
  updatePiket,
  deletePiket,
  type LessonRow,
  type DetailRow,
  type PiketRow,
  type ScheduleBundle,
} from '../src/lib/scheduleApi';
import { studentsData } from '../src/data/students';
import { teachersData } from '../src/data/teachers';
import { dayNames, dayLabels } from '../src/data/schedule';
import { toImageSource } from '../src/lib/imageSource';
import type { Profile, MemberType } from '../src/types/profile';
import {
  ArrowLeftIcon,
  SearchIcon,
  ShieldCheckIcon,
  PlusIcon,
  TrashIcon,
  KeyIcon,
  ChevronDownIcon,
  CheckIcon,
  PersonIcon,
  BookOpenIcon,
  BrushIcon,
  UsersIcon,
  CameraIcon,
  UserCircleIcon,
} from '../src/components/Icons';

interface Member {
  type: MemberType;
  id: number;
  fullName: string;
  displayName: string;
  photo?: unknown;
  position?: string;
  profile: Profile | null;
}

type AdminTab = 'akun' | 'jadwal';

export default function AdminScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { session, isAdmin, loading } = useAuth();

  const [tab, setTab] = useState<AdminTab>('akun');

  useEffect(() => {
    if (!loading && (!session || !isAdmin)) {
      router.replace(session ? '/profile' : '/login');
    }
  }, [loading, session, isAdmin]);

  if (loading || !isAdmin) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.foreground} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn} hitSlop={10}>
          <ArrowLeftIcon size={18} color={colors.foreground} />
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <View style={styles.headerBadge}>
            <ShieldCheckIcon size={13} color={colors.emerald} />
          </View>
        </View>
        <View style={styles.iconBtn} />
      </View>

      <Text style={styles.headerTitle}>Panel Admin</Text>
      <Text style={styles.headerSubtitle}>Kelola akun & jadwal kelas XII RPL 2</Text>

      <View style={styles.tabSwitcher}>
        <TouchableOpacity
          onPress={() => setTab('akun')}
          style={[styles.tabBtn, tab === 'akun' && styles.tabBtnActive]}
          activeOpacity={0.85}
        >
          <UsersIcon size={13} color={tab === 'akun' ? colors.primaryForeground : colors.mutedForeground} />
          <Text style={[styles.tabLabel, tab === 'akun' && styles.tabLabelActive]}>Akun</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setTab('jadwal')}
          style={[styles.tabBtn, tab === 'jadwal' && styles.tabBtnActive]}
          activeOpacity={0.85}
        >
          <BookOpenIcon size={13} color={tab === 'jadwal' ? colors.primaryForeground : colors.mutedForeground} />
          <Text style={[styles.tabLabel, tab === 'jadwal' && styles.tabLabelActive]}>Jadwal</Text>
        </TouchableOpacity>
      </View>

      {tab === 'akun' ? <AccountsTab colors={colors} insets={insets} /> : <ScheduleTab colors={colors} insets={insets} />}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
// TAB: AKUN
// ─────────────────────────────────────────────────────────────

function AccountsTab({
  colors,
  insets,
}: {
  colors: ReturnType<typeof useTheme>['colors'];
  insets: { bottom: number };
}) {
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loadingProfiles, setLoadingProfiles] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'student' | 'teacher'>('all');
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const [creatingFor, setCreatingFor] = useState<Member | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoadingProfiles(true);
    const data = await fetchAllProfiles(true);
    setProfiles(data);
    setLoadingProfiles(false);
  }

  const members: Member[] = useMemo(() => {
    const students: Member[] = studentsData.map((s) => {
      const p = profiles.find((pr) => pr.member_type === 'student' && pr.member_id === s.id) ?? null;
      return {
        type: 'student',
        id: s.id,
        fullName: s.fullName,
        displayName: p?.nickname?.trim() || s.name,
        photo: p?.photo_url || s.photo,
        position: p?.position ?? s.position,
        profile: p,
      };
    });
    const teachers: Member[] = teachersData.map((t) => {
      const p = profiles.find((pr) => pr.member_type === 'teacher' && pr.member_id === t.id) ?? null;
      return {
        type: 'teacher',
        id: t.id,
        fullName: t.fullName,
        displayName: p?.nickname?.trim() || t.name,
        photo: p?.photo_url || t.photo,
        position: p?.position ?? t.role,
        profile: p,
      };
    });
    return [...students, ...teachers];
  }, [profiles]);

  const stats = useMemo(() => {
    const withAccount = members.filter((m) => m.profile).length;
    const admins = members.filter((m) => m.profile?.is_admin).length;
    return { total: members.length, withAccount, admins };
  }, [members]);

  const filtered = members.filter((m) => {
    if (roleFilter !== 'all' && m.type !== roleFilter) return false;
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    return (
      m.fullName.toLowerCase().includes(q) ||
      m.displayName.toLowerCase().includes(q) ||
      m.profile?.username?.toLowerCase().includes(q)
    );
  });

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total anggota</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{stats.withAccount}</Text>
          <Text style={styles.statLabel}>Punya akun</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statValue, { color: colors.emerald }]}>{stats.admins}</Text>
          <Text style={styles.statLabel}>Admin</Text>
        </View>
      </View>

      <View style={styles.searchRow}>
        <View style={styles.searchWrap}>
          <SearchIcon size={15} color={colors.mutedForeground} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Cari nama atau username..."
            placeholderTextColor={colors.mutedForeground}
            style={styles.searchInput}
          />
        </View>
      </View>

      <View style={styles.filterRow}>
        {(['all', 'student', 'teacher'] as const).map((f) => (
          <TouchableOpacity
            key={f}
            onPress={() => setRoleFilter(f)}
            style={[styles.filterChip, roleFilter === f && styles.filterChipActive]}
          >
            <Text style={[styles.filterChipText, roleFilter === f && styles.filterChipTextActive]}>
              {f === 'all' ? 'Semua' : f === 'student' ? 'Murid' : 'Guru'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loadingProfiles ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.foreground} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}>
          {filtered.map((m) => {
            const key = `${m.type}-${m.id}`;
            const isOpen = expandedKey === key;
            const photoSource = toImageSource(m.photo);
            return (
              <View key={key} style={styles.memberCard}>
                <TouchableOpacity
                  onPress={() => setExpandedKey(isOpen ? null : key)}
                  style={styles.memberRow}
                  activeOpacity={0.8}
                >
                  <View style={styles.memberAvatar}>
                    {photoSource ? (
                      <Image source={photoSource} style={styles.memberAvatarImg} resizeMode="cover" />
                    ) : (
                      <PersonIcon size={18} color={colors.mutedForeground} />
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.memberName}>{m.fullName}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
                      <View
                        style={[
                          styles.roleTag,
                          { backgroundColor: m.type === 'student' ? colors.surface2 : 'rgba(200,150,60,0.12)' },
                        ]}
                      >
                        <Text style={[styles.roleTagText, m.type === 'teacher' && { color: colors.amber }]}>
                          {m.type === 'student' ? 'Murid' : 'Guru'}
                        </Text>
                      </View>
                      {m.profile?.is_admin && (
                        <View style={styles.adminTag}>
                          <ShieldCheckIcon size={9} color={colors.emerald} />
                          <Text style={styles.adminTagText}>Admin</Text>
                        </View>
                      )}
                      <Text style={styles.memberMeta} numberOfLines={1}>
                        {m.profile ? `@${m.profile.username}` : 'Belum ada akun'}
                      </Text>
                    </View>
                  </View>
                  <ChevronDownIcon size={16} color={colors.mutedForeground} />
                </TouchableOpacity>

                {isOpen && (
                  <View style={styles.memberBody}>
                    {m.profile ? (
                      <MemberEditor member={m} colors={colors} onSaved={load} />
                    ) : (
                      <TouchableOpacity onPress={() => setCreatingFor(m)} style={styles.createBtn}>
                        <PlusIcon size={14} color={colors.primaryForeground} />
                        <Text style={styles.createBtnText}>
                          Buat akun untuk {m.fullName.split(' ')[0]}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>
      )}

      {creatingFor && (
        <CreateAccountModal
          member={creatingFor}
          colors={colors}
          onClose={() => setCreatingFor(null)}
          onCreated={() => {
            setCreatingFor(null);
            load();
          }}
        />
      )}
    </View>
  );
}

function MemberEditor({
  member,
  colors,
  onSaved,
}: {
  member: Member;
  colors: ReturnType<typeof useTheme>['colors'];
  onSaved: () => void;
}) {
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const p = member.profile!;
  // Semua field di bawah selalu diisi dari data asli profil (p.*) sehingga
  // tidak pernah kosong di layar — sama seperti perilaku form admin di website.
  const [fullName, setFullName] = useState(p.full_name ?? member.fullName);
  const [nickname, setNickname] = useState(p.nickname ?? '');
  const [position, setPosition] = useState(p.position ?? '');
  const [absenNo, setAbsenNo] = useState(p.absen_no ?? '');
  const [bio, setBio] = useState(p.bio ?? '');
  const [makeAdmin, setMakeAdmin] = useState(p.is_admin);
  const [photoPreview, setPhotoPreview] = useState<string | null>(p.photo_url ?? null);
  const [pickedImage, setPickedImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [removePhoto, setRemovePhoto] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  const bioWords = countWords(bio);
  const photoSource = photoPreview ? { uri: photoPreview } : toImageSource(p.photo_url);

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

  async function handleSave() {
    if (!fullName.trim()) {
      setMsg({ type: 'error', text: 'Nama lengkap tidak boleh kosong.' });
      return;
    }
    if (bioWords > BIO_MAX_WORDS) {
      setMsg({ type: 'error', text: `Bio maksimal ${BIO_MAX_WORDS} kata.` });
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      let photoUrl = p.photo_url;
      if (pickedImage) {
        photoUrl = await uploadAvatar(
          p.id,
          {
            uri: pickedImage.uri,
            fileName: pickedImage.fileName,
            mimeType: pickedImage.mimeType,
          },
          p.photo_url,
        );
      } else if (removePhoto) {
        photoUrl = null;
      }

      await adminUpdateProfile(p.id, {
        full_name: fullName.trim(),
        nickname: nickname.trim() || null,
        position: position.trim() || null,
        absen_no: absenNo.trim() || null,
        bio: bio.trim() || null,
        photo_url: photoUrl,
      });
      if (makeAdmin !== p.is_admin) {
        await adminSetAdmin(p.id, makeAdmin);
      }
      setPickedImage(null);
      setRemovePhoto(false);
      setMsg({ type: 'success', text: 'Tersimpan.' });
      onSaved();
    } catch (err) {
      const text =
        err instanceof AvatarUploadError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Gagal menyimpan.';
      setMsg({ type: 'error', text });
    } finally {
      setBusy(false);
    }
  }

  function handleResetPassword() {
    const tempPassword = generateTempPassword();
    Alert.alert(
      'Reset password',
      `Password baru untuk ${member.fullName}:\n\n${tempPassword}\n\nCatat password ini sebelum melanjutkan — tidak bisa dilihat lagi setelah ini.`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Reset sekarang',
          onPress: async () => {
            try {
              await adminResetPassword(p.id, tempPassword);
              Alert.alert('Berhasil', 'Password sudah direset.');
            } catch (err) {
              Alert.alert('Gagal', err instanceof Error ? err.message : 'Gagal reset password.');
            }
          },
        },
      ],
    );
  }

  function handleDelete() {
    Alert.alert(
      'Hapus akun?',
      `Akun ${member.fullName} akan dihapus permanen. Data profil (nickname, bio, foto) juga akan hilang.`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              await adminDeleteAccount(p.id);
              onSaved();
            } catch (err) {
              Alert.alert('Gagal', err instanceof Error ? err.message : 'Gagal menghapus akun.');
            }
          },
        },
      ],
    );
  }

  return (
    <View style={{ gap: Spacing.sm }}>
      {/* Ubah Foto Profile */}
      <View style={styles.editAvatarRow}>
        <View style={styles.editAvatarWrap}>
          {photoSource ? (
            <Image source={photoSource} style={styles.editAvatarImg} resizeMode="cover" />
          ) : (
            <View style={[styles.editAvatarImg, styles.editAvatarPlaceholder]}>
              <UserCircleIcon size={30} color={colors.mutedForeground} />
            </View>
          )}
          <TouchableOpacity
            onPress={pickImage}
            style={[styles.editAvatarCameraBtn, { backgroundColor: colors.primary }]}
            activeOpacity={0.85}
          >
            <CameraIcon size={12} color={colors.primaryForeground} />
          </TouchableOpacity>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.editAvatarHint}>Foto profil</Text>
          <Text style={styles.editAvatarSub}>Maksimal 2MB. Foto lama otomatis dihapus.</Text>
          {photoSource && (
            <TouchableOpacity
              onPress={() => {
                setPhotoPreview(null);
                setPickedImage(null);
                setRemovePhoto(true);
              }}
              style={styles.editAvatarRemoveBtn}
            >
              <TrashIcon size={11} color={colors.mutedForeground} />
              <Text style={styles.editAvatarRemoveText}>Hapus foto</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <MiniField label="Nama Lengkap" value={fullName} onChangeText={setFullName} colors={colors} />
      <MiniField label="Nomor Absen" value={absenNo} onChangeText={setAbsenNo} colors={colors} keyboardType="number-pad" />
      <MiniField label="Jabatan" value={position} onChangeText={setPosition} colors={colors} />
      <MiniField label="Nama Panggilan" value={nickname} onChangeText={setNickname} colors={colors} />

      <View>
        <View style={styles.bioLabelRow}>
          <Text style={styles.miniFieldLabel}>Bio</Text>
          <Text style={[styles.bioCounter, bioWords > BIO_MAX_WORDS && { color: colors.red }]}>
            {bioWords}/{BIO_MAX_WORDS} kata
          </Text>
        </View>
        <TextInput
          value={bio}
          onChangeText={setBio}
          multiline
          placeholder="Belum ada bio"
          placeholderTextColor={colors.mutedForeground}
          style={styles.bioInput}
        />
      </View>

      <View style={styles.switchRow}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <ShieldCheckIcon size={14} color={colors.emerald} />
          <Text style={{ color: colors.foreground, fontFamily: Typography.bodyMedium, fontSize: 12.5 }}>
            Jadikan admin
          </Text>
        </View>
        <Switch value={makeAdmin} onValueChange={setMakeAdmin} />
      </View>

      {msg && (
        <Text style={{ color: msg.type === 'error' ? colors.red : colors.emerald, fontFamily: Typography.body, fontSize: 11.5 }}>
          {msg.text}
        </Text>
      )}

      <View style={{ flexDirection: 'row', gap: 8 }}>
        <TouchableOpacity onPress={handleSave} disabled={busy} style={[styles.smallBtn, { backgroundColor: colors.primary, flex: 1 }]}>
          {busy ? <ActivityIndicator size="small" color={colors.primaryForeground} /> : <CheckIcon size={13} color={colors.primaryForeground} />}
          <Text style={{ color: colors.primaryForeground, fontFamily: Typography.bodyMedium, fontSize: 12 }}>Simpan</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleResetPassword} style={[styles.smallBtn, styles.smallBtnOutline]}>
          <KeyIcon size={13} color={colors.foreground} />
          <Text style={{ color: colors.foreground, fontFamily: Typography.bodyMedium, fontSize: 12 }}>Reset PW</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleDelete} style={[styles.smallBtn, styles.smallBtnDanger]}>
          <TrashIcon size={13} color={colors.red} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function CreateAccountModal({
  member,
  colors,
  onClose,
  onCreated,
}: {
  member: Member;
  colors: ReturnType<typeof useTheme>['colors'];
  onClose: () => void;
  onCreated: () => void;
}) {
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [username, setUsername] = useState(slugifyUsername(member.fullName));
  const [tempPassword, setTempPassword] = useState(generateTempPassword());
  const [makeAdmin, setMakeAdmin] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate() {
    setBusy(true);
    setError(null);
    try {
      await adminCreateAccount({
        memberType: member.type,
        memberId: member.id,
        username: username.trim(),
        fullName: member.fullName,
        position: member.position,
        tempPassword,
        makeAdmin,
      });
      Alert.alert(
        'Akun dibuat',
        `Username: ${username.trim()}\nPassword sementara: ${tempPassword}\n\nCatat kredensial ini, tidak akan ditampilkan lagi.`,
      );
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal membuat akun.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.modalOverlay}>
      <View style={styles.modalCard}>
        <Text style={styles.modalTitle}>Buat akun · {member.fullName}</Text>
        <MiniField label="Username" value={username} onChangeText={setUsername} colors={colors} />
        <MiniField label="Password sementara" value={tempPassword} onChangeText={setTempPassword} colors={colors} />
        <View style={[styles.switchRow, { marginTop: 4 }]}>
          <Text style={{ color: colors.foreground, fontFamily: Typography.bodyMedium, fontSize: 12.5 }}>Jadikan admin</Text>
          <Switch value={makeAdmin} onValueChange={setMakeAdmin} />
        </View>
        {error && <Text style={{ color: colors.red, fontFamily: Typography.body, fontSize: 12, marginTop: 6 }}>{error}</Text>}
        <View style={{ flexDirection: 'row', gap: 8, marginTop: Spacing.md }}>
          <TouchableOpacity onPress={onClose} style={[styles.smallBtn, styles.smallBtnOutline, { flex: 1 }]}>
            <Text style={{ color: colors.foreground, fontFamily: Typography.bodyMedium, fontSize: 12.5 }}>Batal</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleCreate}
            disabled={busy || !username.trim()}
            style={[styles.smallBtn, { flex: 1, backgroundColor: colors.primary }]}
          >
            {busy ? (
              <ActivityIndicator size="small" color={colors.primaryForeground} />
            ) : (
              <Text style={{ color: colors.primaryForeground, fontFamily: Typography.bodyMedium, fontSize: 12.5 }}>Buat akun</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
// TAB: JADWAL
// ─────────────────────────────────────────────────────────────

function ScheduleTab({
  colors,
  insets,
}: {
  colors: ReturnType<typeof useTheme>['colors'];
  insets: { bottom: number };
}) {
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [bundle, setBundle] = useState<ScheduleBundle | null>(null);
  const [loadingBundle, setLoadingBundle] = useState(true);
  const [day, setDay] = useState<string>(dayNames[0]);
  const [kind, setKind] = useState<'lessons' | 'details' | 'piket'>('lessons');

  async function load() {
    setLoadingBundle(true);
    const b = await fetchSchedule();
    setBundle(b);
    setLoadingBundle(false);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dayChipsRow} contentContainerStyle={{ gap: Spacing.xs }}>
        {dayNames.map((d) => (
          <TouchableOpacity
            key={d}
            onPress={() => setDay(d)}
            style={[styles.filterChip, day === d && styles.filterChipActive]}
          >
            <Text style={[styles.filterChipText, day === d && styles.filterChipTextActive]}>{dayLabels[d]}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.tabSwitcher}>
        <TouchableOpacity
          onPress={() => setKind('lessons')}
          style={[styles.tabBtn, kind === 'lessons' && styles.tabBtnActive]}
        >
          <BookOpenIcon size={12} color={kind === 'lessons' ? colors.primaryForeground : colors.mutedForeground} />
          <Text style={[styles.tabLabel, kind === 'lessons' && styles.tabLabelActive]}>Pelajaran</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setKind('details')}
          style={[styles.tabBtn, kind === 'details' && styles.tabBtnActive]}
        >
          <UsersIcon size={12} color={kind === 'details' ? colors.primaryForeground : colors.mutedForeground} />
          <Text style={[styles.tabLabel, kind === 'details' && styles.tabLabelActive]}>Detail Guru</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setKind('piket')}
          style={[styles.tabBtn, kind === 'piket' && styles.tabBtnActive]}
        >
          <BrushIcon size={12} color={kind === 'piket' ? colors.primaryForeground : colors.mutedForeground} />
          <Text style={[styles.tabLabel, kind === 'piket' && styles.tabLabelActive]}>Piket</Text>
        </TouchableOpacity>
      </View>

      {loadingBundle || !bundle ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.foreground} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: Spacing.md, paddingBottom: insets.bottom + 40 }}>
          {kind === 'lessons' && (
            <LessonsEditor day={day} rows={bundle.lessons[day] ?? []} colors={colors} onChanged={load} />
          )}
          {kind === 'details' && (
            <DetailsEditor day={day} rows={bundle.details[day] ?? []} colors={colors} onChanged={load} />
          )}
          {kind === 'piket' && (
            <PiketEditor day={day} rows={bundle.piket[day] ?? []} colors={colors} onChanged={load} />
          )}
        </ScrollView>
      )}
    </View>
  );
}

function LessonsEditor({
  day,
  rows,
  colors,
  onChanged,
}: {
  day: string;
  rows: LessonRow[];
  colors: ReturnType<typeof useTheme>['colors'];
  onChanged: () => void;
}) {
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [drafts, setDrafts] = useState(() => rows.map((r) => ({ ...r })));
  useEffect(() => setDrafts(rows.map((r) => ({ ...r }))), [rows]);

  return (
    <View style={{ gap: Spacing.sm }}>
      {drafts.map((row, i) => (
        <View key={row.id} style={styles.rowCard}>
          <TextInput
            value={row.time}
            onChangeText={(v) => setDrafts((d) => d.map((x, idx) => (idx === i ? { ...x, time: v } : x)))}
            style={[styles.rowInput, { flex: 0.9 }]}
            placeholder="Jam"
            placeholderTextColor={colors.mutedForeground}
          />
          <TextInput
            value={row.subject}
            onChangeText={(v) => setDrafts((d) => d.map((x, idx) => (idx === i ? { ...x, subject: v } : x)))}
            style={[styles.rowInput, { flex: 1.4 }]}
            placeholder="Mata pelajaran"
            placeholderTextColor={colors.mutedForeground}
          />
          <RowActions
            colors={colors}
            onSave={async () => {
              await updateLesson(row.id, { time: row.time, subject: row.subject });
              onChanged();
            }}
            onDelete={() =>
              Alert.alert('Hapus sesi ini?', 'Sesi jadwal pelajaran ini akan dihapus permanen.', [
                { text: 'Batal', style: 'cancel' },
                {
                  text: 'Hapus',
                  style: 'destructive',
                  onPress: async () => {
                    await deleteLesson(row.id);
                    onChanged();
                  },
                },
              ])
            }
          />
        </View>
      ))}
      <TouchableOpacity
        onPress={async () => {
          await addLesson(day, { time: '00.00 - 00.00', subject: 'Mata pelajaran' }, rows.length);
          onChanged();
        }}
        style={styles.addRowBtn}
      >
        <PlusIcon size={14} color={colors.foreground} />
        <Text style={styles.addRowLabel}>Tambah sesi</Text>
      </TouchableOpacity>
    </View>
  );
}

function DetailsEditor({
  day,
  rows,
  colors,
  onChanged,
}: {
  day: string;
  rows: DetailRow[];
  colors: ReturnType<typeof useTheme>['colors'];
  onChanged: () => void;
}) {
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [drafts, setDrafts] = useState(() => rows.map((r) => ({ ...r })));
  useEffect(() => setDrafts(rows.map((r) => ({ ...r }))), [rows]);

  return (
    <View style={{ gap: Spacing.sm }}>
      {drafts.map((row, i) => (
        <View key={row.id} style={[styles.rowCard, { flexWrap: 'wrap' }]}>
          <TextInput
            value={row.subject}
            onChangeText={(v) => setDrafts((d) => d.map((x, idx) => (idx === i ? { ...x, subject: v } : x)))}
            style={[styles.rowInput, { flex: 1, minWidth: '100%', marginBottom: 6 }]}
            placeholder="Mata pelajaran"
            placeholderTextColor={colors.mutedForeground}
          />
          <TextInput
            value={row.teacher}
            onChangeText={(v) => setDrafts((d) => d.map((x, idx) => (idx === i ? { ...x, teacher: v } : x)))}
            style={[styles.rowInput, { flex: 1 }]}
            placeholder="Nama guru"
            placeholderTextColor={colors.mutedForeground}
          />
          <RowActions
            colors={colors}
            onSave={async () => {
              await updateDetail(row.id, { subject: row.subject, teacher: row.teacher });
              onChanged();
            }}
            onDelete={() =>
              Alert.alert('Hapus detail ini?', 'Detail guru mata pelajaran ini akan dihapus.', [
                { text: 'Batal', style: 'cancel' },
                {
                  text: 'Hapus',
                  style: 'destructive',
                  onPress: async () => {
                    await deleteDetail(row.id);
                    onChanged();
                  },
                },
              ])
            }
          />
        </View>
      ))}
      <TouchableOpacity
        onPress={async () => {
          await addDetail(day, { subject: 'Mata pelajaran', teacher: 'Nama guru' }, rows.length);
          onChanged();
        }}
        style={styles.addRowBtn}
      >
        <PlusIcon size={14} color={colors.foreground} />
        <Text style={styles.addRowLabel}>Tambah detail</Text>
      </TouchableOpacity>
    </View>
  );
}

function PiketEditor({
  day,
  rows,
  colors,
  onChanged,
}: {
  day: string;
  rows: PiketRow[];
  colors: ReturnType<typeof useTheme>['colors'];
  onChanged: () => void;
}) {
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [drafts, setDrafts] = useState(() => rows.map((r) => ({ ...r })));
  useEffect(() => setDrafts(rows.map((r) => ({ ...r }))), [rows]);

  return (
    <View style={{ gap: Spacing.sm }}>
      {drafts.map((row, i) => (
        <View key={row.id} style={[styles.rowCard, { flexWrap: 'wrap' }]}>
          <TextInput
            value={row.fullName}
            onChangeText={(v) => setDrafts((d) => d.map((x, idx) => (idx === i ? { ...x, fullName: v } : x)))}
            style={[styles.rowInput, { flex: 1, minWidth: '100%', marginBottom: 6 }]}
            placeholder="Nama lengkap"
            placeholderTextColor={colors.mutedForeground}
            autoCapitalize="characters"
          />
          <TextInput
            value={row.nickname}
            onChangeText={(v) => setDrafts((d) => d.map((x, idx) => (idx === i ? { ...x, nickname: v } : x)))}
            style={[styles.rowInput, { flex: 1 }]}
            placeholder="Panggilan"
            placeholderTextColor={colors.mutedForeground}
          />
          <RowActions
            colors={colors}
            onSave={async () => {
              await updatePiket(row.id, { fullName: row.fullName, nickname: row.nickname });
              onChanged();
            }}
            onDelete={() =>
              Alert.alert('Hapus petugas piket ini?', 'Baris petugas piket ini akan dihapus.', [
                { text: 'Batal', style: 'cancel' },
                {
                  text: 'Hapus',
                  style: 'destructive',
                  onPress: async () => {
                    await deletePiket(row.id);
                    onChanged();
                  },
                },
              ])
            }
          />
        </View>
      ))}
      <TouchableOpacity
        onPress={async () => {
          await addPiket(day, { fullName: 'NAMA LENGKAP', nickname: 'Panggilan' }, rows.length);
          onChanged();
        }}
        style={styles.addRowBtn}
      >
        <PlusIcon size={14} color={colors.foreground} />
        <Text style={styles.addRowLabel}>Tambah petugas</Text>
      </TouchableOpacity>
    </View>
  );
}

function RowActions({
  colors,
  onSave,
  onDelete,
}: {
  colors: ReturnType<typeof useTheme>['colors'];
  onSave: () => Promise<void>;
  onDelete: () => void;
}) {
  const [busy, setBusy] = useState(false);
  return (
    <View style={{ flexDirection: 'row', gap: 6 }}>
      <TouchableOpacity
        onPress={async () => {
          setBusy(true);
          await onSave();
          setBusy(false);
        }}
        style={[styles2.rowActionBtn, { backgroundColor: colors.primary }]}
      >
        {busy ? <ActivityIndicator size="small" color={colors.primaryForeground} /> : <CheckIcon size={13} color={colors.primaryForeground} />}
      </TouchableOpacity>
      <TouchableOpacity onPress={onDelete} style={[styles2.rowActionBtn, { backgroundColor: 'rgba(193,70,47,0.12)' }]}>
        <TrashIcon size={13} color={colors.red} />
      </TouchableOpacity>
    </View>
  );
}
const styles2 = StyleSheet.create({
  rowActionBtn: { width: 34, height: 34, borderRadius: BorderRadius.sm, alignItems: 'center', justifyContent: 'center' },
});

function MiniField({
  label,
  value,
  onChangeText,
  colors,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  colors: ReturnType<typeof useTheme>['colors'];
  keyboardType?: 'default' | 'number-pad';
}) {
  return (
    <View>
      <Text style={{ fontFamily: Typography.bodyMedium, fontSize: 11, color: colors.mutedForeground, marginBottom: 4 }}>
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        autoCapitalize="none"
        keyboardType={keyboardType}
        style={{
          borderWidth: 1,
          borderColor: colors.cardBorder,
          backgroundColor: colors.inputBg,
          color: colors.foreground,
          borderRadius: BorderRadius.sm,
          paddingHorizontal: 10,
          height: 38,
          fontFamily: Typography.body,
          fontSize: 13,
        }}
      />
    </View>
  );
}

const makeStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: Spacing.md,
    },
    iconBtn: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
    headerBadge: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: 'rgba(63,125,87,0.12)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTitle: {
      fontFamily: Typography.heading,
      fontSize: 21,
      color: colors.foreground,
      textAlign: 'center',
      marginTop: 4,
    },
    headerSubtitle: {
      fontFamily: Typography.body,
      fontSize: 12,
      color: colors.mutedForeground,
      textAlign: 'center',
      marginTop: 2,
      marginBottom: Spacing.sm,
    },
    tabSwitcher: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      borderRadius: BorderRadius.full,
      padding: 3,
      marginHorizontal: Spacing.md,
      marginBottom: Spacing.sm,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 3,
    },
    tabBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 5,
      paddingVertical: 8,
      borderRadius: BorderRadius.full,
    },
    tabBtnActive: { backgroundColor: colors.primary },
    tabLabel: { fontFamily: Typography.bodyMedium, fontSize: 12, color: colors.mutedForeground },
    tabLabelActive: { color: colors.primaryForeground },

    statsRow: { flexDirection: 'row', gap: Spacing.sm, paddingHorizontal: Spacing.md, marginBottom: Spacing.sm },
    statBox: {
      flex: 1,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      borderRadius: BorderRadius.md,
      paddingVertical: 10,
      alignItems: 'center',
    },
    statValue: { fontFamily: Typography.heading, fontSize: 18, color: colors.foreground },
    statLabel: { fontFamily: Typography.body, fontSize: 9.5, color: colors.mutedForeground, marginTop: 2, textAlign: 'center' },

    searchRow: { paddingHorizontal: Spacing.md, marginBottom: Spacing.sm },
    searchWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      backgroundColor: colors.inputBg,
      borderRadius: BorderRadius.md,
      paddingHorizontal: 12,
      height: 42,
    },
    searchInput: { flex: 1, fontFamily: Typography.body, fontSize: 13.5, color: colors.foreground },

    filterRow: { flexDirection: 'row', gap: 8, paddingHorizontal: Spacing.md, marginBottom: Spacing.sm },
    dayChipsRow: { paddingHorizontal: Spacing.md, marginBottom: Spacing.sm },
    filterChip: { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, borderRadius: BorderRadius.full, paddingHorizontal: 14, paddingVertical: 6 },
    filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    filterChipText: { fontFamily: Typography.bodyMedium, fontSize: 12, color: colors.mutedForeground },
    filterChipTextActive: { color: colors.primaryForeground },

    memberCard: {
      marginHorizontal: Spacing.md,
      marginBottom: Spacing.sm,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      backgroundColor: colors.card,
      borderRadius: BorderRadius.md,
      overflow: 'hidden',
    },
    memberRow: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 10 },
    memberAvatar: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: colors.surface2,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    memberAvatarImg: { width: '100%', height: '100%' },
    memberName: { fontFamily: Typography.bodyMedium, fontSize: 13.5, color: colors.foreground },
    memberMeta: { fontFamily: Typography.body, fontSize: 11, color: colors.mutedForeground, flexShrink: 1 },
    roleTag: { borderRadius: BorderRadius.sm, paddingHorizontal: 6, paddingVertical: 1.5 },
    roleTagText: { fontFamily: Typography.bodyMedium, fontSize: 9.5, color: colors.mutedForeground },
    adminTag: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
      backgroundColor: 'rgba(63,125,87,0.12)',
      borderRadius: BorderRadius.sm,
      paddingHorizontal: 6,
      paddingVertical: 1.5,
    },
    adminTagText: { fontFamily: Typography.bodyMedium, fontSize: 9.5, color: colors.emerald },
    memberBody: { paddingHorizontal: 12, paddingBottom: 12 },
    editAvatarRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 2 },
    editAvatarWrap: { width: 56, height: 56 },
    editAvatarImg: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.surface2 },
    editAvatarPlaceholder: { alignItems: 'center', justifyContent: 'center' },
    editAvatarCameraBtn: {
      position: 'absolute',
      right: -2,
      bottom: -2,
      width: 22,
      height: 22,
      borderRadius: 11,
      alignItems: 'center',
      justifyContent: 'center',
      ...Shadows.sm,
    },
    editAvatarHint: { fontFamily: Typography.bodyMedium, fontSize: 12.5, color: colors.foreground },
    editAvatarSub: { fontFamily: Typography.body, fontSize: 10.5, color: colors.mutedForeground, marginTop: 2 },
    editAvatarRemoveBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
    editAvatarRemoveText: { fontFamily: Typography.bodyMedium, fontSize: 10.5, color: colors.mutedForeground },

    miniFieldLabel: { fontFamily: Typography.bodyMedium, fontSize: 11, color: colors.mutedForeground },
    bioLabelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
    bioCounter: { fontFamily: Typography.body, fontSize: 10, color: colors.mutedForeground },
    bioInput: {
      borderWidth: 1,
      borderColor: colors.cardBorder,
      backgroundColor: colors.inputBg,
      color: colors.foreground,
      borderRadius: BorderRadius.sm,
      paddingHorizontal: 10,
      paddingVertical: 8,
      minHeight: 70,
      textAlignVertical: 'top',
      fontFamily: Typography.body,
      fontSize: 13,
    },

    createBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      height: 40,
      borderRadius: BorderRadius.md,
      backgroundColor: colors.primary,
    },
    createBtnText: { color: colors.primaryForeground, fontFamily: Typography.bodyMedium, fontSize: 12.5 },
    switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    smallBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      height: 38,
      borderRadius: BorderRadius.md,
      paddingHorizontal: 12,
    },
    smallBtnOutline: { backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.cardBorder },
    smallBtnDanger: { backgroundColor: 'rgba(193,70,47,0.1)', borderWidth: 1, borderColor: 'rgba(193,70,47,0.3)' },

    rowCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      borderRadius: BorderRadius.md,
      padding: 8,
    },
    rowInput: {
      borderWidth: 1,
      borderColor: colors.cardBorder,
      backgroundColor: colors.inputBg,
      color: colors.foreground,
      borderRadius: BorderRadius.sm,
      paddingHorizontal: 10,
      height: 38,
      fontFamily: Typography.body,
      fontSize: 12.5,
    },
    addRowBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      height: 42,
      borderRadius: BorderRadius.md,
      borderWidth: 1,
      borderColor: colors.border,
      borderStyle: 'dashed',
      marginTop: Spacing.xs,
    },
    addRowLabel: { fontFamily: Typography.bodyMedium, fontSize: 12.5, color: colors.foreground },

    modalOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: Spacing.lg,
    },
    modalCard: {
      width: '100%',
      borderWidth: 1,
      borderColor: colors.cardBorder,
      backgroundColor: colors.card,
      borderRadius: BorderRadius.lg,
      padding: Spacing.lg,
      ...Shadows.md,
    },
    modalTitle: { color: colors.foreground, fontFamily: Typography.heading, fontSize: 16, marginBottom: Spacing.sm },
  });