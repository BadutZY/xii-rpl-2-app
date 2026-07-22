export interface Teacher {
  id: number;
  name: string;
  fullName: string;
  age: number | null;
  birthdate: string;
  subject: string;
  role: string;
  photo?: any;
  socials?: Record<string, string>;
}

export const teachersData: Teacher[] = [
  {
    id: 1,
    name: 'Bu Yeni',
    fullName: 'Yeni Yuliawati, S.Pd,Gr.',
    age: null,
    birthdate: '-',
    subject: 'Bahasa Indonesia',
    role: 'Wali Kelas XII RPL 2',
    socials: {
      instagram: '-',
      youtube: '-',
      github: '-',
      twitter: '-',
      linkedin: '-',
      tiktok: '-',
      website: '-',
    },
  },
];