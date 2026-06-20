export interface ScheduleItem {
  time: string;
  subject: string;
}

export interface ScheduleDetail {
  subject: string;
  teacher: string;
}

export interface PiketItem {
  fullName: string;
  nickname: string;
}

export const lessonSchedule: Record<string, ScheduleItem[]> = {
  senin: [
    { time: '12:30 - 14:10', subject: 'PBO' },
    { time: '14:10 - 15:50', subject: 'PAI' },
    { time: '15:50 - 16:15', subject: 'Istirahat' },
    { time: '16:15 - 17:15', subject: 'P8' },
  ],
  selasa: [
    { time: '12:30 - 13:40', subject: 'Bahasa Jepang' },
    { time: '13:40 - 14:45', subject: 'Bahasa Inggris' },
    { time: '14:45 - 15:50', subject: 'P8' },
    { time: '15:50 - 16:15', subject: 'Istirahat' },
    { time: '16:15 - 17:15', subject: 'PJOK' },
  ],
  rabu: [
    { time: '12:30 - 13:40', subject: 'Matematika' },
    { time: '13:40 - 14:45', subject: 'PKK' },
    { time: '14:45 - 15:50', subject: 'PWPB' },
    { time: '15:50 - 16:15', subject: 'Istirahat' },
    { time: '16:15 - 17:15', subject: 'PWPB' },
  ],
  kamis: [
    { time: '12:30 - 13:40', subject: 'PKK' },
    { time: '13:40 - 14:45', subject: 'Bahasa Inggris' },
    { time: '14:45 - 15:50', subject: 'Robotik' },
    { time: '15:50 - 16:15', subject: 'Istirahat' },
    { time: '16:15 - 17:15', subject: 'Robotik' },
  ],
  jumat: [
    { time: '13:00 - 13:55', subject: 'PPKN' },
    { time: '13:55 - 15:00', subject: 'Sejarah' },
    { time: '15:00 - 15:20', subject: 'Istirahat' },
    { time: '15:20 - 16:15', subject: 'Bahasa Indonesia' },
    { time: '16:15 - 17:10', subject: 'Matematika' },
  ],
  sabtu: [
    { time: '06:30 - 07:50', subject: 'PPL' },
    { time: '07:50 - 09:10', subject: 'Bahasa Indonesia' },
    { time: '09:10 - 09:30', subject: 'Istirahat' },
    { time: '09:30 - 10:50', subject: 'Basis Data' },
  ],
};

export const scheduleDetails: Record<string, ScheduleDetail[]> = {
  senin: [
    { subject: 'Pemrograman Berorientasi Objek (PBO)', teacher: 'Erwin Hasiholan G, S.Kom. (Pak Erwin)' },
    { subject: 'Pendidikan Agama Islam (PAI)', teacher: 'Abdul Azis, M.Pd. (Pak Azis)' },
    { subject: 'P8', teacher: 'Vera Yuni Astuti, SP., M.I.Kom. (Bu Vera)' },
  ],
  selasa: [
    { subject: 'Bahasa Jepang', teacher: 'R. Radiani Srirestuti Dewi, SS. (Restu Sensei)' },
    { subject: 'Bahasa Inggris', teacher: 'Dara Purwanita, S.Pd. (Miss Dara)' },
    { subject: 'P8', teacher: 'Vera Yuni Astuti, SP., M.I.Kom. (Bu Vera)' },
    { subject: 'Pendidikan Jasmani, Olah Raga & Kesehatan (PJOK)', teacher: 'Tun Utama Putra, S.Pd. (Pak Tun)' },
  ],
  rabu: [
    { subject: 'Matematika', teacher: 'Ari Adithya Chandra, SPi., MM. (Pak Ari)' },
    { subject: 'Produk Kreatif dan Kewirausahaan (PKK)', teacher: 'Widyatama Nur Annisa, S.M. (Bu Ara)' },
    { subject: 'Pemrograman WEB dan Perangkat Bergerak (PWPB)', teacher: 'Richo Santana, S.Kom (Pak Richo)' },
  ],
  kamis: [
    { subject: 'Produk Kreatif dan Kewirausahaan (PKK)', teacher: 'Widyatama Nur Annisa, S.M. (Bu Ara)' },
    { subject: 'Bahasa Inggris', teacher: 'Dara Purwanita, S.Pd. (Miss Dara)' },
    { subject: 'Robotik', teacher: 'Ridwan Halla, S.Kom. (Pak Ridwan)' },
  ],
  jumat: [
    { subject: 'Pendidikan Pancasila dan Kewarganegaraan (PPKN)', teacher: 'Drs.Fuji Marhaen (Pak Fuji)' },
    { subject: 'Sejarah', teacher: 'Dilla Cahya Rosullindha, S.Pd. (Pak Dilla)' },
    { subject: 'Bahasa Indonesia', teacher: 'Nabila Ahmadia Pratama, S.Pd. (Bu Nabila)' },
    { subject: 'Matematika', teacher: 'Ari Adithya Chandra, SPi., MM. (Pak Ari)' },
  ],
  sabtu: [
    { subject: 'Pemodelan Perangkat Lunak (PPL)', teacher: 'Erwin Hasiholan G, S.Kom. (Pak Erwin)' },
    { subject: 'Bahasa Indonesia', teacher: 'Nabila Ahmadia Pratama, S.Pd. (Bu Nabila)' },
    { subject: 'Basis Data', teacher: 'Dian Hardianti, S.Kom. (Bu Dian)' },
  ],
};

