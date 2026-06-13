export type JournalCategory =
  | 'Destinations'
  | 'Travel Tips'
  | 'Caravan Life'
  | 'Community';

export type JournalArticle = {
  id: string;
  category: JournalCategory;
  title: string;
  excerpt: string;
  image: string;
  readTime: string;
  /** ISO date string. */
  date: string;
};

export const JOURNAL_CATEGORIES: JournalCategory[] = [
  'Destinations',
  'Travel Tips',
  'Caravan Life',
  'Community',
];

export const JOURNAL_ARTICLES: JournalArticle[] = [
  {
    id: 'j1',
    category: 'Destinations',
    title: 'The Goa Coast Route: Where the Sea Never Leaves',
    excerpt:
      'Three hundred kilometres of coastline, one road that never quite straightens out, and a horizon that keeps pulling you forward.',
    image:
      'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=1400&auto=format&fit=crop',
    readTime: '6 min',
    date: '2025-01-14',
  },
  {
    id: 'j2',
    category: 'Destinations',
    title: 'Waking Up in Spiti: Life Above 4,000 Metres',
    excerpt:
      'At altitude, everything slows down. Your breath, the traffic, the light. The valley does not rush you.',
    image:
      'https://images.unsplash.com/photo-1598091383021-15ddea10925d?q=80&w=1400&auto=format&fit=crop',
    readTime: '8 min',
    date: '2024-11-28',
  },
  {
    id: 'j3',
    category: 'Travel Tips',
    title: 'How to Pack for a 7-Day Caravan Journey',
    excerpt:
      'Less than you think. More intentionally than you have before. A practical guide from travellers who got it wrong first.',
    image:
      'https://images.unsplash.com/photo-1469854523086-cc02fe7d8800?q=80&w=1400&auto=format&fit=crop',
    readTime: '5 min',
    date: '2024-10-03',
  },
  {
    id: 'j4',
    category: 'Caravan Life',
    title: 'Off-Grid: How the Solar System Works',
    excerpt:
      'The numbers behind the quiet hum of a fully-charged MotoHom caravan at midnight, 80 kilometres from a power socket.',
    image:
      'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?q=80&w=1400&auto=format&fit=crop',
    readTime: '7 min',
    date: '2024-09-17',
  },
  {
    id: 'j5',
    category: 'Travel Tips',
    title: 'The Art of the Slow Drive',
    excerpt:
      'What happens when you stop measuring the journey in kilometres per hour.',
    image:
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1400&auto=format&fit=crop',
    readTime: '4 min',
    date: '2024-08-05',
  },
  {
    id: 'j6',
    category: 'Community',
    title: 'One Sunset, Forty Route Tips: The Community Effect',
    excerpt:
      'How a single photo from a Kerala deck turned into a morning of crowd-sourced detours nobody regretted.',
    image:
      'https://images.unsplash.com/photo-1527631746610-bca00a040d60?q=80&w=1400&auto=format&fit=crop',
    readTime: '5 min',
    date: '2024-07-22',
  },
];
