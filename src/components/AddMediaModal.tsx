/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MediaEntry, MediaType, MediaStatus } from '../types';
import { X, Plus, Star, Tv, BookOpen } from 'lucide-react';

interface AddMediaModalProps {
  onClose: () => void;
  onAdd: (newEntry: Omit<MediaEntry, 'id' | 'lastUpdated'>) => void;
}

// Beautiful preset cover options to make onboarding delightful without copy-pasting urls!
const COVER_PRESETS = {
  anime: [
    { name: 'Dark Spell Shonen', url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=600' },
    { name: 'Neon Cyberpunk', url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600' },
    { name: 'Neon Sword', url: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=600' },
    { name: 'Traditional Ink', url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=600' },
  ],
  manhwa: [
    { name: 'Blue Portal Gate', url: 'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=600' },
    { name: 'Constellation Sword', url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600' },
    { name: 'Midnight Streets', url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=600' },
    { name: 'Tower Sunset', url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=600' },
  ]
};

export default function AddMediaModal({ onClose, onAdd }: AddMediaModalProps) {
  const [type, setType] = useState<MediaType>('anime');
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState<MediaStatus>('watching'); // default
  const [progress, setProgress] = useState(0);
  const [total, setTotal] = useState(0);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [notes, setNotes] = useState('');
  const [genresText, setGenresText] = useState('');
  const [coverUrl, setCoverUrl] = useState(COVER_PRESETS.anime[0].url);
  const [authorOrStudio, setAuthorOrStudio] = useState('');
  const [releaseStatus, setReleaseStatus] = useState<'ongoing' | 'completed'>('ongoing');

  const handleTypeChange = (newType: MediaType) => {
    setType(newType);
    // Auto sync appropriate default status
    setStatus(newType === 'anime' ? 'watching' : 'reading');
    // Swap default image cover preset
    setCoverUrl(COVER_PRESETS[newType][0].url);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    // Split genres
    const genres = genresText
      .split(',')
      .map((g) => g.trim())
      .filter((g) => g.length > 0);

    onAdd({
      title: title.trim(),
      type,
      status,
      progress: Math.max(0, progress),
      total: Math.max(0, total),
      rating,
      reviewText: reviewText.trim(),
      notes: notes.trim(),
      genres: genres.length > 0 ? genres : [type === 'anime' ? 'Anime' : 'Manhwa'],
      coverUrl: coverUrl.trim() || COVER_PRESETS[type][0].url,
      authorOrStudio: authorOrStudio.trim(),
      releaseStatus
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl border-2 border-black bg-white p-6 shadow-[8px_8px_0px_#000000] max-h-[92vh] overflow-y-auto md:p-8 text-[#1A1A1A]">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 border-2 border-black bg-white p-1.5 text-black hover:bg-neutral-100 transition-colors cursor-pointer"
        >
          <X className="h-4 w-4 stroke-[3]" />
        </button>

        {/* Modal title */}
        <div className="border-b-2 border-black pb-4 pr-12">
          <h2 className="text-xl font-black uppercase tracking-tight text-[#1A1A1A] flex items-center gap-2">
            <Plus className="h-5.5 w-5.5 text-indigo-600 stroke-[3]" />
            Add To Your Tracking Board
          </h2>
          <p className="text-xs text-neutral-500 mt-1 font-serif italic">
            Enter tracking details for your newly discovered anime or manhwa.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
          
          {/* Media Type Switcher */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              id="type-select-anime"
              onClick={() => handleTypeChange('anime')}
              className={`flex items-center justify-center gap-2 border-2 border-black py-3 text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                type === 'anime'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-neutral-500 hover:text-black hover:border-black'
              }`}
            >
              <Tv className="h-4.5 w-4.5" />
              Anime Series
            </button>
            <button
              type="button"
              id="type-select-manhwa"
              onClick={() => handleTypeChange('manhwa')}
              className={`flex items-center justify-center gap-2 border-2 border-black py-3 text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                type === 'manhwa'
                  ? 'bg-black text-white'
                  : 'bg-white text-neutral-500 hover:text-black hover:border-black'
              }`}
            >
              <BookOpen className="h-4.5 w-4.5" />
              Manhwa Webtoon
            </button>
          </div>

          {/* Title & Studio/Author */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block mb-1 font-mono">
                Title <span className="text-rose-600 font-bold">*</span>
              </label>
              <input
                id="add-title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#FDFCFB] border-2 border-black text-xs px-3.5 py-2.5 text-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-black font-bold uppercase tracking-wider"
                placeholder={type === 'anime' ? 'e.g. Jujutsu Kaisen' : 'e.g. Solo Leveling'}
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block mb-1 font-mono">
                {type === 'anime' ? 'Studio' : 'Author or Artist'}
              </label>
              <input
                id="add-author-studio"
                type="text"
                value={authorOrStudio}
                onChange={(e) => setAuthorOrStudio(e.target.value)}
                className="w-full bg-[#FDFCFB] border-2 border-black text-xs px-3.5 py-2.5 text-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-black font-bold uppercase tracking-wider"
                placeholder={type === 'anime' ? 'e.g. MAPPA, Ufotable' : 'e.g. Chugong, DUBU'}
              />
            </div>
          </div>

          {/* Preset Cover Selector */}
          <div>
            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block mb-2 font-mono">
              Preset Cover Theme or Custom URL
            </label>
            <div className="grid grid-cols-4 gap-2 mb-2">
              {COVER_PRESETS[type].map((preset, index) => {
                const isSelected = coverUrl === preset.url;
                return (
                  <button
                    key={index}
                    id={`preset-cover-${index}`}
                    type="button"
                    onClick={() => setCoverUrl(preset.url)}
                    className={`relative aspect-[3/4] overflow-hidden border-2 transition-all cursor-pointer ${
                      isSelected ? 'border-indigo-600 scale-98 shadow-[2px_2px_0px_#1A1A1A]' : 'border-neutral-200 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={preset.url} alt={preset.name} className="h-full w-full object-cover" />
                    <span className="absolute inset-x-0 bottom-0 bg-black/95 py-1 text-[8px] font-black uppercase text-white text-center truncate">
                      {preset.name}
                    </span>
                  </button>
                );
              })}
            </div>
            <input
              id="add-cover-url"
              type="text"
              value={coverUrl}
              onChange={(e) => setCoverUrl(e.target.value)}
              className="w-full bg-[#FDFCFB] border-2 border-black text-xs px-3 py-2 text-neutral-500 font-mono focus:outline-none focus:ring-1 focus:ring-black"
              placeholder="Or paste any custom cover image URL..."
            />
          </div>

          {/* Status & Genres */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block mb-1 font-mono">
                Tracking status
              </label>
              <select
                id="add-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as MediaStatus)}
                className="w-full bg-[#FDFCFB] border-2 border-black text-xs px-3.5 py-2.5 text-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-black font-bold uppercase tracking-wider cursor-pointer"
              >
                {type === 'anime' ? (
                  <>
                    <option value="watching">🍿 WATCHING NOW</option>
                    <option value="completed">🏆 COMPLETED</option>
                    <option value="on_hold">⏳ ON HOLD</option>
                    <option value="planned">📅 PLAN TO WATCH</option>
                  </>
                ) : (
                  <>
                    <option value="reading">📖 READING NOW</option>
                    <option value="completed">🏆 COMPLETED</option>
                    <option value="on_hold">⏳ ON HOLD</option>
                    <option value="planned">📅 PLAN TO READ</option>
                  </>
                )}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block mb-1 font-mono">
                Genres (comma-separated list)
              </label>
              <input
                id="add-genres"
                type="text"
                value={genresText}
                onChange={(e) => setGenresText(e.target.value)}
                className="w-full bg-[#FDFCFB] border-2 border-black text-xs px-3.5 py-2.5 text-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-black font-bold uppercase tracking-wider"
                placeholder="Action, Fantasy, Shounen"
              />
            </div>
          </div>

          {/* Progress Regulment */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t-2 border-black pt-4">
            <div>
              <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block mb-1 font-mono">
                {type === 'anime' ? 'Episodes Climax mt' : 'Chapters Read Tally'}
              </label>
              <input
                id="add-progress"
                type="number"
                min={0}
                value={progress}
                onChange={(e) => setProgress(parseInt(e.target.value) || 0)}
                className="w-full bg-[#FDFCFB] border-2 border-black text-xs px-3.5 py-2.5 text-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-black font-mono font-bold"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block mb-1 font-mono">
                Total Count (0 if Ongoing)
              </label>
              <input
                id="add-total"
                type="number"
                min={0}
                value={total}
                onChange={(e) => setTotal(parseInt(e.target.value) || 0)}
                className="w-full bg-[#FDFCFB] border-2 border-black text-xs px-3.5 py-2.5 text-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-black font-mono font-bold"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block mb-1 font-mono">
                Release Status
              </label>
              <div className="flex h-[42px] border-2 border-black p-0.5 bg-neutral-50 select-none">
                <button
                  type="button"
                  onClick={() => setReleaseStatus('ongoing')}
                  className={`flex-1 text-[9px] font-black uppercase transition-colors cursor-pointer ${
                    releaseStatus === 'ongoing' ? 'bg-black text-white' : 'text-neutral-500 hover:text-black'
                  }`}
                >
                  Ongoing
                </button>
                <button
                  type="button"
                  onClick={() => setReleaseStatus('completed')}
                  className={`flex-1 text-[9px] font-black uppercase transition-colors cursor-pointer ${
                    releaseStatus === 'completed' ? 'bg-black text-white' : 'text-neutral-500 hover:text-black'
                  }`}
                >
                  Completed
                </button>
              </div>
            </div>
          </div>

          {/* Rating Scale Selection */}
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block font-mono">
                Give an Initial Score (1-10)
              </label>
              {rating > 0 && (
                <span className="flex items-center gap-1.5 border-2 border-yellow-500 bg-yellow-400/10 px-2 py-0.5 text-xs font-black text-yellow-800 font-mono text-[10px]">
                  ★ {rating} / 10
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((starValue) => {
                const isActive = starValue <= rating;
                return (
                  <button
                    key={starValue}
                    id={`add-star-${starValue}`}
                    type="button"
                    onClick={() => setRating(starValue === rating ? 0 : starValue)}
                    className={`flex h-9 w-9 items-center justify-center border-2 border-black transition-all text-xs font-bold font-mono cursor-pointer ${
                      isActive
                        ? 'bg-black text-white shadow-[2px_2px_0px_#000000]'
                        : 'bg-[#FDFCFB] text-neutral-500 hover:border-black hover:text-black'
                    }`}
                  >
                    {starValue}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Review Text */}
          <div>
            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block mb-1 font-mono">
              Initial Review / Impressions
            </label>
            <textarea
              id="add-review-text"
              rows={3}
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              className="w-full bg-[#FDFCFB] border-2 border-black text-xs p-3.5 text-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-black font-serif italic leading-relaxed"
              placeholder="What are your thoughts on this title? Favorite arcs, characters..."
            />
          </div>

          {/* Quick Notes */}
          <div>
            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block mb-1 font-mono">
              Private Notes (e.g., current arc name)
            </label>
            <input
              id="add-notes"
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-[#FDFCFB] border-2 border-black text-xs px-3.5 py-2.5 text-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-black font-bold"
              placeholder="e.g. Watch episode 5 on release tomorrow"
            />
          </div>

          {/* Action buttons */}
          <div className="mt-4 flex gap-3 border-t-2 border-black pt-5 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="border-2 border-black bg-white hover:bg-neutral-100 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-black cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="submit-add-media"
              className="flex items-center gap-1.5 bg-black text-white px-6 py-2.5 text-xs font-black uppercase tracking-wider shadow-[4px_4px_0px_#4F46E5] cursor-pointer hover:bg-neutral-900 transition-all active:translate-y-0.5"
            >
              <Plus className="h-4.5 w-4.5 stroke-[3]" />
              Add Tracker Card
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
