/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Search, Filter, Lock, ArrowUpDown, ChevronLeft, ChevronRight, Sparkles, BookOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

function CustomSelect({ value, onChange, options, placeholder, icon }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = React.useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const selected = options.find((opt) => opt.value === value);

  return (
    <div ref={dropdownRef} className="relative w-full">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-sm bg-brand-white dark:bg-brand-charcoal border border-brand-steel/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-steel text-brand-charcoal dark:text-brand-white transition-all cursor-pointer text-left"
      >
        <span className="truncate flex items-center gap-2 text-brand-charcoal dark:text-brand-white">
          {icon}
          {selected ? selected.label : placeholder}
        </span>
        <svg
          className={`w-4 h-4 ml-2 transition-transform text-brand-steel ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1.5 bg-brand-white dark:bg-brand-midnight border border-brand-steel/20 rounded-xl shadow-xl overflow-hidden max-h-60 overflow-y-auto">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 text-sm transition-colors cursor-pointer block ${
                value === option.value
                  ? 'bg-brand-steel/10 text-brand-ocean dark:text-brand-white font-medium'
                  : 'text-brand-charcoal dark:text-brand-white hover:bg-brand-steel/10'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function PublicLessons({ onNavigate }) {
  const { user, token } = useAuth();
  const { showToast } = useToast();

  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  // Challenge 1 States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTone, setSelectedTone] = useState('');
  const [sortOrder, setSortOrder] = useState('newest'); // or 'favorites'

  // Challenge 3 Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 6;

  // Fetch Lessons on query updates
  const fetchLessons = async () => {
    try {
      setLoading(true);
      
      const queryParams = new URLSearchParams({
        search: searchTerm,
        category: selectedCategory,
        emotionalTone: selectedTone,
        sort: sortOrder,
        page: currentPage.toString(),
        limit: itemsPerPage.toString()
      });

      const response = await fetch(`/api/lessons?${queryParams.toString()}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });

      if (response.ok) {
        const data = await response.json();
        setLessons(data.lessons);
        setTotalPages(data.totalPages || 1);
      } else {
        showToast('Error loading public lessons catalog', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Network error loading wisdom catalog', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLessons();
  }, [searchTerm, selectedCategory, selectedTone, sortOrder, currentPage, token]);

  // Reset page when queries change
  const handleFilterChange = (filterType, value) => {
    setCurrentPage(1);
    if (filterType === 'category') setSelectedCategory(value);
    if (filterType === 'tone') setSelectedTone(value);
    if (filterType === 'sort') setSortOrder(value);
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      setCurrentPage(1);
      fetchLessons();
    }
  };

  const onResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedTone('');
    setSortOrder('newest');
    setCurrentPage(1);
  };

  return (
    <div className="bg-brand-white dark:bg-brand-midnight text-brand-charcoal dark:text-brand-white min-h-screen py-12 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header Title */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-brand-midnight dark:text-white">Browse Public Wisdom</h1>
          <p className="text-sm text-brand-steel max-w-md mx-auto">
            Explore authentic, personal, and peer-reviewed life lessons shared by developers, creators, and professionals worldwide.
          </p>
        </div>

        {/* Challenge 1 Controls Panel (Search, Filter, Sort) */}
        <div className="bg-brand-white dark:bg-brand-charcoal border border-brand-steel/20 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            {/* Search Input */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-brand-steel">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleSearchKeyPress}
                placeholder="Search by title or keyword..."
                className="w-full pl-9 pr-4 py-2.5 text-sm bg-brand-white dark:bg-brand-midnight border border-brand-steel/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-steel transition-all text-brand-charcoal dark:text-brand-white"
              />
            </div>

            {/* Category Filter */}
            <CustomSelect
              value={selectedCategory}
              onChange={(val) => handleFilterChange('category', val)}
              placeholder="All Categories"
              options={[
                { value: "", label: "All Categories" },
                { value: "Personal Growth", label: "Personal Growth" },
                { value: "Career", label: "Career" },
                { value: "Relationships", label: "Relationships" },
                { value: "Mindset", label: "Mindset" },
                { value: "Mistakes Learned", label: "Mistakes Learned" }
              ]}
            />

            {/* Emotional Tone Filter */}
            <CustomSelect
              value={selectedTone}
              onChange={(val) => handleFilterChange('tone', val)}
              placeholder="All Emotional Tones"
              options={[
                { value: "", label: "All Emotional Tones" },
                { value: "Motivational", label: "Motivational" },
                { value: "Sad", label: "Sad" },
                { value: "Realization", label: "Realization" },
                { value: "Gratitude", label: "Gratitude" }
              ]}
            />

            {/* Sort Dropdown */}
            <CustomSelect
              value={sortOrder}
              onChange={(val) => handleFilterChange('sort', val)}
              placeholder="Sort by"
              options={[
                { value: "newest", label: "Sort by: Newest" },
                { value: "favorites", label: "Sort by: Most Saved" }
              ]}
            />

          </div>

          {/* Reset Filters Shortcut */}
          {(searchTerm || selectedCategory || selectedTone || sortOrder !== 'newest') && (
            <div className="flex justify-end">
              <button
                onClick={onResetFilters}
                className="text-xs font-semibold text-rose-500 hover:underline cursor-pointer"
              >
                Clear all active filters & sorting
              </button>
            </div>
          )}
        </div>

        {/* Loading / Empty / Lessons Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-ocean"></div>
          </div>
        ) : lessons.length === 0 ? (
          <div className="bg-brand-white dark:bg-brand-charcoal border border-brand-steel/20 rounded-2xl p-16 text-center space-y-4">
            <p className="text-lg font-bold text-brand-charcoal dark:text-brand-white">No public life lessons found</p>
            <p className="text-sm text-brand-steel max-w-sm mx-auto">
              We couldn't find any lessons matching your exact search keyword or category choices. Try clearing filters or resetting.
            </p>
            <button
              onClick={onResetFilters}
              className="px-5 py-2.5 text-xs font-bold rounded-xl bg-brand-ocean hover:bg-brand-steel text-white cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          /* Cards Grid - Ensuring equal width and height */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {lessons.map((lesson) => {
              // Strict Premium Blur / Gating check
              const isLocked = lesson.isLocked || (lesson.accessLevel === 'Premium' && (!user || (!user.isPremium && user.role !== 'admin')));

              return (
                <div
                  key={lesson.id}
                  className="flex flex-col h-full justify-between bg-brand-white dark:bg-brand-charcoal border border-brand-steel/20 rounded-2xl overflow-hidden shadow-sm relative transition-all hover:shadow-md group"
                >
                  
                  {/* Card Media Header */}
                  <div className="relative w-full h-44 bg-brand-steel/10 dark:bg-brand-midnight overflow-hidden">
                    <img
                      src={lesson.image}
                      alt={lesson.title}
                      referrerPolicy="no-referrer"
                      className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${isLocked ? 'blur-md opacity-40 scale-110' : ''}`}
                    />
                    
                    {/* Category Label Overlay */}
                    <span className="absolute top-4 left-4 px-2.5 py-1 text-[10px] font-bold font-mono uppercase bg-brand-midnight/80 text-white rounded-lg backdrop-blur">
                      {lesson.category}
                    </span>

                    {/* Access level badge */}
                    <span className={`absolute top-4 right-4 inline-flex px-2 py-1 text-[10px] font-bold rounded-lg ${
                      lesson.accessLevel === 'Premium' 
                        ? 'bg-brand-ocean text-white shadow-sm'
                        : 'bg-brand-ocean/85 text-white shadow-sm backdrop-blur'
                    }`}>
                      {lesson.accessLevel === 'Premium' ? 'Premium' : 'Free'}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div className="space-y-3">
                      
                      {/* Tone & Date Row */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold font-sans py-0.5 px-2 bg-brand-steel/10 dark:bg-brand-midnight rounded-md text-brand-charcoal dark:text-brand-steel">
                          {lesson.emotionalTone}
                        </span>
                        <span className="text-[10px] font-mono text-brand-steel">
                          {new Date(lesson.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-md sm:text-lg font-bold font-sans text-brand-midnight dark:text-brand-white leading-snug line-clamp-2">
                        {lesson.title}
                      </h3>

                      {/* Content Preview with blur warning overlay */}
                      <div className="relative flex-1">
                        {isLocked ? (
                          <div className="space-y-2 select-none">
                            <p className="text-xs text-brand-steel line-clamp-2 filter blur-[3px]">
                              This contains the full exclusive tactical framework, executive micro-habits, cognitive restructuring tips, and stoic methodologies.
                            </p>
                            
                            {/* Blur locks panel */}
                            <div className="p-4 rounded-xl bg-brand-steel/10 border border-brand-steel/20 text-center space-y-1.5 z-10 relative">
                              <Lock className="w-5 h-5 text-brand-steel mx-auto animate-pulse" />
                              <p className="text-xs font-bold text-brand-ocean dark:text-brand-steel">Premium Lesson – Upgrade to view</p>
                              <p className="text-[10px] text-brand-steel">Unlock instant visual clarity & tactical blueprints.</p>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-brand-charcoal dark:text-brand-steel line-clamp-3">
                            {lesson.description}
                          </p>
                        )}
                      </div>

                    </div>

                    {/* Footer Author Row */}
                    <div className="mt-6 pt-5 border-t border-brand-steel/10 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img
                          src={lesson.creatorPhoto}
                          alt={lesson.creatorName}
                          referrerPolicy="no-referrer"
                          className="w-8 h-8 rounded-full object-cover border border-brand-steel/20"
                        />
                        <div className="text-xs">
                          <p className="font-bold text-brand-charcoal dark:text-brand-steel truncate max-w-[110px]">{lesson.creatorName}</p>
                          <p className="text-[9.5px] text-brand-steel">Contributor</p>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          if (isLocked) {
                            showToast("Please upgrade to Premium plan to view premium life lessons.", "info");
                            onNavigate('/pricing');
                          } else {
                            onNavigate(`/lessons/${lesson.id}`);
                          }
                        }}
                        className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
                          isLocked 
                            ? 'bg-brand-steel hover:bg-brand-steel/80 text-white shadow-sm shadow-brand-steel/10' 
                            : 'bg-brand-ocean hover:bg-brand-steel text-white shadow-sm shadow-brand-ocean/10'
                        }`}
                      >
                        {isLocked ? 'Unlock Lesson' : 'See Details'}
                      </button>
                    </div>

                  </div>

                </div>
              );
            })}
          </div>
        )}

        {/* Challenge 3 Pagination Toolbar */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-6 border-t border-brand-steel/20">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-xl border border-brand-steel/20 bg-brand-white dark:bg-brand-midnight text-brand-steel hover:bg-brand-steel/10 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            {/* Number buttons list */}
            {Array.from({ length: totalPages }).map((_, idx) => {
              const pageNumber = idx + 1;
              return (
                <button
                  key={pageNumber}
                  onClick={() => setCurrentPage(pageNumber)}
                  className={`px-4 py-2 text-xs font-extrabold font-mono rounded-xl border transition-all cursor-pointer ${
                    currentPage === pageNumber
                      ? 'bg-brand-ocean border-brand-ocean text-white shadow-md shadow-brand-ocean/15'
                      : 'border-brand-steel/20 hover:bg-brand-steel/10 bg-brand-white dark:bg-brand-midnight text-brand-charcoal dark:text-brand-steel'
                  }`}
                >
                  {pageNumber}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-xl border border-brand-steel/20 bg-brand-white dark:bg-brand-midnight text-brand-steel hover:bg-brand-steel/10 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
