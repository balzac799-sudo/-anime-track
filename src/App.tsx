/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { MediaEntry, MediaType, MediaStatus } from './types';
import { INITIAL_MEDIA_ENTRIES, GENRE_CHIPS } from './data';
import StatWidgets from './components/StatWidgets';
import MediaCard from './components/MediaCard';
import MediaDetailModal from './components/MediaDetailModal';
import AddMediaModal from './components/AddMediaModal';
import IdolChatSection from './components/IdolChatSection';
import MeAiPopup from './components/MeAiPopup';
import { 
  Plus, 
  Search, 
  Filter, 
  Tv, 
  BookOpen, 
  TrendingUp, 
  Download, 
  Upload, 
  Sparkles,
  RefreshCw,
  SlidersHorizontal,
  ChevronDown,
  LogOut,
  Info,
  MessageSquare
} from 'lucide-react';

const LOCAL_STORAGE_KEY = 'ANGARAG_ANIME_MANHWA_TRACKS_V1';

export default function App() {
  // --- States ---
  const [entries, setEntries] = useState<MediaEntry[]>([]);
  const [viewMode, setViewMode] = useState<'tracker' | 'idol'>('tracker');
  const [activeTab, setActiveTab] = useState<'all' | 'anime' | 'manhwa'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [genreFilter, setGenreFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'lastUpdated' | 'title' | 'rating' | 'progress'>('lastUpdated');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Modal tracking state
  const [selectedEntry, setSelectedEntry] = useState<MediaEntry | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Load from LocalStorage
  useEffect(() => {
    try {
      const persisted = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (persisted) {
        const parsed = JSON.parse(persisted);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setEntries(parsed);
          return;
        }
      }
      // If none, load the default seed data
      setEntries(INITIAL_MEDIA_ENTRIES);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_MEDIA_ENTRIES));
    } catch (e) {
      console.error('Failed reading localStorage', e);
      setEntries(INITIAL_MEDIA_ENTRIES);
    }
  }, []);

  // Save to LocalStorage helper
  const saveToStorage = (newEntries: MediaEntry[]) => {
    setEntries(newEntries);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newEntries));
    } catch (e) {
      console.error('Failed saving to localStorage', e);
    }
  };

  // --- Handlers ---
  
  // Quick Increment progress (+1 episode/chapter) from the card
  const handleIncrementProgress = (id: string) => {
    const updated = entries.map((entry) => {
      if (entry.id === id) {
        let nextProgress = entry.progress + 1;
        let nextStatus = entry.status;
        
        // Auto mark completed if progress reaches or goes above total
        if (entry.total > 0 && nextProgress >= entry.total) {
          nextProgress = entry.total;
          nextStatus = 'completed';
        }

        showFeedback(`Incremented progress for "${entry.title}"!`);

        return {
          ...entry,
          progress: nextProgress,
          status: nextStatus,
          lastUpdated: new Date().toISOString(),
        };
      }
      return entry;
    });
    saveToStorage(updated);
  };

  // Add new title
  const handleAddNewMedia = (newFields: Omit<MediaEntry, 'id' | 'lastUpdated'>) => {
    const newId = `track-${Date.now()}`;
    const newEntry: MediaEntry = {
      ...newFields,
      id: newId,
      lastUpdated: new Date().toISOString(),
    };

    const updated = [newEntry, ...entries];
    saveToStorage(updated);
    setIsAdding(false);
    showFeedback(`Successfully added "${newEntry.title}"!`);
  };

  // Save changes from details modal edit
  const handleSaveMediaChanges = (updatedEntry: MediaEntry) => {
    const updated = entries.map((entry) => (entry.id === updatedEntry.id ? updatedEntry : entry));
    saveToStorage(updated);
    setSelectedEntry(null);
    showFeedback(`Successfully updated "${updatedEntry.title}"!`);
  };

  // Delete/remove tracking
  const handleDeleteMedia = (id: string) => {
    const updated = entries.filter((entry) => entry.id !== id);
    saveToStorage(updated);
    setSelectedEntry(null);
    showFeedback('Title removed from your collection.');
  };

  // Reset to default seed
  const handleResetToSeeds = () => {
    if (window.confirm('Reset tracker list back to the default Peak Anime & Manhwa titles? This will override local modifications.')) {
      saveToStorage(INITIAL_MEDIA_ENTRIES);
      showFeedback('Restored default boards!');
    }
  };

  // Feedback banner manager
  const showFeedback = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => {
      setFeedbackMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  // Import/Export backup utilities
  const handleExportData = () => {
    const jsonStr = JSON.stringify(entries, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `angarag-anime-manhwa-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showFeedback('Backup data exported successfully!');
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    const files = e.target.files;
    if (!files || files.length === 0) return;

    fileReader.onload = (event) => {
      try {
        const fileContent = event.target?.result as string;
        const parsed = JSON.parse(fileContent);
        if (Array.isArray(parsed)) {
          saveToStorage(parsed);
          showFeedback('Import complete! Tracker database updated.');
        } else {
          alert('Invalid file format. Import must be an array of media entries.');
        }
      } catch (err) {
        alert('Failed to parse backup file.');
      }
    };
    fileReader.readAsText(files[0]);
  };

  // --- Filtering & Sorting Compute ---
  const processedEntries = useMemo(() => {
    let result = [...entries];

    // 1. Type switch tag (all / anime / manhwa)
    if (activeTab !== 'all') {
      result = result.filter((entry) => entry.type === activeTab);
    }

    // 2. Search text match
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (entry) =>
          entry.title.toLowerCase().includes(query) ||
          (entry.authorOrStudio && entry.authorOrStudio.toLowerCase().includes(query)) ||
          entry.genres.some((g) => g.toLowerCase().includes(query))
      );
    }

    // 3. Status filter match
    if (statusFilter !== 'all') {
      if (statusFilter === 'active') {
        result = result.filter((entry) => entry.status === 'watching' || entry.status === 'reading');
      } else {
        result = result.filter((entry) => entry.status === statusFilter);
      }
    }

    // 4. Genre tag matching
    if (genreFilter !== 'All') {
      result = result.filter((entry) =>
        entry.genres.some((g) => g.toLowerCase() === genreFilter.toLowerCase())
      );
    }

    // 5. Sorting routine
    result.sort((a, b) => {
      let valA: any = a[sortBy];
      let valB: any = b[sortBy];

      // fallback checks for strings / numbers
      if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = (valB || '').toLowerCase();
      }

      if (sortBy === 'lastUpdated') {
        valA = new Date(a.lastUpdated).getTime();
        valB = new Date(b.lastUpdated).getTime();
      }

      if (valA < valB) return sortOrder === 'desc' ? 1 : -1;
      if (valA > valB) return sortOrder === 'desc' ? -1 : 1;
      return 0;
    });

    return result;
  }, [entries, activeTab, searchQuery, statusFilter, genreFilter, sortBy, sortOrder]);

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#1A1A1A] font-sans selection:bg-indigo-600 selection:text-white pb-16 relative">
      
      {/* Top Banner Message */}
      {feedbackMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 border-2 border-black bg-[#FDFCFB] text-[#1A1A1A] py-3.5 px-5 shadow-[4px_4px_0px_#000000] font-bold text-xs uppercase tracking-wider font-mono">
          <Sparkles className="h-4.5 w-4.5 text-indigo-600" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* Main navigation / Editorial title bar */}
      <header className="border-b-2 border-neutral-900 bg-[#FDFCFB] sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-widest font-black text-neutral-500 font-mono">Personal Archive // 2026</span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter uppercase leading-none mt-1">
              Angarag-<span className="text-indigo-600">Erdene</span>
            </h1>
          </div>
          <div className="text-left md:text-right w-full md:w-auto">
            <div className="text-xl md:text-2xl font-serif italic text-neutral-800">Curated Progression Tracking</div>
            <div className="flex flex-wrap gap-4 mt-2 justify-start md:justify-end uppercase text-[10px] font-black tracking-widest font-mono text-neutral-600">
              <span className="mr-2">Board Count: <strong className="text-indigo-600 font-extrabold">{entries.length}</strong></span>
              <span>&bull;</span>
              <button onClick={handleExportData} className="text-indigo-600 underline cursor-pointer hover:text-indigo-800 decoration-2">Export Backup</button>
              <span>&bull;</span>
              <label className="cursor-pointer hover:text-indigo-800 text-indigo-600 underline decoration-2">
                Restore File
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportData}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      </header>

      {/* Primary Section Switcher */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="flex border-2 border-black bg-white p-1 shadow-[4px_4px_0px_#000000]">
          <button
            id="nav-view-tracker"
            onClick={() => setViewMode('tracker')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-black uppercase tracking-wider font-mono transition-all cursor-pointer ${
              viewMode === 'tracker'
                ? 'bg-black text-white'
                : 'bg-white text-neutral-600 hover:text-black hover:bg-neutral-50'
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            My Tracking Board
          </button>
          <button
            id="nav-view-idol"
            onClick={() => setViewMode('idol')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-black uppercase tracking-wider font-mono transition-all cursor-pointer relative overflow-hidden ${
              viewMode === 'idol'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-neutral-600 hover:text-indigo-600 hover:bg-neutral-50'
            }`}
          >
            <span>🤖 My Idol</span>
            <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[8px] font-black uppercase px-2 py-1 rotate-12 animate-pulse border border-black shadow-[1px_1px_0px_#000000]">
              Idol Coach
            </span>
          </button>
        </div>
      </div>

      {viewMode === 'tracker' ? (
        <>
          {/* Hero Intro & Quick triggers */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-3 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-black italic font-serif tracking-tight text-[#1A1A1A]">
                Active Progression Logs
              </h2>
              <p className="text-xs text-neutral-600 font-medium font-sans mt-1">
                Personal diary containing detailed reviews, current episode tallies, and completion ratings.
              </p>
            </div>
            
            {/* Actions Row */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                id="reset-seed-btn"
                onClick={handleResetToSeeds}
                className="flex items-center gap-1.5 text-[#1A1A1A] hover:bg-rose-500/10 hover:text-rose-700 px-4 py-2 text-2xs font-bold border-2 border-neutral-300 hover:border-rose-600 transition-all font-mono uppercase cursor-pointer"
                title="Reset storage state back to dynamic defaults"
              >
                <RefreshCw className="h-3 h-3 text-current" />
                Reset Initial Starters
              </button>

              <button
                id="header-add-btn"
                onClick={() => setIsAdding(true)}
                className="flex items-center gap-1.5 bg-black text-white px-5 py-2.5 text-xs font-black uppercase tracking-wider shadow-[4px_4px_0px_#4F46E5] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#4F46E5] transition-all cursor-pointer"
              >
                <Plus className="h-4.5 w-4.5 stroke-[3]" />
                Add To Tracking board
              </button>
            </div>
          </div>

          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
            
            {/* Metric Widgets Dashboard Panel of Tracker */}
            <StatWidgets entries={entries} />

            {/* Categories Tabs & Search controls in heavy Editorial layout */}
            <div className="border-2 border-black bg-[#FDFCFB] p-4 md:p-6 mb-8 shadow-[6px_6px_0px_#000000]">
              
              <div className="flex flex-col gap-5">
                
                {/* Top row: Type Tabs and Search Box */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  
                  {/* Type segment switcher */}
                  <div className="flex bg-[#FDFCFB] p-1 border-2 border-black rounded-none max-w-sm w-full">
                    <button
                      id="tab-all"
                      onClick={() => setActiveTab('all')}
                      className={`flex-1 flex items-center justify-center gap-1 py-2 text-[10px] font-black uppercase tracking-wider font-mono transition-all cursor-pointer ${
                        activeTab === 'all'
                          ? 'bg-black text-white'
                          : 'text-neutral-500 hover:text-black'
                      }`}
                    >
                      All Archive
                    </button>
                    <button
                      id="tab-anime"
                      onClick={() => setActiveTab('anime')}
                      className={`flex-1 flex items-center justify-center gap-1 py-2 text-[10px] font-black uppercase tracking-wider font-mono transition-all cursor-pointer ${
                        activeTab === 'anime'
                          ? 'bg-indigo-600 text-white'
                          : 'text-neutral-500 hover:text-black'
                      }`}
                    >
                      <Tv className="h-3.5 w-3.5" />
                      Anime
                    </button>
                    <button
                      id="tab-manhwa"
                      onClick={() => setActiveTab('manhwa')}
                      className={`flex-1 flex items-center justify-center gap-1 py-2 text-[10px] font-black uppercase tracking-wider font-mono transition-all cursor-pointer ${
                        activeTab === 'manhwa'
                          ? 'bg-black text-white'
                          : 'text-neutral-500 hover:text-black'
                      }`}
                    >
                      <BookOpen className="h-3.5 w-3.5" />
                      Manhwa
                    </button>
                  </div>

                  {/* Dynamic search input box */}
                  <div className="relative flex-1 max-w-full lg:max-w-md">
                    <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-[#1A1A1A]" />
                    <input
                      id="search-input"
                      type="text"
                      placeholder="SEARCH TITLES, GENRES, STUDIOS, CREATORS..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-[#FDFCFB] border-2 border-black font-bold uppercase tracking-wider pl-10 pr-4 py-3 text-xs placeholder-neutral-500 text-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-black rounded-none transition-all"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3.5 top-3.5 text-xs font-black text-neutral-500 hover:text-black"
                      >
                        CLEAR
                      </button>
                    )}
                  </div>

                </div>

                {/* Second row: Status Selector chips & Sort Order selectors */}
                <div className="flex flex-col xl:flex-row xl:items-center justify-between border-t border-black/10 pt-4 gap-4">
                  
                  {/* Status Selectors */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-neutral-400 mr-2 font-mono">
                      CLASSIFY STAT:
                    </span>
                    {[
                      { value: 'all', label: 'ALL ENTRIES' },
                      { value: 'active', label: 'READING & WATCHING' },
                      { value: 'completed', label: 'COMPLETED' },
                      { value: 'on_hold', label: 'ON HOLD' },
                      { value: 'planned', label: 'PENDING QUEUE' }
                    ].map((chip) => {
                      const isActive = statusFilter === chip.value;
                      return (
                        <button
                          key={chip.value}
                          id={`filter-status-${chip.value}`}
                          onClick={() => setStatusFilter(chip.value)}
                          className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider border-2 transition-all cursor-pointer ${
                            isActive
                              ? 'bg-black text-white border-black'
                              : 'bg-[#FDFCFB] border-neutral-300 text-neutral-600 hover:border-black hover:text-black'
                          }`}
                        >
                          {chip.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Sorting Regulation */}
                  <div className="flex flex-wrap items-center gap-4">
                    
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#1A1A1A] font-mono">
                        SORT INDEX:
                      </span>
                      <div className="relative">
                        <select
                          id="sort-select"
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value as any)}
                          className="bg-[#FDFCFB] text-[10px] font-black uppercase tracking-wider rounded-none px-3 py-2 border-2 border-black focus:outline-none appearance-none pr-8 cursor-pointer text-[#1A1A1A] hover:bg-neutral-50"
                        >
                          <option aria-label="Sort by last updated" value="lastUpdated">🕒 Last updated</option>
                          <option aria-label="Sort by title alphabetic" value="title">🔤 Title</option>
                          <option aria-label="Sort by personal rating" value="rating">⭐ Rating score</option>
                          <option aria-label="Sort by progress amount" value="progress">📈 Progress counts</option>
                        </select>
                        <ChevronDown className="h-3 w-3 text-black absolute right-2.5 top-3 pointer-events-none" />
                      </div>
                    </div>

                    {/* Sort Order layout toggler */}
                    <button
                      id="sort-order-toggle"
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                      className="border-2 border-black bg-black text-white py-1.5 px-3 text-[10px] font-black uppercase tracking-wider hover:bg-neutral-850 transition-all cursor-pointer flex items-center gap-1 font-mono"
                    >
                      {sortOrder === 'desc' ? 'DESC // NEWEST' : 'ASC // OLDEST'}
                    </button>

                  </div>

                </div>

                {/* Third row: Genre Filter lists */}
                <div className="flex flex-wrap items-center gap-1 border-t border-black/10 pt-3">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-neutral-400 mr-2 font-mono">
                    GENRES INDEX:
                  </span>
                  <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                    {GENRE_CHIPS.map((genre) => {
                      const isActive = genreFilter === genre;
                      return (
                        <button
                          key={genre}
                          id={`genre-chip-${genre.toLowerCase()}`}
                          onClick={() => setGenreFilter(genre)}
                          className={`px-3 py-1 text-[9px] font-mono font-black uppercase transition-all border-2 cursor-pointer ${
                            isActive
                              ? 'bg-indigo-600 border-indigo-600 text-white'
                              : 'bg-[#FDFCFB] border-neutral-200 text-neutral-500 hover:border-black hover:text-[#1A1A1A]'
                      }`}
                        >
                          {genre}
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>

            </div>

            {/* Display Section of Board Grid */}
            <div className="flex items-center justify-between mb-4 mt-8 pb-2 border-b-2 border-black/15">
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-black uppercase tracking-tighter text-[#1A1A1A]">
                  ARCHIVED INDEX FEED
                </span>
                <span className="text-xs text-neutral-500 font-serif italic">
                  ({processedEntries.length} matching entries)
                </span>
              </div>

              <p className="text-[10px] font-serif italic text-neutral-600 hidden sm:block">
                Angarag-Erdene's Offline Diary Log
              </p>
            </div>

            {processedEntries.length === 0 ? (
              <div className="border-2 border-dashed border-neutral-300 bg-neutral-50/50 p-12 text-center rounded-none my-6">
                <div className="mx-auto flex h-12 w-12 items-center justify-center border-2 border-black bg-black text-white rounded-none">
                  <Filter className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-black uppercase tracking-tight text-sm text-[#1A1A1A]">No matches documented</h3>
                <p className="mt-1 text-xs text-neutral-500 max-w-sm mx-auto font-serif italic">
                  Try adjusting the query, resetting filter chips, or switching category headers.
                </p>
                <div className="mt-5 flex justify-center gap-3">
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setStatusFilter('all');
                      setGenreFilter('All');
                    }}
                    className="border-2 border-black bg-[#FDFCFB] hover:bg-neutral-50 px-4 py-2 text-xs font-bold uppercase cursor-pointer"
                  >
                    Clear all filters
                  </button>
                  <button
                    onClick={() => setIsAdding(true)}
                    className="bg-black text-white px-4 py-2 text-xs font-black uppercase tracking-wider shadow-[4px_4px_0px_#4F46E5] cursor-pointer"
                  >
                    Register entry manually
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {processedEntries.map((entry) => (
                  <MediaCard
                    key={entry.id}
                    entry={entry}
                    onIncrementProgress={handleIncrementProgress}
                    onOpenDetails={(item) => setSelectedEntry(item)}
                    onEdit={(item) => setSelectedEntry(item)}
                  />
                ))}
              </div>
            )}

          </main>
        </>
      ) : (
        <>
          {/* Hero Intro for Idol AI */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-3">
            <h2 className="text-2xl md:text-3xl font-black italic font-serif tracking-tight text-[#1A1A1A]">
              Academy Encounter // Study Lounge
            </h2>
            <p className="text-xs text-neutral-600 font-medium font-sans mt-1">
              Immerse yourself in conversation with the magicless swordsman Will Serfort. Seek polite advice, share your burdens, or listen to his stories.
            </p>
          </div>

          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
            <IdolChatSection />
          </main>
        </>
      )}

      {/* Footer credits and reset links styling */}
      <footer className="border-t-2 border-black py-10 mt-20 bg-neutral-100/40 text-neutral-500 text-center">
        <div className="max-w-7xl mx-auto px-4 text-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[10px] font-black uppercase tracking-widest">
            Last Synchronized // Live // <span className="text-[#1A1A1A]">Angarag-Erdene's Tracker Board</span>
          </p>
          <div className="flex gap-4 text-[10px] font-black uppercase tracking-widest font-mono">
            <button
              onClick={handleExportData}
              className="hover:text-black transition-colors underline cursor-pointer decoration-2"
            >
              Export JSON Backup
            </button>
            <span>&bull;</span>
            <button
              onClick={handleResetToSeeds}
              className="hover:text-rose-600 transition-colors underline cursor-pointer decoration-2"
            >
              Restore Starters
            </button>
          </div>
        </div>
      </footer>

      {/* --- ADD MODAL DIALOG --- */}
      {isAdding && (
        <AddMediaModal
          onClose={() => setIsAdding(false)}
          onAdd={handleAddNewMedia}
        />
      )}

      {/* --- DETAIL MODAL DIALOG ---- */}
      {selectedEntry && (
        <MediaDetailModal
          entry={selectedEntry}
          onClose={() => setSelectedEntry(null)}
          onSave={handleSaveMediaChanges}
          onDelete={handleDeleteMedia}
        />
      )}

      {/* --- FLOATING ME-AI ASSISTANT POPUP --- */}
      <MeAiPopup />

    </div>
  );
}
