export interface Student {
  id: number;
  no: string;
  name: string;
  fullName: string;
  age: number;
  birthdate: string;
  position: string;
  photo?: any;
  socials: Record<string, string>;
}

export const studentsData: Student[] = [
  { id: 1, no: '1', name: 'Abiyan', fullName: 'ABIYAN ZUL FADLI', age: 18, birthdate: '15 Juli 2008', position: '-', socials: { instagram: 'https://www.instagram.com/yanxilberto/' } },
  { id: 2, no: '2', name: 'Bara', fullName: 'AHMAD RAIHAN BATUBARA', age: 17, birthdate: '25 Januari 2009', position: '-', socials: { instagram: 'https://www.instagram.com/ahmd_baraaaa/' } },
  { id: 3, no: '3', name: 'Amanda', fullName: 'AMANDA WIDYA PRAMESTI', age: 18, birthdate: '29 Mei 2008', position: 'Sekretaris', socials: { instagram: 'https://www.instagram.com/amanddaaaaaaaa_/' } },
  { id: 4, no: '4', name: 'Ayesha', fullName: 'AYESHA NADYA AFSARIANA', age: 17, birthdate: '4 Juni 2009', position: 'Wakil Ketua Kelas', socials: { instagram: 'https://www.instagram.com/fleurbunns_dysha/' } },
  { id: 5, no: '5', name: 'Chantika', fullName: 'CHANTIKA OCTAVIANY', age: 18, birthdate: '11 Oktober 2008', position: 'Sekretaris', socials: { instagram: 'https://www.instagram.com/chikaaiu/' } },
  { id: 6, no: '6', name: 'Elsa', fullName: 'ELSA MAYASARI', age: 0, birthdate: '-', position: '-', socials: {} },
  { id: 7, no: '7', name: 'Fajar', fullName: 'FAJAR PERMANA PUTRA', age: 19, birthdate: '27 Maret 2007', position: '-', socials: { instagram: 'https://www.instagram.com/fajaaar.p/' } },
  { id: 8, no: '9', name: 'Gadis', fullName: 'GADIS PUTRI HUDAYA', age: 18, birthdate: '7 Oktober 2008', position: '-', socials: { instagram: 'https://www.instagram.com/gdsptr.r/' } },
  { id: 9, no: '10', name: 'Hafifa', fullName: 'HAFIFA TUNURLIAH', age: 17, birthdate: '8 Januari 2009', position: 'Bendahara', socials: { instagram: 'https://www.instagram.com/htunurliah/' } },
  { id: 10, no: '11', name: 'Ibra', fullName: 'IBRAHIM NAUFHAL', age: 17, birthdate: '29 Juli 2009', position: '-', socials: { instagram: 'https://www.instagram.com/i.naufhall/' } },
  { id: 11, no: '12', name: 'Irsyad', fullName: 'IRSYAD MUSYAFFA', age: 17, birthdate: '20 April 2009', position: '-', photo: require('../../assets/photos/icad.png'), socials: { instagram: 'https://www.instagram.com/cad_affa/' } },
  { id: 12, no: '13', name: 'Ocin', fullName: 'KAFKA NAVIZZA AGUSTIN', age: 18, birthdate: '18 Agustus 2008', position: '-', socials: { instagram: 'https://www.instagram.com/kafkaanvzza/' } },
  { id: 13, no: '14', name: 'Klara', fullName: 'KLARA AYU YUSNIA', age: 17, birthdate: '2 Juli 2009', position: '-', socials: { instagram: 'https://www.instagram.com/klraysnia/' } },
  { id: 14, no: '15', name: 'Mario', fullName: 'MARIO RAMDANI', age: 18, birthdate: '24 Maret 2008', position: '-', socials: { instagram: '@swimmingfoxx_', github: 'Marrwertz', game: 'https://boxsiege.vercel.app' } },
  { id: 15, no: '16', name: 'Fathur', fullName: 'MOCHAMAD FATHURAHMAN', age: 17, birthdate: '14 Mei 2009', position: '-', socials: { instagram: 'https://www.instagram.com/sifthrr/' } },
  { id: 16, no: '17', name: 'Rafa', fullName: 'MOHAMAD RAFA ZAMIZAR', age: 17, birthdate: '12 April 2009', position: '-', socials: {} },
  { id: 17, no: '18', name: 'Prasya', fullName: 'MUHAMAD PRASYA SISWADI', age: 17, birthdate: '29 Mei 2009', position: '-', socials: { instagram: 'https://www.instagram.com/prasyasiswadi/' } },
  { id: 18, no: '19', name: 'Fatih', fullName: 'MUHAMMAD AL FATIH HAIDAR', age: 18, birthdate: '22 Juni 2008', position: 'Ketua Kelas', photo: require('../../assets/photos/paqih.jpg'), socials: { instagram: 'https://www.instagram.com/gevithia/' } },
  { id: 19, no: '20', name: 'Defran', fullName: 'MUHAMMAD DEFRANS ABDULLAH HAJRIN', age: 18, birthdate: '23 November 2008', position: '-', socials: { instagram: 'https://www.instagram.com/mhmaddfrns/' } },
  { id: 20, no: '21', name: 'Mulki', fullName: 'MUHAMMAD MALIKUL MULKI', age: 17, birthdate: '25 April 2009', position: '-', socials: {} },
  { id: 21, no: '22', name: 'Rafa', fullName: 'MUHAMMAD RAFA PRATAMA', age: 17, birthdate: '22 Desember 2009', position: '-', socials: { instagram: 'https://www.instagram.com/prtma_farr/' } },
  { id: 22, no: '23', name: 'Moble', fullName: 'MUHAMMAD RIZKY AKBAR GOZALI', age: 17, birthdate: '28 September 2009', position: '-', socials: { instagram: 'https://www.instagram.com/kyzenn_akbarr/' } },
  { id: 23, no: '25', name: 'Rafi', fullName: 'RAFI ADIYATMA TRI FALAH', age: 17, birthdate: '25 Mei 2009', position: '-', socials: {} },
  { id: 24, no: '26', name: 'Rakas', fullName: "RAKA SYAFA'ATAN", age: 17, birthdate: '30 Agustus 2009', position: '-', socials: { instagram: 'https://www.instagram.com/raka.syfatn/' } },
  { id: 25, no: '27', name: 'Raya', fullName: 'RAYA AHMAD FADILAH', age: 17, birthdate: '12 April 2009', position: '-', socials: { instagram: 'https://www.instagram.com/prcsnue/' } },
  { id: 26, no: '28', name: 'Revan', fullName: 'REVAN DWI ERLANGGA', age: 18, birthdate: '1 Juli 2008', position: '-', photo: require('../../assets/photos/revan.jpeg'), socials: { instagram: 'https://www.instagram.com/revan_erlanggaaa/' } },
  { id: 27, no: '29', name: 'Rizky', fullName: 'RIZKY MAULANA PUTRA', age: 17, birthdate: '06 Maret 2009', position: 'Developer', photo: require('../../assets/photos/rizky.png'), socials: { instagram: '@rzky.mp_36', twitter: '@BadutZYY_', youtube: '@badutzy', github: 'BadutZY', website: 'badutzy.vercel.app', game: 'https://boxsiege.vercel.app' } },
  { id: 28, no: '30', name: 'Sandi', fullName: 'SANDI SANJAYA', age: 17, birthdate: '30 Juni 2009', position: '-', socials: { instagram: 'https://www.instagram.com/5andiajahh/' } },
  { id: 29, no: '31', name: 'Sultan', fullName: 'SULTAN BIMA AGASSI', age: 18, birthdate: '28 November 2008', position: '-', socials: { instagram: 'https://www.instagram.com/bima_______a/' } },
];