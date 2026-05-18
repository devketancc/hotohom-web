export type CommunityStat = {
  value: string;
  label: string;
};

export type CommunityStory = {
  id: string;
  name: string;
  handle: string;
  location: string;
  trip: string;
  quote: string;
  image: string;
  likes: number;
};

export type CommunityMoment = {
  id: string;
  caption: string;
  author: string;
  image: string;
};

export const COMMUNITY_STATS: CommunityStat[] = [
  { value: '5,000+', label: 'Explorers' },
  { value: '4.9', label: 'Avg. rating' },
  { value: '12k+', label: 'Photos shared' },
  { value: '48', label: 'Hub cities' },
];

export const FEATURED_STORIES: CommunityStory[] = [
  {
    id: 's1',
    name: 'Julian Marc',
    handle: '@julian_on_road',
    location: 'Goa',
    trip: "Coastal Expedition '23",
    quote:
      'The booking experience was as premium as the caravan itself. Motohom thought of everything—from the solar-powered coffee machine to the pre-loaded offline maps.',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuC_kSJthIm3KhnzCDn-Tchbac-1-Rq51mGTCbfgLCVECw1GbHHy-StDnFQZHJeSWVlidXK0ERLuozhnKRfsvwq_OmFXkRMTrw6iTsthWeUhYEK1XFRV5n7xuWvKjfzDJOBDOvRydPpNpg8Ccm5NnypXGxSol0sxJcY1cWrIpacVHxB-wr4SxbbKZZsxMgjIl9sJWCJJfdAUkcEMcFkmqNY1tnJqr0bUh6joUS_Wnf1iKGkJ2UfZ1JYFA8NvJfhYLBg1qR6Q3B79aQw',
    likes: 284,
  },
  {
    id: 's2',
    name: 'Elena Rodriguez',
    handle: '@elena_himalaya',
    location: 'Himachal',
    trip: "Mountain Trek '24",
    quote:
      "Traveling with our golden retriever used to be a challenge. Motohom's pet-friendly caravan made our Himalayan trip absolutely seamless.",
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDPiEwQjKnD3ndczUcWxQxmqkgTGDG3spaC6sHD5rzXarubjv-uXVRkeM0cq0QHt3sTZgFlREZZ8elkp_ZXD7ap0mGCpZqVgcKHVAq9_tJ-6n00euxZWFUcEH8W7EhGkEZw3kXJlIQG8RA3XQkaB1rcagodDf0dBLnaNdp06L6xwZ2bZgPx4UsBIgfFCg8uiacvf42f-x9QfNRdjkHAK4b1nZ_CXv1K6nfdnxkMnwXgbCCcrOm-fmElZvEdQBcqsLhQTK4lLxmQEQo',
    likes: 412,
  },
  {
    id: 's3',
    name: 'Arjun & Meera',
    handle: '@two_lanes_india',
    location: 'Kerala',
    trip: 'Backwater Loop',
    quote:
      'We posted one sunset from the deck and the community flooded us with route tips for the next morning. That is the Motohom difference.',
    image:
      'https://images.unsplash.com/photo-1527631746610-bca00a040d60?q=80&w=800&auto=format&fit=crop',
    likes: 198,
  },
];

export const RECENT_MOMENTS: CommunityMoment[] = [
  {
    id: 'm1',
    caption: 'First light, first coffee — deck ritual.',
    author: 'Priya K.',
    image:
      'https://images.unsplash.com/photo-1470246973918-29a93221c455?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'm2',
    caption: 'Urbania parked where the road ends.',
    author: 'Rohan S.',
    image:
      'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'm3',
    caption: 'Monarch interior — magazine-worthy.',
    author: 'Sana M.',
    image:
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'm4',
    caption: 'Kids claimed the lounge. Parents claimed the view.',
    author: 'Dev P.',
    image:
      'https://images.unsplash.com/photo-1469854523086-cc02fe7d8800?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'm5',
    caption: 'Spiti night — no filter needed.',
    author: 'Kavya R.',
    image:
      'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'm6',
    caption: 'Golden hour convoy on the ghats.',
    author: 'Motohom Crew',
    image:
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=600&auto=format&fit=crop',
  },
];
