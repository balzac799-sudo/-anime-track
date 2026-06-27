/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { MediaEntry } from '../types';
import { Tv, BookOpen, Star, Plus, Edit2, Calendar, Sparkles } from 'lucide-react';

interface MediaCardProps {
  key?: string;
  entry: MediaEntry;
  onIncrementProgress: (id: string) => void;
  onOpenDetails: (entry: MediaEntry) => void;
  onEdit: (entry: MediaEntry) => void;
}

export default function MediaCard({
  entry,
  onIncrementProgress,
  onOpenDetails,
  onEdit
}: MediaCardProps) {
  const isAnime = entry.type === 'anime';

  // Format percent progress
  const hasTotal = entry.total > 0;
  const progressPercent = hasTotal ? Math.min((entry.progress / entry.total) * 100, 100) : 0;

  // Status mapping to color/text classes
  const statusColors = {
    watching: 'bg-indigo-600 text-white border-black',
    reading: 'bg-emerald-600 text-white border-black',
    completed: 'bg-black text-white border-black',
    on_hold: 'bg-rose-600 text-white border-black',
    planned: 'bg-neutral-200 text-black border-black',
  };

  const statusLabels = {
    watching: 'Watching',
    reading: 'Reading',
    completed: 'Completed',
    on_hold: 'On Hold',
    planned: 'Planned',
  };

  // Human readable date
  const formattedDate = new Date(entry.lastUpdated).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div
      id={`media-card-${entry.id}`}
      className="group flex flex-col justify-between overflow-hidden bg-white border-2 border-black shadow-[4px_4px_0px_#000000] hover:shadow-[6px_6px_0px_#1A1A1A] transition-all duration-200"
    >
      <div>
        {/* Aspect ratio container for visual cover */}
        <div className="relative h-48 w-full overflow-hidden bg-neutral-100 border-b-2 border-black">
          
          <img
            src={entry.coverUrl}
            alt={entry.title}
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-102"
            onError={(e) => {
              // Fallback if image fails to load
              e.currentTarget.src = 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=600&auto=format&fit=crop';
            }}
          />

          {/* Floated Top-Left Media Type Badge */}
          <span className="absolute left-3 top-3 z-20 flex items-center gap-1 bg-black text-white px-2 py-1 text-[9px] font-black uppercase tracking-wider border border-black">
            {isAnime ? (
              <>
                <Tv className="h-3 w-3 text-white" />
                Anime
              </>
            ) : (
              <>
                <BookOpen className="h-3 w-3 text-white" />
                Manhwa
              </>
            )}
          </span>

          {/* Floated Top-Right Status Badge */}
          <span className={`absolute right-3 top-3 z-20 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest border-2 ${statusColors[entry.status]}`}>
            {statusLabels[entry.status]}
          </span>

          {/* Incremental Quick +1 Button overlay */}
          {entry.status !== 'completed' && (
            <button
              id={`inc-${entry.id}`}
              onClick={(e) => {
                e.stopPropagation();
                onIncrementProgress(entry.id);
              }}
              className="absolute bottom-3 right-3 z-20 flex h-8 w-8 items-center justify-center bg-[#FDFCFB] text-black border-2 border-black hover:bg-black hover:text-white transition-all cursor-pointer shadow-[2px_2px_0px_#000000]"
              title={isAnime ? "Increment Episode (+1)" : "Increment Chapter (+1)"}
            >
              <Plus className="h-4.5 w-4.5 stroke-[3]" />
            </button>
          )}

          {/* Quick Edit icon */}
          <button
            id={`edit-shortcut-${entry.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onEdit(entry);
            }}
            className="absolute bottom-3 left-3 z-20 flex h-8 w-8 items-center justify-center bg-[#FDFCFB] text-black border-2 border-black hover:bg-black hover:text-white transition-all cursor-pointer shadow-[2px_2px_0px_#000000]"
            title="Edit Details & Review"
          >
            <Edit2 className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 cursor-pointer" onClick={() => onOpenDetails(entry)}>
          <h3 className="line-clamp-1 text-base font-black uppercase tracking-tight text-[#1A1A1A] group-hover:text-indigo-600 transition-colors">
            {entry.title}
          </h3>

          {entry.authorOrStudio && (
            <p className="mt-0.5 text-[10px] text-neutral-500 font-bold uppercase tracking-wider font-mono">
              {isAnime ? 'Studio:' : 'Creator:'} {entry.authorOrStudio}
            </p>
          )}

          {/* Classification Tags */}
          <div className="mt-2 flex flex-wrap gap-1">
            {entry.genres.slice(0, 3).map((genre, idx) => (
              <span
                key={idx}
                className="border-2 border-neutral-200 bg-[#FDFCFB] px-1.5 py-0.5 text-[9px] font-mono font-black uppercase text-neutral-600"
              >
                {genre}
              </span>
            ))}
          </div>

          {/* Progression Bar Tracker */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-neutral-500 mb-1 font-mono">
              <span>Progress Tracker</span>
              <span className="text-[#1A1A1A] font-bold">
                {entry.progress} {hasTotal ? `/ ${entry.total}` : 'ep/ch'}
                <span className="text-neutral-400 text-[9px] ml-1">
                  {isAnime ? 'EP' : 'CH'}
                </span>
              </span>
            </div>
            
            {hasTotal ? (
              <div className="relative h-2.5 w-full bg-[#FDFCFB] border-2 border-black max-w-full">
                <div
                  className="h-full bg-indigo-600"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            ) : (
              <div className="relative h-2.5 w-full bg-[#FDFCFB] border-2 border-black max-w-full">
                {/* Pulsing infinite/ongoing indicator on the right */}
                <div className="absolute right-0 top-0 bottom-0 flex items-center pr-1.5 z-10">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 animate-ping absolute" />
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-600" />
                </div>
                {/* Partially filled progress display indicating active status */}
                <div
                  className="h-full bg-indigo-600 opacity-50"
                  style={{ width: `${Math.min((entry.progress / 50) * 100, 85)}%` }}
                />
              </div>
            )}
          </div>

          {/* Rating Scale Display */}
          <div className="mt-4 flex items-center justify-between border-t border-black/10 pt-3">
            <div className="flex items-center gap-1 bg-yellow-400/10 border border-yellow-400 px-2 py-0.5">
              <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-600" />
              <span className="text-[10px] font-black text-yellow-800 font-mono">
                {entry.rating > 0 ? `${entry.rating}/10` : 'NOT RATED'}
              </span>
            </div>
            <div className="flex text-neutral-400 text-[10px] items-center gap-1 font-mono uppercase font-bold">
              <Calendar className="h-3 w-3 text-neutral-400" />
              <span>{formattedDate}</span>
            </div>
          </div>

          {/* Personal Review Snippet */}
          {entry.reviewText ? (
            <div className="mt-3.5 border-l-2 border-black pl-3 py-1 text-xs text-neutral-700 italic font-serif leading-relaxed text-left">
              <p className="line-clamp-2">
                "{entry.reviewText}"
              </p>
            </div>
          ) : (
            <div className="mt-3.5 border-2 border-dashed border-neutral-200 p-2 text-[10px] font-black uppercase text-neutral-400 text-center font-mono cursor-pointer hover:border-black hover:text-black transition-colors">
              No detailed review written yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
