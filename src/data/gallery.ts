export interface GalleryImage {
  id: number;
  src: any;
  title: string;
}

export type GalleryGrade = 'XI' | 'XII';

// Kelas 11
export const galleryImagesXI: GalleryImage[] = [
  { id: 1,  src: require('../../assets/gallery/kelas11/hero-class.jpeg'), title: ' ' },
  { id: 2,  src: require('../../assets/gallery/kelas11/batik.jpeg'),      title: ' ' },
  { id: 3,  src: require('../../assets/gallery/kelas11/batik2.jpeg'),     title: ' ' },
  { id: 4,  src: require('../../assets/gallery/kelas11/batik3.jpeg'),     title: ' ' },
  { id: 5,  src: require('../../assets/gallery/kelas11/juara.jpeg'),      title: ' ' },
  { id: 6,  src: require('../../assets/gallery/kelas11/juara2.jpeg'),     title: ' ' },
  { id: 7,  src: require('../../assets/gallery/kelas11/literasi.jpeg'),   title: ' ' },
  { id: 8,  src: require('../../assets/gallery/kelas11/mabar.jpeg'),      title: ' ' },
  { id: 9, src: require('../../assets/gallery/kelas11/ngumpul.jpeg'),    title: ' ' },
  { id: 10, src: require('../../assets/gallery/kelas11/ngumpul2.jpeg'),   title: ' ' },
  { id: 11, src: require('../../assets/gallery/kelas11/ngumpul3.jpeg'),   title: ' ' },
  { id: 12, src: require('../../assets/gallery/kelas11/petugas.jpeg'),    title: ' ' },
  { id: 13, src: require('../../assets/gallery/kelas11/drama1.jpeg'),    title: ' ' },
  { id: 14, src: require('../../assets/gallery/kelas11/drama2.jpeg'),    title: ' ' },
  { id: 15, src: require('../../assets/gallery/kelas11/drama3.jpeg'),    title: ' ' },
  { id: 16, src: require('../../assets/gallery/kera/kera2.jpeg'),    title: ' ' },
  { id: 17, src: require('../../assets/gallery/kera/kera3.jpeg'),    title: ' ' },
  { id: 18, src: require('../../assets/gallery/kera/kera4.jpeg'),    title: ' ' },
  { id: 19, src: require('../../assets/gallery/kera/kera5.jpeg'),    title: ' ' },
  { id: 20, src: require('../../assets/gallery/kera/kera6.jpeg'),    title: ' ' },
];

// Kelas XII
export const galleryImagesXII: GalleryImage[] = [
    { id: 1,  src: require('../../assets/gallery/kelas12/petugas1.jpeg'), title: ' ' },
    { id: 2,  src: require('../../assets/gallery/kelas12/petugas2.jpeg'),      title: ' ' },
    { id: 3,  src: require('../../assets/gallery/kelas12/petugas3.jpeg'),     title: ' ' },
    { id: 4,  src: require('../../assets/gallery/kelas12/petugas4.jpeg'),     title: ' ' },
    { id: 5,  src: require('../../assets/gallery/kelas12/petugas5.jpeg'),      title: ' ' },
    { id: 6,  src: require('../../assets/gallery/kelas12/petugas6.jpeg'),     title: ' ' },
    { id: 7,  src: require('../../assets/gallery/kelas12/petugas7.jpeg'),   title: ' ' },
  ];

export const galleryByGrade: Record<GalleryGrade, GalleryImage[]> = {
  XI: galleryImagesXI,
  XII: galleryImagesXII,
};

// Dipertahankan agar kompatibel dengan kode lain yang mungkin masih memakainya.
export const galleryImages: GalleryImage[] = galleryImagesXI;
export const galleryPreview = galleryImages.slice(0, 6);