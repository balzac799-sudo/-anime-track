/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type MediaType = 'anime' | 'manhwa';

export type MediaStatus = 'watching' | 'reading' | 'completed' | 'on_hold' | 'planned';

export interface MediaEntry {
  id: string;
  title: string;
  type: MediaType;
  status: MediaStatus;
  progress: number; // Current episode (anime) or current chapter (manhwa)
  total: number; // Total episodes/chapters (e.g. 24, 150... use 0 or undefined for ongoing/unknown)
  rating: number; // Rating out of 10
  reviewText: string; // Detailed user review
  coverUrl: string; // URL to cover photo
  genres: string[];
  notes?: string; // Private progress details or quick thoughts
  lastUpdated: string; // UTC ISO String for last change
  releaseStatus: 'ongoing' | 'completed';
  authorOrStudio?: string; // Author for manhwa, Studio for anime
}

export interface ProgressionStats {
  totalAnime: number;
  totalManhwa: number;
  totalEpisodesWatched: number;
  totalChaptersRead: number;
  averageRating: number;
  completedCount: number;
}
