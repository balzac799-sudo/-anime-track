/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { MediaEntry } from '../types';
import { Tv, BookOpen, Star, CheckCircle } from 'lucide-react';

interface StatWidgetsProps {
  entries: MediaEntry[];
}

export default function StatWidgets({ entries }: StatWidgetsProps) {
  const animeList = entries.filter((m) => m.type === 'anime');
  const manhwaList = entries.filter((m) => m.type === 'manhwa');

  const totalEpisodes = animeList.reduce((acc, curr) => acc + curr.progress, 0);
  const totalChapters = manhwaList.reduce((acc, curr) => acc + curr.progress, 0);

  const entriesWithRatings = entries.filter((m) => m.rating > 0);
  const avgRating =
    entriesWithRatings.length > 0
      ? (entriesWithRatings.reduce((acc, curr) => acc + curr.rating, 0) / entriesWithRatings.length).toFixed(1)
      : '0.0';

  const completedCount = entries.filter((m) => m.status === 'completed').length;

  const stats = [
    {
      id: 'stat-anime',
      label: 'Anime Tracking',
      value: animeList.length,
      subtext: `${totalEpisodes} eps watched`,
      icon: Tv,
    },
    {
      id: 'stat-manhwa',
      label: 'Manhwa Tracking',
      value: manhwaList.length,
      subtext: `${totalChapters} chaps read`,
      icon: BookOpen,
    },
    {
      id: 'stat-completed',
      label: 'Completed Titles',
      value: completedCount,
      subtext: `${entries.length > 0 ? Math.round((completedCount / entries.length) * 100) : 0}% completion`,
      icon: CheckCircle,
    },
    {
      id: 'stat-rating',
      label: 'Average Score',
      value: `${avgRating}/10`,
      subtext: `From ${entriesWithRatings.length} rated`,
      icon: Star,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
      {stats.map((stat) => {
        const IconComponent = stat.icon;
        return (
          <div
            key={stat.id}
            id={stat.id}
            className="border-2 border-black bg-white p-4 relative shadow-[4px_4px_0px_#000000] col-span-1 transition-all hover:bg-neutral-50"
          >
            <div className="flex items-center justify-between border-b pb-2 border-black/10">
              <span className="text-[10px] font-black tracking-widest text-[#1A1A1A] uppercase font-mono">
                {stat.label}
              </span>
              <IconComponent className="h-4 w-4 text-[#1A1A1A]" />
            </div>
            
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black font-serif italic text-indigo-600 tracking-tight">
                {stat.value}
              </span>
            </div>
            
            <p className="mt-1 text-[11px] font-mono font-bold text-neutral-500 uppercase truncate">
              {stat.subtext}
            </p>
          </div>
        );
      })}
    </div>
  );
}
