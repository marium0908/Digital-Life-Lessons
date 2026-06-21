/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowRight, Star, Heart, Bookmark, ArrowLeftRight, TrendingUp, ShieldCheck, HeartPulse, Trophy } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import BrandLogo from '../components/BrandLogo';

export default function Home({ onNavigate }) {
  const { user, token } = useAuth();
  
  // Carousel state
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [
    {
      title: 'Preserve the Insights You Fight Hard to Learn',
      description: 'Human minds forget critical warnings, breakthroughs, and life principles over time. Digital Life Lessons acts as an external storage engine for your personal wisdom.',
      bg: 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=1600',
      action: 'Share Your Story',
      route: '/dashboard/add-lesson'
    },
    {
      title: 'Accelerate Career Pathways Through Peer Telemetry',
      description: 'Why make every mistake yourself? Learn from professional boundaries set by senior leaders, startup pivots, and communication blueprints shared by the community.',
      bg: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1600',
      action: 'Explore Career Wisdom',
      route: '/public-lessons'
    },
    {
      title: 'Curate a Living Philosophy & Streak',
      description: 'Track your weekly reflection streaks, save favorite guidance from mentors, and contribute to public or premium learning feeds securely.',
      bg: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1600',
      action: 'View All Lessons',
      route: '/public-lessons'
    }
  ];

  // Dynamic state
  const [featured, setFeatured] = useState([]);
  const [topSaves, setTopSaves] = useState([]);
  const [topContributors, setTopContributors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Auto scroll carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  // Fetch sections
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch featured
        const lRes = await fetch('/api/lessons?limit=100');
        if (lRes.ok) {
          const data = await lRes.json();
          const allLessons = data.lessons || [];
          
          // Featured
          const ft = allLessons.filter(l => l.isFeatured);
          setFeatured(ft.length > 0 ? ft.slice(0, 3) : allLessons.slice(0, 3));

          // Most Saved
          const mv = [...allLessons].sort((a, b) => b.savesCount - a.savesCount).slice(0, 3);
          setTopSaves(mv);

          // Compute Top Contributors
          const crCounts = {};
          allLessons.forEach(l => {
            if (!crCounts[l.creatorId]) {
              crCounts[l.creatorId] = { name: l.creatorName, count: 0, photo: l.creatorPhoto };
            }
            crCounts[l.creatorId].count++;
          });
          const contributors = Object.values(crCounts)
            .sort((a, b) => b.count - a.count)
            .slice(0, 4);
          setTopContributors(contributors);
        }
      } catch (e) {
        console.error("Error loading homepage dynamic cards", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  return (
    <div className="bg-brand-white dark:bg-[#011425] text-brand-charcoal dark:text-brand-white min-h-screen transition-colors duration-200">
      
      {/* 1. HERO SLIDER SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="relative w-full h-[520px] bg-[#011425] rounded-3xl overflow-hidden shadow-lg border border-brand-steel/10 dark:border-brand-ocean/10">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.5 } }}
              className="absolute inset-0 w-full h-full"
            >
              {/* Background Image with overlay */}
              <div 
                className="absolute inset-0 bg-cover bg-center animate-pulse-subtle"
                style={{ backgroundImage: `url(${slides[currentSlide].bg})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#011425]/95 via-[#011425]/85 to-transparent dark:from-black/95 dark:via-black/75" />
  
              {/* Slider Content */}
              <div className="absolute inset-0 flex items-center">
                <div className="px-6 sm:px-12 md:px-16 w-full z-10 flex flex-col md:flex-row justify-between items-center gap-12">
                  <motion.div
                    initial={{ y: 40, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="max-w-3xl text-left space-y-6"
                  >
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white font-sans leading-tight">
                      {slides[currentSlide].title}
                    </h1>
                    
                    <p className="text-base sm:text-lg text-brand-steel font-sans leading-relaxed opacity-95">
                      {slides[currentSlide].description}
                    </p>
  
                    <div className="flex flex-wrap gap-3 pt-2">
                      <button
                        onClick={() => onNavigate(slides[currentSlide].route)}
                        className="px-6 py-3 text-sm font-semibold rounded-xl bg-brand-ocean hover:bg-brand-steel text-white shadow-lg shadow-brand-ocean/20 transition-all flex items-center gap-2 cursor-pointer"
                      >
                        {slides[currentSlide].action}
                        <ArrowRight className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onNavigate('/public-lessons')}
                        className="px-6 py-3 text-sm font-semibold rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/10 transition-all cursor-pointer"
                      >
                        Browse Wisdom Archive
                      </button>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
  
          {/* Dots Navigator */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`w-3.5 h-3.5 rounded-full transition-all cursor-pointer ${
                  currentSlide === idx ? 'bg-brand-steel scale-125' : 'bg-white/30 hover:bg-white/55'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 2. FEATURED LIFE LESSONS (Dynamic) */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-brand-ocean dark:text-brand-steel">Curated Wisdom</span>
            <h2 className="text-3xl font-bold tracking-tight text-brand-charcoal dark:text-brand-white font-sans mt-1">
              Featured Lessons
            </h2>
            <p className="text-sm text-brand-steel mt-2">
              Highly impactful lessons nominated by the community and vetted by administrators.
            </p>
          </div>
          <button
            onClick={() => onNavigate('/public-lessons')}
            className="text-sm font-bold text-brand-ocean dark:text-brand-steel inline-flex items-center gap-1.5 hover:underline group cursor-pointer"
          >
            Show public catalog 
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-ocean"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featured.map((lesson) => (
              <motion.div
                key={lesson.id}
                whileHover={{ y: -6 }}
                className="flex flex-col h-full bg-brand-white dark:bg-brand-midnight border border-brand-steel/15 dark:border-brand-ocean/20 rounded-2xl shadow-sm hover:shadow-md transition-all overflow-hidden relative"
              >
                {/* Header Image */}
                <div className="w-full h-48 bg-brand-steel/5 relative overflow-hidden">
                  <img
                    src={lesson.image}
                    alt={lesson.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Category Accent Badge */}
                  <span className="absolute top-4 left-4 inline-flex px-2.5 py-1 text-xs font-mono font-bold rounded-lg bg-brand-midnight/90 text-white backdrop-blur">
                    {lesson.category}
                  </span>

                  {/* Access badge */}
                  <span className={`absolute top-4 right-4 inline-flex px-2.5 py-1 text-xs font-bold rounded-lg ${
                    lesson.accessLevel === 'Premium' 
                      ? 'bg-brand-ocean text-white shadow'
                      : 'bg-brand-ocean/85 text-white backdrop-blur'
                  }`}>
                    {lesson.accessLevel === 'Premium' ? 'Premium' : 'Free'}
                  </span>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-brand-steel/10 text-brand-steel border border-brand-steel/20">
                        {lesson.emotionalTone}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-brand-charcoal dark:text-brand-white leading-snug line-clamp-2">
                      {lesson.title}
                    </h3>

                    <p className="text-sm text-brand-steel opacity-90 line-clamp-3 font-sans">
                      {lesson.description}
                    </p>
                  </div>

                  <div className="pt-6 border-t border-brand-steel/15 dark:border-brand-ocean/10 mt-6 flex items-center justify-between">
                    {/* Author block */}
                    <div className="flex items-center gap-2">
                      <img src={lesson.creatorPhoto} referrerPolicy="no-referrer" className="w-8 h-8 rounded-full object-cover animate-pulse-slow" />
                      <div className="text-xs">
                        <p className="font-bold text-brand-charcoal dark:text-brand-steel">{lesson.creatorName}</p>
                        <p className="text-brand-steel/80 font-mono text-[10px]">{new Date(lesson.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => onNavigate(`/lessons/${lesson.id}`)}
                      className="px-3.5 py-1.5 text-xs font-semibold text-brand-ocean hover:text-brand-steel dark:text-brand-steel dark:hover:text-brand-white rounded-lg cursor-pointer"
                    >
                      See Details
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* 3. WHY LEARNING FROM LIFE MATTERS (Static 4 cards with brand dark theme) */}
      <section className="py-20 bg-[#011425] text-white border-y border-brand-ocean/30 transition-colors duration-250">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-mono font-bold text-brand-steel uppercase tracking-widest px-2.5 py-0.5 bg-brand-steel/15 rounded-full border border-brand-steel/30">
              Why It Matters
            </span>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl font-sans">
              The Lifelong Benefit of Preserving Wisdom
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              People often spend years navigating setbacks, burnout, or breakdowns, only to lose the lesson over time. Preserving structured feedback loop acts as your personal wisdom telemetry.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            
            {/* Cards */}
            <div className="p-6 rounded-2xl bg-brand-midnight/40 border border-brand-ocean/20 hover:bg-brand-midnight/70 hover:border-brand-steel/30 transition-all space-y-4">
              <div className="p-3 bg-brand-steel/10 text-brand-steel rounded-xl w-max">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold font-sans">Cognitive Safety Net</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Log critical insights detailing exactly how a failure transpired. Avoid repeating high-risk oversight cycles again.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-brand-midnight/40 border border-brand-ocean/20 hover:bg-brand-midnight/70 hover:border-brand-steel/30 transition-all space-y-4">
              <div className="p-3 bg-brand-steel/10 text-brand-steel rounded-xl w-max">
                <ArrowLeftRight className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold font-sans">Shared Telemetry</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Benefit directly from pathways and boundary formulas already documented by leaders within your field. Safe-proof pivots.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-brand-midnight/40 border border-brand-ocean/20 hover:bg-brand-midnight/70 hover:border-brand-steel/30 transition-all space-y-4">
              <div className="p-3 bg-brand-steel/10 text-brand-steel rounded-xl w-max">
                <HeartPulse className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold font-sans">Emotional Alignment</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Reflect consciously on gratitude, motivation, realisations, and sadness. Turn chaotic emotion into structured growth inputs.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-brand-midnight/40 border border-brand-ocean/20 hover:bg-brand-midnight/70 hover:border-brand-steel/30 transition-all space-y-4">
              <div className="p-3 bg-brand-steel/10 text-brand-steel rounded-xl w-max">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold font-sans">Structured Streak</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Formulate a daily and weekly ritual to check, review, and organize personal philosophies and career boundaries.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 4. TWO EXTRA DYNAMIC SECTIONS (Top Contributors & Most Saved Lessons) */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Left Column: Top Contributors of the Week (Dynamic) */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 rounded-lg bg-brand-steel/15 text-brand-ocean dark:text-brand-steel">
                <Trophy className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight text-brand-charcoal dark:text-brand-white font-sans">
                  Top Contributors of the Week
                </h2>
                <p className="text-xs text-brand-steel">Creators generating the most active feedback loops recently.</p>
              </div>
            </div>

            {loading ? (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-16 bg-brand-steel/5 rounded-xl" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {topContributors.map((creator, index) => (
                  <motion.div
                    key={creator.name}
                    initial={{ x: -20, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center justify-between p-4 rounded-xl bg-brand-white dark:bg-brand-midnight border border-brand-steel/15 dark:border-brand-ocean/20 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img src={creator.photo} referrerPolicy="no-referrer" className="w-11 h-11 rounded-lg object-cover" />
                        <span className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-brand-ocean text-[10px] text-white flex items-center justify-center font-bold font-mono">
                          {index + 1}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-brand-charcoal dark:text-brand-white">{creator.name}</h4>
                        <p className="text-[10px] font-mono text-brand-steel uppercase">wisdom provider</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <span className="inline-flex px-2 py-0.5 text-xs font-bold font-mono rounded bg-brand-steel/10 dark:bg-brand-ocean/10 border border-brand-steel/15 dark:border-brand-ocean/10 text-brand-ocean dark:text-brand-steel">
                        {creator.count} Lessons Created
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Most Saved / Favorited Lessons (Dynamic) */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 rounded-lg bg-brand-steel/15 text-brand-ocean dark:text-brand-steel">
                <Bookmark className="w-5 h-5 fill-brand-ocean/40 dark:fill-brand-steel/45" />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight text-brand-charcoal dark:text-brand-white font-sans">
                  Most Saved Lessons
                </h2>
                <p className="text-xs text-brand-steel">Highly valuable lessons saved to user personal archives.</p>
              </div>
            </div>

            {loading ? (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-16 bg-brand-steel/5 rounded-xl" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {topSaves.map((lesson, index) => (
                  <motion.div
                    key={lesson.id}
                    initial={{ x: 20, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex justify-between items-center p-4 rounded-xl bg-brand-white dark:bg-brand-midnight border border-brand-steel/15 dark:border-brand-ocean/20 shadow-sm"
                  >
                    <div className="flex-1 min-w-0 pr-4">
                       <div className="flex items-center gap-2 mb-1.5">
                        <span className="inline-flex px-2 py-0.5 text-[9px] font-mono font-bold uppercase rounded bg-brand-steel/10 dark:bg-brand-ocean/15 text-brand-steel border border-brand-steel/15 dark:border-brand-ocean/10">
                          {lesson.category}
                        </span>
                        {lesson.accessLevel === 'Premium' && (
                          <span className="text-[9px] text-brand-ocean dark:text-brand-steel font-bold flex items-center">Premium</span>
                        )}
                      </div>
                      <h4 
                        onClick={() => onNavigate(`/lessons/${lesson.id}`)}
                        className="text-sm font-bold text-brand-charcoal dark:text-brand-white truncate hover:text-brand-ocean hover:underline cursor-pointer"
                      >
                        {lesson.title}
                      </h4>
                      <p className="text-xs text-brand-steel font-mono">By {lesson.creatorName}</p>
                    </div>

                    <div className="shrink-0 flex items-center gap-1 bg-brand-steel/10 text-brand-ocean dark:text-brand-steel px-3 py-1.5 rounded-lg text-xs font-bold font-mono">
                      <Bookmark className="w-3.5 h-3.5 fill-brand-ocean/30 dark:fill-brand-steel/30" />
                      {lesson.savesCount} saves
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

        </div>
      </section>

    </div>
  );
}
