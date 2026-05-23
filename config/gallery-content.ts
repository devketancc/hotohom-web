export type GalleryCategory = 'all' | 'interiors' | 'landscapes' | 'on-the-road' | 'night-camp';

export type GalleryItem = {
  id: string;
  category: Exclude<GalleryCategory, 'all'>;
  title: string;
  location: string;
  image: string;
  aspect: 'tall' | 'wide' | 'square';
};

export const GALLERY_FILTERS: { id: GalleryCategory; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'interiors', label: 'Interiors' },
  { id: 'landscapes', label: 'Landscapes' },
  { id: 'on-the-road', label: 'On the Road' },
  { id: 'night-camp', label: 'Night Camp' },
];

export const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 'g1',
    category: 'interiors',
    title: 'Suite-grade lounge',
    location: 'Viceroy • Rajasthan',
    image:
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1600&auto=format&fit=crop',
    aspect: 'tall',
  },
  {
    id: 'g2',
    category: 'landscapes',
    title: 'Dawn over the ghats',
    location: 'Monarch • Uttarakhand',
    image:
      'https://images.unsplash.com/photo-1470246973918-29a93221c455?q=80&w=1600&auto=format&fit=crop',
    aspect: 'wide',
  },
  {
    id: 'g3',
    category: 'on-the-road',
    title: 'Coastal highway rhythm',
    location: 'Traveller • Goa',
    image:
      'https://images.unsplash.com/photo-1469854523086-cc02fe7d8800?q=80&w=1600&auto=format&fit=crop',
    aspect: 'square',
  },
  {
    id: 'g4',
    category: 'night-camp',
    title: 'Starlit basecamp',
    location: 'Urbania • Spiti',
    image:
      'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=1600&auto=format&fit=crop',
    aspect: 'tall',
  },
  {
    id: 'g5',
    category: 'interiors',
    title: 'Galley at golden hour',
    location: 'Monarch • Himachal',
    image:
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1600&auto=format&fit=crop',
    aspect: 'square',
  },
  {
    id: 'g6',
    category: 'landscapes',
    title: 'Tea-country terraces',
    location: 'Traveller • Munnar',
    image:
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1600&auto=format&fit=crop',
    aspect: 'wide',
  },
  {
    id: 'g7',
    category: 'on-the-road',
    title: 'Family pause at a lookout',
    location: 'Viceroy • Ladakh',
    image:
      'https://images.unsplash.com/photo-1527631746610-bca00a040d60?q=80&w=1600&auto=format&fit=crop',
    aspect: 'tall',
  },
  {
    id: 'g8',
    category: 'night-camp',
    title: 'Firelight and canvas',
    location: 'Urbania • Rann of Kutch',
    image:
      'https://images.unsplash.com/photo-1478131143081-80f7f84bca02?q=80&w=1600&auto=format&fit=crop',
    aspect: 'wide',
  },
  {
    id: 'g9',
    category: 'interiors',
    title: 'Sleep zone, hush-quiet',
    location: 'Traveller • Coorg',
    image:
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=1600&auto=format&fit=crop',
    aspect: 'square',
  },
  {
    id: 'g10',
    category: 'landscapes',
    title: 'Desert geometry',
    location: 'Monarch • Jaisalmer',
    image:
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1600&auto=format&fit=crop',
    aspect: 'tall',
  },
  {
    id: 'g11',
    category: 'on-the-road',
    title: 'Editorial convoy line',
    location: 'Fleet • Western Ghats',
    image:
      'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?q=80&w=1600&auto=format&fit=crop',
    aspect: 'wide',
  },
  {
    id: 'g12',
    category: 'night-camp',
    title: 'Milky way over the ridge',
    location: 'Viceroy • Kinnaur',
    image:
      'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?q=80&w=1600&auto=format&fit=crop',
    aspect: 'square',
  },
];
