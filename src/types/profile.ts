export type MemberType = 'student' | 'teacher';

/**
 * Baris tabel public.profiles di Supabase — sama persis dengan tipe di web
 * (web/src/types/profile.ts). Field yang boleh diubah sendiri oleh user:
 * nickname, bio, birthdate, age, photo_url, socials. Field yang cuma boleh
 * diubah admin: username, full_name, position, member_type, member_id,
 * is_admin (dijaga trigger `protect_profile_fields` di database).
 */
export interface Profile {
  id: string; // auth.users.id
  member_type: MemberType;
  member_id: number; // relasi ke data/students.ts atau data/teachers.ts (field `id`)
  username: string;
  full_name: string;
  nickname: string | null;
  bio: string | null;
  birthdate: string | null;
  age: number | null;
  photo_url: string | null;
  socials: Record<string, string>;
  position: string | null;
  absen_no: string | null;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export const BIO_MAX_WORDS = 40;
export const BIO_MAX_CHARS = 400;
export const AVATAR_MAX_BYTES = 2 * 1024 * 1024; // 2MB

export function countWords(text: string): number {
  return text.trim().length === 0 ? 0 : text.trim().split(/\s+/).length;
}

export function truncateBioForCard(bio: string | null | undefined, maxChars = 90): string {
  if (!bio) return '';
  if (bio.length <= maxChars) return bio;
  return `${bio.slice(0, maxChars).trimEnd()}…`;
}
