export interface GalleryImage {
  id: number;
  src: any;
  title: string;
}

export const galleryImages: GalleryImage[] = [
  { id: 1,  src: require('../../assets/gallery/hero-class.jpeg'), title: ' ' },
  { id: 2,  src: require('../../assets/gallery/batik.jpeg'),      title: ' ' },
  { id: 3,  src: require('../../assets/gallery/batik2.jpeg'),     title: ' ' },
  { id: 4,  src: require('../../assets/gallery/batik3.jpeg'),     title: ' ' },
  { id: 5,  src: require('../../assets/gallery/juara.jpeg'),      title: ' ' },
  { id: 6,  src: require('../../assets/gallery/juara2.jpeg'),     title: ' ' },
  { id: 7,  src: require('../../assets/gallery/literasi.jpeg'),   title: ' ' },
  { id: 9,  src: require('../../assets/gallery/mabar.jpeg'),      title: ' ' },
  { id: 10, src: require('../../assets/gallery/ngumpul.jpeg'),    title: ' ' },
  { id: 11, src: require('../../assets/gallery/ngumpul2.jpeg'),   title: ' ' },
  { id: 12, src: require('../../assets/gallery/ngumpul3.jpeg'),   title: ' ' },
  { id: 13, src: require('../../assets/gallery/petugas.jpeg'),    title: ' ' },
  { id: 14, src: require('../../assets/gallery/drama1.jpeg'),    title: ' ' },
  { id: 16, src: require('../../assets/gallery/drama3.jpeg'),    title: ' ' },
  { id: 15, src: require('../../assets/gallery/drama2.jpeg'),    title: ' ' },
];

export const galleryPreview = galleryImages.slice(0, 6);
