/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MediaEntry } from './types';

export const INITIAL_MEDIA_ENTRIES: MediaEntry[] = [
  {
    id: 'jjk-anime',
    title: 'Jujutsu Kaisen',
    type: 'anime',
    status: 'watching',
    progress: 18,
    total: 24,
    rating: 10,
    reviewText: 'Incredible animation from MAPPA. The domain expansions are visually phenomenal and the choreography is peak action anime. Yuta, Gojo, and Megumi are top tiers!',
    coverUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=600&auto=format&fit=crop', // stylized japanese art/glowing character representation
    genres: ['Action', 'Fantasy', 'Supernatural', 'Shounen'],
    notes: 'Watching Season 2 right now. Shibuya incident arc is breathtaking.',
    lastUpdated: new Date().toISOString(),
    releaseStatus: 'ongoing',
    authorOrStudio: 'MAPPA'
  },
  {
    id: 'solo-leveling-manhwa',
    title: 'Solo Leveling',
    type: 'manhwa',
    status: 'completed',
    progress: 179,
    total: 179,
    rating: 10,
    reviewText: 'The absolute king of system-based manhwa! Sung Jin-woo’s glow up is legendary and the art style by the late DUBU (REDICE Studio) set an entirely new golden standard for vertical-scroll Webtoons. Read it multiple times.',
    coverUrl: 'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=600&auto=format&fit=crop', // neon portal/gate representation
    genres: ['Action', 'Fantasy', 'System', 'Adventure'],
    notes: 'Read the side stories too! Sung Suho sequel is interesting.',
    lastUpdated: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    releaseStatus: 'completed',
    authorOrStudio: 'Chugong & DUBU'
  },
  {
    id: 'orv-manhwa',
    title: "Omniscient Reader's Viewpoint",
    type: 'manhwa',
    status: 'reading',
    progress: 154,
    total: 220,
    rating: 10,
    reviewText: 'The depth of worldbuilding in ORV is staggering. Dokja Kim’s meta-relationship with the "Three Ways to Survive in a Ruined World" novel makes every chapter incredibly smart. High-stakes survival games at their absolute finest!',
    coverUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&auto=format&fit=crop', // sword/constellation dark fantasy vibe
    genres: ['Action', 'Fantasy', 'Psychological', 'Sci-Fi'],
    notes: 'Currently reading the constellation banquet arc. Insanely good pacing.',
    lastUpdated: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    releaseStatus: 'ongoing',
    authorOrStudio: 'singNsong & Sleepy-C'
  },
  {
    id: 'demon-slayer-anime',
    title: 'Demon Slayer: Kimetsu no Yaiba',
    type: 'anime',
    status: 'watching',
    progress: 8,
    total: 11,
    rating: 9,
    reviewText: 'Ufotable is flexing their budget. The Hashira Training Arc is beautiful and setups the Infinity Castle Arc perfectly. The Hinokami Kagura fight scenes remain unmatched in cinematic fluid style.',
    coverUrl: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=600&auto=format&fit=crop', // water swirl neon/sword style
    genres: ['Action', 'Historical', 'Supernatural', 'Shounen'],
    notes: 'Can’t wait for the movie trilogy!',
    lastUpdated: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    releaseStatus: 'ongoing',
    authorOrStudio: 'Ufotable'
  },
  {
    id: 'lookism-manhwa',
    title: 'Lookism',
    type: 'manhwa',
    status: 'reading',
    progress: 412,
    total: 500,
    rating: 8,
    reviewText: 'Started as a slice of life social commentary about lookism in Korea, but shifted into a colossal gang warfare and martial arts epic. The fights are stylized incredibly well and the mystery around the two bodies is deeply engaging.',
    coverUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=600&auto=format&fit=crop', // city night lights martial arts vibe
    genres: ['Action', 'Drama', 'Martial Arts', 'School Life'],
    notes: 'Allied gang vs Workers Arc is crazy. Allied is hype!',
    lastUpdated: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    releaseStatus: 'ongoing',
    authorOrStudio: 'Park Tae-joon'
  },
  {
    id: 'cyberpunk-anime',
    title: 'Cyberpunk: Edgerunners',
    type: 'anime',
    status: 'completed',
    progress: 10,
    total: 10,
    rating: 10,
    reviewText: 'A gut-wrenching masterpiece. Trigger packed so much color, neon violence, and raw emotional power into just 10 episodes. "I Really Want to Stay at Your House" will never sound the same again.',
    coverUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600&auto=format&fit=crop', // tech cyberpunk neon yellow visual
    genres: ['Sci-Fi', 'Action', 'Psychological', 'Tragedy'],
    notes: 'David Martinez is such a compelling protagonist.',
    lastUpdated: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    releaseStatus: 'completed',
    authorOrStudio: 'Trigger'
  },
  {
    id: 'frieren-anime',
    title: "Frieren: Beyond Journey's End",
    type: 'anime',
    status: 'completed',
    progress: 28,
    total: 28,
    rating: 10,
    reviewText: 'An absolute masterpiece of fantasy storytelling. It explores the passage of time, grief, and human connection in a way that is slow, melancholic, yet profoundly beautiful. Madhouse outdid themselves; Evan Call’s soundtrack is pure magic.',
    coverUrl: 'https://images.unsplash.com/photo-1500622240339-1d2df31d10d1?q=80&w=600&auto=format&fit=crop', // beautiful peaceful meadow
    genres: ['Fantasy', 'Adventure', 'Slice of Life', 'Drama'],
    notes: 'A masterpiece through and through. Himmel’s legacy is unforgettable.',
    lastUpdated: new Date().toISOString(),
    releaseStatus: 'completed',
    authorOrStudio: 'Madhouse'
  },
  {
    id: 'tbate-manhwa',
    title: 'The Beginning After The End',
    type: 'manhwa',
    status: 'reading',
    progress: 175,
    total: 250,
    rating: 9,
    reviewText: 'King Grey is reincarnated as Arthur Leywin in a world of magic and monsters. Incredible progression system, high-stakes magical warfare, and spectacular battles. The art evolution over the seasons is breathtaking!',
    coverUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=600&auto=format&fit=crop', // magical energy/glowing forest vibe
    genres: ['Action', 'Fantasy', 'Adventure', 'Isekai'],
    notes: 'Arthur’s training arc in Epheotus is extremely hype!',
    lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    releaseStatus: 'ongoing',
    authorOrStudio: 'TurtleMe & Fuyu'
  },
  {
    id: 'aot-anime',
    title: 'Attack on Titan',
    type: 'anime',
    status: 'completed',
    progress: 89,
    total: 89,
    rating: 10,
    reviewText: 'A modern tragedy and a geopolitical masterpiece. The puzzle pieces that Isayama laid out from episode 1 are mind-blowing once they all click. From the music to the voice acting, this is an era-defining work of art.',
    coverUrl: 'https://images.unsplash.com/photo-1560942485-b2a11cc13456?q=80&w=600&auto=format&fit=crop', // giant wall ruins / red sky vibe
    genres: ['Action', 'Drama', 'Psychological', 'Tragedy'],
    notes: 'The final season chapters are pure peak despair and determination.',
    lastUpdated: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    releaseStatus: 'completed',
    authorOrStudio: 'Wit Studio & MAPPA'
  },
  {
    id: 'windbreaker-manhwa',
    title: 'Wind Breaker',
    type: 'manhwa',
    status: 'reading',
    progress: 450,
    total: 500,
    rating: 9,
    reviewText: 'Who knew street bike racing could be this intense? Jay Jo’s quiet genius paired with the hummingbird crew’s deep bond makes this manhwa an absolute emotional rollercoaster. The sports mechanics are detailed and highly stylized.',
    coverUrl: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?q=80&w=600&auto=format&fit=crop', // custom stylized bicycle theme
    genres: ['Action', 'Sports', 'Drama', 'School Life'],
    notes: 'The racing line choreography and adrenaline-pumping art speed lines are incredible.',
    lastUpdated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    releaseStatus: 'ongoing',
    authorOrStudio: 'Jo Yongseok'
  }
];

export const GENRE_CHIPS = [
  'All',
  'Action',
  'Fantasy',
  'Sci-Fi',
  'Supernatural',
  'System',
  'Shounen',
  'Martial Arts',
  'School Life',
  'Drama',
  'Psychological',
  'Tragedy',
  'Adventure',
  'Slice of Life',
  'Isekai',
  'Sports'
];