export const piketSchedule: Record<string, PiketItem[]> = {
  senin: [
    { fullName: 'ABIYAN ZUL FADLI', nickname: 'Abiyan' },
    { fullName: 'AHMAD RAIHAN BATUBARA', nickname: 'Bara' },
    { fullName: 'CHANTIKA OCTAVIANY', nickname: 'Chantika' },
    { fullName: 'ELSA MAYASARI', nickname: 'Elsa' },
    { fullName: 'FAJAR PERMANA PUTRA', nickname: 'Fajar' },
  ],
  selasa: [
    { fullName: 'AYESHA NADYA AFSARIANA', nickname: 'Ayesha' },
    { fullName: 'IBRAHIM NAUFHAL', nickname: 'Ibra' },
    { fullName: 'KLARA AYU YUSNIA', nickname: 'Klara' },
    { fullName: 'MARIO RAMDANI', nickname: 'Mario' },
  ],
  rabu: [
    { fullName: 'GADIS PUTRI HUDAYA', nickname: 'Gadis' },
    { fullName: 'KAFKA NAVIZZA AGUSTIN', nickname: 'Kafka' },
    { fullName: 'IRSYAD MUSYAFFA', nickname: 'Irsyad' },
    { fullName: 'MOCHAMAD FATHURAHMAN', nickname: 'Fathur' },
    { fullName: 'MOHAMAD RAFA ZAMIZAR', nickname: 'Rafa' },
  ],
  kamis: [
    { fullName: 'AMANDA WIDYA PRAMESTI', nickname: 'Amanda' },
    { fullName: 'MUHAMAD PRASYA SISWADI', nickname: 'Prasya' },
    { fullName: 'MUHAMMAD AL FATIH HAIDAR', nickname: 'Fatih' },
    { fullName: 'MUHAMMAD MALIKUL MULKI', nickname: 'Mulki' },
    { fullName: 'MUHAMMAD RAFA PRATAMA', nickname: 'Rafa' },
  ],
  jumat: [
    { fullName: 'MUHAMMAD RIZKY AKBAR GOZALI', nickname: 'Moble' },
    { fullName: 'RAFI ADIYATMA TRI FALAH', nickname: 'Rafi' },
    { fullName: "RAKA SYAFA'ATAN", nickname: 'Rakas' },
    { fullName: 'SANDI SANJAYA', nickname: 'Sandi' },
    { fullName: 'MUHAMMAD DEFRANS ABDULLAH HAJRIN', nickname: 'Defran' },
  ],
  sabtu: [
    { fullName: 'RAYA AHMAD FADILAH', nickname: 'Raya' },
    { fullName: 'REVAN DWI ERLANGGA', nickname: 'Revan' },
    { fullName: 'RIZKY MAULANA PUTRA', nickname: 'Rizky' },
    { fullName: 'SULTAN BIMA AGASSI', nickname: 'Sultan' },
    { fullName: 'HAFIFA TUNURLIAH', nickname: 'Hafifa' },
  ],
};

export const dayNames = ['senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu'] as const;
export const dayLabels: Record<string, string> = {
  senin: 'Senin',
  selasa: 'Selasa',
  rabu: 'Rabu',
  kamis: 'Kamis',
  jumat: 'Jumat',
  sabtu: 'Sabtu',
};
