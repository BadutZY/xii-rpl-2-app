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
    { time: '06.30 - 08.30', subject: 'Upacara' },
    { time: '08.30 - 10.00', subject: 'Matematika' },
    { time: '10.00 - 10.30', subject: 'Istirahat' },
    { time: '10.30 - 12.00', subject: 'Bahasa Indonesia' },
    { time: '12.00 - 12.30', subject: 'Istirahat' },
    { time: '12.30 - 15.30', subject: 'PWM' },
  ],
  selasa: [
    { time: '06.30 - 07.00', subject: 'Karakter' },
    { time: '07.00 - 08.30', subject: 'Pemrograman GIM' },
    { time: '08.30 - 10.00', subject: 'Bahasa Inggris' },
    { time: '10.00 - 10.30', subject: 'Istirahat' },
    { time: '10.30 - 12.00', subject: 'Bahasa Jepang' },
    { time: '12.00 - 12.30', subject: 'Istirahat' },
    { time: '12.30 - 15.30', subject: 'Robotik' },
  ],
  rabu: [
    { time: '06.30 - 07.00', subject: 'Karakter' },
    { time: '07.00 - 08.30', subject: 'PBO' },
    { time: '08.30 - 10.00', subject: 'Matematika' },
    { time: '10.00 - 10.30', subject: 'Istirahat' },
    { time: '10.30 - 12.00', subject: 'Prakarya' },
    { time: '12.00 - 12.30', subject: 'Istirahat' },
    { time: '12.30 - 15.30', subject: 'PWM' },
  ],
  kamis: [
    { time: '06.30 - 07.00', subject: 'Karakter' },
    { time: '07.00 - 08.30', subject: 'Pendidikan Pancasila' },
    { time: '08.30 - 10.00', subject: 'Bahasa Indonesia' },
    { time: '10.00 - 10.30', subject: 'Istirahat' },
    { time: '10.30 - 12.00', subject: 'Bahasa Inggris' },
    { time: '12.00 - 12.30', subject: 'Istirahat' },
    { time: '12.30 - 15.30', subject: 'PBO' },
  ],
  jumat: [
    { time: '06.30 - 07.00', subject: 'Karakter' },
    { time: '07.00 - 08.20', subject: 'Prakarya' },
    { time: '08.20 - 09.40', subject: 'PABP' },
    { time: '09.40 - 10.00', subject: 'Istirahat' },
    { time: '10.00 - 10.40', subject: 'PABP' },
    { time: '10.40 - 11.20', subject: 'Pemrograman GIM' },
    { time: '11.20 - 13.00', subject: 'Istirahat' },
    { time: '13.00 - 14.30', subject: 'Pemrograman GIM' },
  ],
};

export const scheduleDetails: Record<string, ScheduleDetail[]> = {
  senin: [
    { subject: 'Matematika', teacher: 'Mila Yaelasari, M.Pd' },
    { subject: 'Bahasa Indonesia', teacher: 'Yeni Yuliawati, S.Pd,Gr' },
    { subject: 'Pemrograman Web dan Mobile (PWM)', teacher: 'Richo Santana, S.Kom' },
  ],
  selasa: [
    { subject: 'Pemrograman GIM', teacher: 'Erwin Hasiholan G., S.Kom.' },
    { subject: 'Bahasa Inggris', teacher: 'Dra. Liesye Yulianti' },
    { subject: 'Bahasa Jepang', teacher: 'R. Radiani Srirestuti Dewi, SS,Gr' },
    { subject: 'Robotik', teacher: 'Ridwan Halla, S.Kom,Gr' },
  ],
  rabu: [
    { subject: 'Pemrograman Berorientasi Objek (PBO)', teacher: 'Erwin Hasiholan G., S.Kom.' },
    { subject: 'Matematika', teacher: 'Mila Yaelasari, M.Pd' },
    { subject: 'Kreativitas, Inovasi, dan Kewirausahaan (Prakarya)', teacher: 'Vera Yuni Astuti, SP., M.I.Kom,Gr' },
    { subject: 'Pemrograman Web dan Mobile (PWM)', teacher: 'Richo Santana, S.Kom' },
  ],
  kamis: [
    { subject: 'Pendidikan Pancasila', teacher: 'Agus Tiyono, M.Pd' },
    { subject: 'Bahasa Indonesia', teacher: 'Yeni Yuliawati, S.Pd,Gr' },
    { subject: 'Bahasa Inggris', teacher: 'Dra. Liesye Yulianti' },
    { subject: 'Pemrograman Berorientasi Objek (PBO)', teacher: 'Erwin Hasiholan G., S.Kom.' },
  ],
  jumat: [
    { subject: 'Kreativitas, Inovasi, dan Kewirausahaan (Prakarya)', teacher: 'Vera Yuni Astuti, SP., M.I.Kom,Gr' },
    { subject: 'Pendidikan Agama dan Budi Pekerti (PABP)', teacher: 'Dra. Popon Puspitasar' },
    { subject: 'Pemrograman GIM', teacher: 'Erwin Hasiholan G., S.Kom.' },
  ],
};

