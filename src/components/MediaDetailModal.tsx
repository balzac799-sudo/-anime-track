/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MediaEntry, MediaStatus, MediaType } from '../types';
import { X, Star, Save, Trash2, Plus, Minus, Tv, BookOpen, AlertTriangle } from 'lucide-react';

interface MediaDetailModalProps {
  entry: MediaEntry;
  onClose: () => void;
  onSave: (updatedEntry: MediaEntry) => void;
  onDelete: (id: string) => void;
}

export default function MediaDetailModal({
  entry,
  onClose,
  onSave,
  onDelete
}: MediaDetailModalProps) {
  const [title, setTitle] = useState(entry.title);
  const [status, setStatus] = useState<MediaStatus>(entry.status);
  const [progress, setProgress] = useState(entry.progress);
  const [total, setTotal] = useState(entry.total);
  const [rating, setRating] = useState(entry.rating);
  const [reviewText, setReviewText] = useState(entry.reviewText);
  const [notes, setNotes] = useState(entry.notes || '');
  const [genresText, setGenresText] = useState(entry.genres.join(', '));
  const [coverUrl, setCoverUrl] = useState(entry.coverUrl);
  const [authorOrStudio, setAuthorOrStudio] = useState(entry.authorOrStudio || '');
  const [releaseStatus, setReleaseStatus] = useState<'ongoing' | 'completed'>(entry.releaseStatus);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isAnime = entry.type === 'anime';

  const handleSave = () => {
    // Validate bounds
    const cleanProgress = Math.max(0, progress);
    const cleanTotal = Math.max(0, total);

    const updatedEntry: MediaEntry = {
      ...entry,
      title: title.trim() || entry.title,
      status,
      progress: cleanProgress,
      total: cleanTotal,
      rating,
      reviewText: reviewText.trim(),
      notes: notes.trim(),
      genres: genresText.split(',').map((g) => g.trim()).filter((g) => g.length > 0),
      coverUrl: coverUrl.trim() || entry.coverUrl,
      authorOrStudio: authorOrStudio.trim(),
      releaseStatus,
      lastUpdated: new Date().toISOString()
    };

    onSave(updatedEntry);
  };

  // Star points render
  const renderStarsSelector = () => {
    return (
      <div className="flex flex-wrap gap-1.5 mt-2">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((starValue) => {
          const isActive = starValue <= rating;
          return (
            <button
              key={starValue}
              id={`star-select-${starValue}`}
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
    );
  };

  const statusOptions: { value: MediaStatus; label: string }[] = isAnime
    ? [
        { value: 'watching', label: 'Watching' },
        { value: 'completed', label: 'Completed' },
        { value: 'on_hold', label: 'On Hold' },
        { value: 'planned', label: 'Plan to Watch' }
      ]
    : [
        { value: 'reading', label: 'Reading' },
        { value: 'completed', label: 'Completed' },
        { value: 'on_hold', label: 'On Hold' },
        { value: 'planned', label: 'Plan to Read' }
      ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl border-2 border-black bg-white p-6 shadow-[8px_8px_0px_#000000] max-h-[90vh] overflow-y-auto md:p-8 text-[#1A1A1A]">
        
        {/* Floating Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 border-2 border-black bg-white p-1.5 text-black hover:bg-neutral-100 transition-colors cursor-pointer"
        >
          <X className="h-4 w-4 stroke-[3]" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b-2 border-black pb-4 pr-12">
          <div className="flex items-center gap-1 bg-black text-white px-2.5 py-1 text-[10px] font-black uppercase tracking-widest font-mono">
            {isAnime ? (
              <>
                <Tv className="h-3.5 w-3.5 text-white" />
                Anime Edit
              </>
            ) : (
              <>
                <BookOpen className="h-3.5 w-3.5 text-white" />
                Manhwa Edit
              </>
            )}
          </div>
          <span className="text-[10px] font-bold text-neutral-400 font-mono">ID: {entry.id}</span>
        </div>

        {/* Content Columns */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Left Column - Image & Quick Meta */}
          <div className="md:col-span-4 flex flex-col gap-4">
            <div className="aspect-[4/5] w-full overflow-hidden border-2 border-black bg-neutral-100">
              <img
                src={coverUrl && coverUrl.trim() !== "" ? coverUrl : null}
                alt={title}
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover animate-fade-in"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=600&auto=format&fit=crop';
                }}
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block mb-1 font-mono">
                Cover Image URL
              </label>
              <input
                id="modal-cover-url"
                type="text"
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                className="w-full bg-[#FDFCFB] border-2 border-black text-xs px-3 py-2 text-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-black font-mono overflow-ellipsis"
                placeholder="https://images.unsplash.com/..."
              />
            </div>

            <div className="border-2 border-black bg-neutral-50 p-4">
              <span className="text-[10px] font-black text-[#1A1A1A] uppercase tracking-widest block mb-2 font-mono">
                Release Status
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setReleaseStatus('ongoing')}
                  className={`flex-1 border-2 py-1.5 text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer ${
                    releaseStatus === 'ongoing'
                      ? 'bg-black text-white border-black'
                      : 'bg-white border-neutral-300 text-neutral-500 hover:text-black hover:border-black'
                  }`}
                >
                  Ongoing
                </button>
                <button
                  type="button"
                  onClick={() => setReleaseStatus('completed')}
                  className={`flex-1 border-2 py-1.5 text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer ${
                    releaseStatus === 'completed'
                      ? 'bg-black text-white border-black'
                      : 'bg-white border-neutral-300 text-neutral-500 hover:text-black hover:border-black'
                  }`}
                >
                  Completed
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Inputs, Progress & Reviews */}
          <div className="md:col-span-8 flex flex-col gap-5">
            
            {/* Title & Author */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block mb-1 font-mono">
                  Title
                </label>
                <input
                  id="modal-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#FDFCFB] border-2 border-black text-xs px-3.5 py-2.5 text-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-black font-bold uppercase tracking-wider"
                  placeholder="e.g. Solo Leveling"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block mb-1 font-mono">
                  {isAnime ? 'Studio' : 'Author'}
                </label>
                <input
                  id="modal-author-studio"
                  type="text"
                  value={authorOrStudio}
                  onChange={(e) => setAuthorOrStudio(e.target.value)}
                  className="w-full bg-[#FDFCFB] border-2 border-black text-xs px-3.5 py-2.5 text-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-black font-bold uppercase tracking-wider"
                  placeholder={isAnime ? 'e.g. MAPPA, ufotable' : 'e.g. Chugong, SIU'}
                />
              </div>
            </div>

            {/* Status & Genres */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block mb-1 font-mono">
                  Tracking Status
                </label>
                <select
                  id="modal-status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as MediaStatus)}
                  className="w-full bg-[#FDFCFB] border-2 border-black text-xs px-3.5 py-2.5 text-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-black select-none font-bold uppercase tracking-wider cursor-pointer"
                >
                  {statusOptions.map((opt) => (
                    <option key={opt.value} aria-label={opt.label} value={opt.value}>
                      {opt.label.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block mb-1 font-mono">
                  Genres (comma-separated)
                </label>
                <input
                  id="modal-genres"
                  type="text"
                  value={genresText}
                  onChange={(e) => setGenresText(e.target.value)}
                  className="w-full bg-[#FDFCFB] border-2 border-black text-xs px-3.5 py-2.5 text-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-black font-bold uppercase tracking-wider"
                  placeholder="Action, Fantasy, Drama"
                />
              </div>
            </div>

            {/* Progression Bar Regulation */}
            <div className="border-2 border-black bg-neutral-50 p-4">
              <span className="text-[10px] font-black text-[#1A1A1A] uppercase tracking-widest block mb-3 font-mono">
                Tracking Progress ({isAnime ? 'Episodes' : 'Chapters'})
              </span>
              <div className="flex flex-col md:flex-row gap-4 items-center">
                
                {/* Current Ep/Ch Regulator */}
                <div className="flex-1 w-full">
                  <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block mb-1 font-mono">Current Progress</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setProgress(Math.max(0, progress - 1))}
                      className="flex h-10 w-10 items-center justify-center border-2 border-black bg-white text-black hover:bg-neutral-100 cursor-pointer"
                    >
                      <Minus className="h-4 w-4 stroke-[3]" />
                    </button>
                    <input
                      id="modal-progress-val"
                      type="number"
                      value={progress}
                      onChange={(e) => setProgress(parseInt(e.target.value) || 0)}
                      className="flex-1 text-center font-mono font-black text-sm bg-white border-2 border-black h-10 text-black focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setProgress(progress + 1)}
                      className="flex h-10 w-10 items-center justify-center border-2 border-black bg-white text-black hover:bg-neutral-100 cursor-pointer"
                    >
                      <Plus className="h-4 w-4 stroke-[3]" />
                    </button>
                  </div>
                </div>

                {/* Total Ep/Ch Regulator */}
                <div className="flex-1 w-full">
                  <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block mb-1 font-mono">Total Limit</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setTotal(Math.max(0, total - 1))}
                      className="flex h-10 w-10 items-center justify-center border-2 border-black bg-white text-black hover:bg-neutral-100 cursor-pointer"
                    >
                      <Minus className="h-4 w-4 stroke-[3]" />
                    </button>
                    <input
                      id="modal-total-val"
                      type="number"
                      value={total}
                      onChange={(e) => setTotal(parseInt(e.target.value) || 0)}
                      className="flex-1 text-center font-mono font-black text-sm bg-white border-2 border-black h-10 text-black focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setTotal(total + 1)}
                      className="flex h-10 w-10 items-center justify-center border-2 border-black bg-white text-black hover:bg-neutral-100 cursor-pointer"
                    >
                      <Plus className="h-4 w-4 stroke-[3]" />
                    </button>
                  </div>
                </div>

              </div>
            </div>

            {/* Personal Rating Scale (1-10 Slider or Stars) */}
            <div>
              <div className="flex items-center gap-2">
                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block font-mono">
                  Assign Personal Score (1-10)
                </label>
                {rating > 0 && (
                  <span className="flex items-center gap-1 px-2 py-0.5 border-2 border-yellow-500 bg-yellow-400/10 text-xs font-black text-yellow-800 font-mono text-[10px]">
                    ★ {rating} / 10
                  </span>
                )}
              </div>
              {renderStarsSelector()}
            </div>

            {/* Detailed Written Review */}
            <div>
              <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block mb-1 font-mono">
                Personal Review & Impression
              </label>
              <textarea
                id="modal-review-text"
                rows={4}
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                className="w-full bg-[#FDFCFB] border-2 border-black text-xs p-3.5 text-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-black font-serif italic leading-relaxed"
                placeholder="Write your thoughts, critical critiques, reviews, or character highlights in detailed paragraph form..."
              />
            </div>

            {/* Extra private progress details / notes */}
            <div>
              <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block mb-1 font-mono">
                Quick Editorial Reminders
              </label>
              <input
                id="modal-notes"
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-[#FDFCFB] border-2 border-black text-xs px-3.5 py-2.5 text-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-black font-medium"
                placeholder="e.g. Schedule reading of chapter 180 on release hours..."
              />
            </div>

          </div>

        </div>

        {/* Action Buttons footer */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-between items-center border-t-2 border-black pt-5">
          <div>
            {!showDeleteConfirm ? (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-1 px-4 py-2 text-[10px] font-black uppercase tracking-wider text-rose-700 hover:text-white border-2 border-rose-600 hover:bg-rose-600 transition-colors font-mono cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Remove title entry
              </button>
            ) : (
              <div className="flex items-center gap-2 border-2 border-rose-600 bg-rose-50/50 p-1.5 font-mono">
                <span className="text-[10px] font-black uppercase text-rose-700 px-1 flex items-center gap-1">
                  <AlertTriangle className="h-3.5 w-3.5 animate-pulse" />
                  Are you absolutely sure?
                </span>
                <button
                  type="button"
                  onClick={() => onDelete(entry.id)}
                  className="bg-rose-600 hover:bg-rose-700 px-2.5 py-1 text-[10px] font-black uppercase text-white cursor-pointer"
                >
                  Confirm Delete
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="bg-white border-2 border-black hover:bg-neutral-100 px-2.5 py-1 text-[10px] font-black uppercase text-black cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          <div className="flex gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial border-2 border-black bg-white hover:bg-neutral-100 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-black cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-black text-white px-6 py-2.5 text-xs font-black uppercase tracking-wider shadow-[4px_4px_0px_#4F46E5] cursor-pointer hover:bg-neutral-900 transition-all active:translate-y-0.5"
            >
              <Save className="h-4 w-4" />
              Commit Updates
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
