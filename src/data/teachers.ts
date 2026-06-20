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
    name: 'Bu Dian',
    fullName: 'Dian Hardianti, S.Kom.',
    age: null,
    birthdate: '-',
    subject: 'Basis Data',
    role: 'Wali Kelas XI RPL 2',
    socials: {
      instagram: 'https://www.instagram.com/dianadithia/',
    },
  },
];