export const piketSchedule: Record<string, PiketItem[]> = {
  senin: [
    { fullName: 'IBRAHIM NAUFHAL', nickname: 'Ibra' },
    { fullName: 'RAYA AHMAD FADILAH', nickname: 'Raya' },
    { fullName: 'GADIS PUTRI HUDAYA', nickname: 'Gadis' },
    { fullName: 'MOCHAMAD FATHURAHMAN', nickname: 'Fathur' },
    { fullName: 'IRSYAD MUSYAFFA', nickname: 'Irsyad' },
    { fullName: 'RAFI ADIYATMA TRI FALAH', nickname: 'Rafi' },
  ],
  selasa: [
    { fullName: 'ELSA MAYASARI', nickname: 'Elsa' },
    { fullName: 'FAJAR PERMANA PUTRA', nickname: 'Fajar' },
    { fullName: 'AMANDA WIDYA PRAMESTI', nickname: 'Amanda' },
    { fullName: "RAKA SYAFA'ATAN", nickname: 'Rakas' },
    { fullName: 'REVAN DWI ERLANGGA', nickname: 'Revan' },
    { fullName: 'CHANTIKA OCTAVIANY', nickname: 'Chantika' },
  ],
  rabu: [
    { fullName: 'SULTAN BIMA AGASSI', nickname: 'Sultan' },
    { fullName: 'MUHAMMAD RIZKY AKBAR GOZALI', nickname: 'Moble' },
    { fullName: 'ABIYAN ZUL FADLI', nickname: 'Abiyan' },
    { fullName: 'MUHAMAD PRASYA SISWADI', nickname: 'Prasya' },
    { fullName: 'HAFIFA TUNURLIAH', nickname: 'Hafifa' },
    { fullName: 'RIZKY MAULANA PUTRA', nickname: 'Rizky' },
  ],
  kamis: [
    { fullName: 'MARIO RAMDANI', nickname: 'Mario' },
    { fullName: 'KLARA AYU YUSNIA', nickname: 'Klara' },
    { fullName: 'MUHAMMAD RAFA PRATAMA', nickname: 'Rafa' },
    { fullName: 'MUHAMMAD DEFRANS ABDULLAH HAJRIN', nickname: 'Defran' },
    { fullName: 'MUHAMMAD AL FATIH HAIDAR', nickname: 'Fatih' },
    { fullName: 'KAFKA NAVIZZA AGUSTIN', nickname: 'Kafka' },
  ],
  jumat: [
    { fullName: 'MUHAMMAD MALIKUL MULKI', nickname: 'Mulki' },
    { fullName: 'AYESHA NADYA AFSARIANA', nickname: 'Ayesha' },
    { fullName: 'MOHAMAD RAFA ZAMIZAR', nickname: 'Rafa' },
    { fullName: 'SANDI SANJAYA', nickname: 'Sandi' },
    { fullName: 'AHMAD RAIHAN BATUBARA', nickname: 'Bara' },
  ],
};

export const dayNames = ['senin', 'selasa', 'rabu', 'kamis', 'jumat'] as const;
export const dayLabels: Record<string, string> = {
  senin: 'Senin',
  selasa: 'Selasa',
  rabu: 'Rabu',
  kamis: 'Kamis',
  jumat: 'Jumat',
};