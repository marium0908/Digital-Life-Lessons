/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Heart, Bookmark, AlertTriangle, Clock, Calendar, Shield, Share2, CornerDownRight, ThumbsUp, Send, Lock, Eye } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function LessonDetails({ lessonId, onNavigate, onSelectAuthorEmail }) {
  const { user, token } = useAuth();
  const { showToast } = useToast();

  const [lesson, setLesson] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [comments, setComments] = useState([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [loading, setLoading] = useState(true);
  const [isLocked, setIsLocked] = useState(false);

  // States for user interactions
  const [liked, setLiked] = useState(false);
  const [favorited, setFavorited] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [savesCount, setSavesCount] = useState(0);

  // Report Popup state
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('Inappropriate content / language');

  // State for share copy indicator
  const [shareCopied, setShareCopied] = useState(false);

  // Random static views block
  const [viewsCount] = useState(() => Math.floor(Math.random() * 8500) + 1200);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const headersObj = token ? { 'Authorization': `Bearer ${token}` } : {};
      const res = await fetch(`/api/lessons/${lessonId}`, { headers: headersObj });
      const data = await res.json();

      if (!res.ok) {
        showToast(data.error || 'Failed to fetch details', 'error');
        setIsLocked(true);
        return;
      }

      if (data.locked) {
        setIsLocked(true);
        setLesson(data.lesson);
      } else {
        setLesson(data.lesson);
        setRecommendations(data.recommendations || []);
        setIsLocked(false);
        setLikesCount(data.lesson.likesCount);
        setSavesCount(data.lesson.savesCount);
        setLiked(user ? data.lesson.likes.includes(user.id) : false);

        // Fetch favorites to set toggle state
        if (user && token) {
          const favsRes = await fetch('/api/favorites', { headers: { 'Authorization': `Bearer ${token}` } });
          const favsData = await favsRes.json();
          if (favsRes.ok && favsData.favorites) {
            const isFav = favsData.favorites.some((f) => f.id === lessonId);
            setFavorited(isFav);
          }
        }
      }

      // Fetch comments
      const commentsRes = await fetch(`/api/lessons/${lessonId}/comments`);
      if (commentsRes.ok) {
        const commentsData = await commentsRes.json();
        setComments(commentsData.comments || []);
      }

    } catch (err) {
      console.error(err);
      showToast('Error loading details layout', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [lessonId, token, user?.id]);

  // Reading Time calculation
  const getReadingTime = (text) => {
    const words = text ? text.split(/\s+/).length : 0;
    const time = Math.max(1, Math.ceil(words / 180));
    return `${time} min read`;
  };

  const safeFormatDate = (dateVal) => {
    if (!dateVal) return 'N/A';
    const parsed = new Date(dateVal);
    return isNaN(parsed.getTime()) ? 'N/A' : parsed.toLocaleDateString();
  };

  // Like Operation (Toggle, no reload!)
  const handleLikeToggle = async () => {
    if (!user || !token) {
      showToast('Please sign in to react to this lesson', 'info');
      onNavigate('/login');
      return;
    }

    if (isLocked) {
      showToast('Upgrade to Premium to interact with premium wisdom.', 'info');
      onNavigate('/pricing');
      return;
    }

    try {
      const res = await fetch(`/api/lessons/${lessonId}/like`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setLiked(data.liked);
        setLikesCount(data.likesCount);
        showToast(data.liked ? 'Added reaction' : 'Removed reaction', 'success');
      } else {
        showToast(data.error || 'Failed to like', 'error');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Favorite Operation
  const handleFavoriteToggle = async () => {
    if (!user || !token) {
      showToast('Please sign in to save elements', 'info');
      onNavigate('/login');
      return;
    }

    if (isLocked) {
      showToast('Upgrade to Premium to save premium wisdom.', 'info');
      onNavigate('/pricing');
      return;
    }

    try {
      const res = await fetch(`/api/lessons/${lessonId}/favorite`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setFavorited(data.favorited);
        setSavesCount(data.savesCount);
        showToast(data.favorited ? 'Saved to Favorites' : 'Removed from Favorites', 'success');
      } else {
        showToast(data.error || 'Failed to save', 'error');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Create report entry
  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!user || !token) {
      showToast('Please sign in to file reports', 'info');
      return;
    }

    try {
      const res = await fetch(`/api/lessons/${lessonId}/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reason: reportReason })
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message, 'success');
        setReportModalOpen(false);
      } else {
        showToast(data.error || 'Report submission failed', 'error');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Comment submit
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!user || !token) {
      showToast('Please log in to leave your feedback.', 'info');
      onNavigate('/login');
      return;
    }

    if (!newCommentText.trim()) return;

    try {
      const res = await fetch(`/api/lessons/${lessonId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text: newCommentText })
      });
      const data = await res.json();
      if (res.ok) {
        setComments(prev => [data.comment, ...prev]);
        setNewCommentText('');
        showToast('Comment published!', 'success');
      } else {
        showToast(data.error || 'Feedback submission failed', 'error');
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-40 bg-slate-50 dark:bg-[#011425] min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-steel"></div>
      </div>
    );
  }

  // Redirect / blur check
  if (!lesson) {
    return (
      <div className="bg-slate-50 dark:bg-[#011425] text-slate-800 dark:text-zinc-100 min-h-screen py-16 flex items-center justify-center">
        <div className="max-w-md text-center p-8 bg-white dark:bg-brand-midnight border border-slate-100 dark:border-brand-ocean/20 rounded-3xl shadow-lg space-y-4">
          <p className="text-slate-400">Lesson not found or failed to load.</p>
          <button
            onClick={() => onNavigate('/public-lessons')}
            className="px-5 py-2.5 text-xs font-bold bg-brand-ocean text-white rounded-xl shadow cursor-pointer"
          >
            Back to Catalog
          </button>
        </div>
      </div>
    );
  }

  // Handle Share link generation & dynamic clipboard feedback
  const handleShareClick = () => {
    try {
      const shareUrl = `${window.location.origin}/lessons/${lessonId}`;
      navigator.clipboard.writeText(shareUrl);
      setShareCopied(true);
      showToast('Master direct link copied to clipboard!', 'success');
      setTimeout(() => setShareCopied(false), 2000);
    } catch (err) {
      showToast('Could not auto-copy. Please share the URL from your web browser.', 'info');
    }
  };

  return (
    <div className="bg-slate-50 dark:bg-[#011425] text-slate-800 dark:text-zinc-100 min-h-screen py-12 transition-colors duration-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Banner with controls */}
        <div className="bg-white dark:bg-brand-midnight border border-slate-100 dark:border-brand-ocean/20 rounded-3xl overflow-hidden shadow-sm">
          
          {/* Main Cover Image */}
          {lesson.image && (
            <div className="w-full h-80 relative">
              <img
                src={lesson.image}
                alt={lesson.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 to-transparent" />
            </div>
          )}

          {/* Heading Description */}
          <div className="p-8 sm:p-10 space-y-6">
            
            {/* Tone Card Overlay */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 text-xs font-mono font-bold bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded-md">
                  {lesson.category}
                </span>
                <span className="px-3 py-1 text-xs font-bold bg-brand-steel/10 text-brand-ocean dark:bg-brand-ocean/25 dark:text-[#8BA3AC] rounded-md">
                  {lesson.emotionalTone}
                </span>
              </div>
              <span className="text-xs text-slate-400 font-mono flex items-center gap-1.5 bg-slate-50 dark:bg-brand-midnight dark:border dark:border-brand-ocean/20 px-3 py-1 rounded-md">
                <Clock className="w-3.5 h-3.5" />
                {getReadingTime(lesson.description)}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3.5xl font-extrabold tracking-tight leading-snug">
              {lesson.title}
            </h1>

            {/* Content narrative body + Conditional Blurred paywall overlay */}
            <div className="relative">
              {isLocked ? (
                <div className="space-y-6">
                  {/* Truncated non-sensitive preview description */}
                  <div className="text-base sm:text-lg text-slate-500 dark:text-zinc-400 font-serif leading-relaxed line-clamp-2 select-none pointer-events-none opacity-80 italic">
                    "{lesson.description}"
                  </div>

                  {/* Aesthetic mock blurred narrative paragraphs to represent premium depth */}
                  <div className="text-base sm:text-lg text-slate-400/30 dark:text-zinc-650/30 font-serif leading-relaxed space-y-4 blur-[5px] select-none pointer-events-none unselectable">
                    <p>To implement this transformative routine overnight, you must first design a resilient isolation quadrant. Analyze the immediate catalyst of the dynamic conflict and identify which of your core values are experiencing operational tension...</p>
                    <p>Furthermore, standard wisdom suggested that establishing regular micro reflective cycles during weekends acts as a powerful amplifier for overall mental telemetry...</p>
                  </div>

                  {/* Premium Paywall action interface */}
                  <div className="p-6 sm:p-8 bg-gradient-to-br from-brand-ocean/15 via-brand-ocean/5 to-transparent border border-brand-ocean/20 dark:border-brand-ocean/30 rounded-2xl text-center space-y-4 shadow-sm relative overflow-hidden backdrop-blur-xs">
                    <div className="p-3 bg-brand-ocean/20 text-brand-ocean dark:text-brand-steel rounded-full w-max mx-auto shadow-md">
                      <Shield className="w-8 h-8 animate-pulse" />
                    </div>
                    <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                      Premium Lesson Locked – Upgrade to View
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-zinc-400 max-w-md mx-auto leading-relaxed">
                      Unlock instant lifetime master access to tactical mental blueprints, real-world case studies, and career workflows designed by top verified contributors.
                    </p>
                    <div className="inline-block px-4 py-2 bg-brand-ocean/10 border border-brand-ocean/20 dark:border-brand-steel/30 rounded-xl text-brand-ocean dark:text-brand-steel text-xs font-mono font-bold">
                      Fee: ৳1500 (One-time, lifetime access)
                    </div>
                    <div>
                      <button
                        onClick={() => onNavigate('/pricing')}
                        className="px-6 py-3 text-sm font-bold bg-brand-ocean hover:bg-brand-steel hover:scale-[1.02] text-white rounded-xl shadow-lg shadow-brand-ocean/20 transition-all cursor-pointer inline-flex items-center gap-2"
                      >
                        Upgrade to Premium
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-base sm:text-lg text-slate-600 dark:text-zinc-300 font-serif leading-relaxed space-y-4 whitespace-pre-wrap">
                  {lesson.description}
                </div>
              )}
            </div>

            {/* Metadata bar */}
            <div className="flex flex-wrap gap-4 text-xs font-mono text-slate-400 pt-6 border-t border-slate-100 dark:border-brand-ocean/20">
              <span className="flex items-center gap-1.5 text-brand-steel">
                <Calendar className="w-4 h-4 text-brand-steel" />
                Created: {safeFormatDate(lesson.createdAt)}
              </span>
              <span>•</span>
              <span className="text-brand-steel">Last Updated: {safeFormatDate(lesson.updatedAt)}</span>
              <span>•</span>
              <span className="uppercase text-brand-ocean dark:text-[#8BA3AC] font-bold">{lesson.visibility} visibility</span>
              <span>•</span>
              <span className="text-brand-steel font-semibold flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-brand-steel" />
                {viewsCount} Views
              </span>
            </div>
          </div>
        </div>

        {/* Interaction grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Column Left (Interaction control) */}
          <div className="md:col-span-2 space-y-8">
            
            {/* Stats & Interactive Panel */}
            <div className="bg-white dark:bg-brand-midnight border border-slate-105 dark:border-brand-ocean/20 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
              
              <div className="flex flex-wrap items-center gap-6">
                <div className="text-center flex flex-col items-center">
                  <div className="flex items-center gap-1.5 justify-center">
                    <Heart className="w-4 h-4 text-brand-steel fill-brand-steel/10" />
                    <p className="text-2xl font-bold font-mono text-brand-charcoal dark:text-brand-white">{likesCount}</p>
                  </div>
                  <p className="text-[10px] text-brand-steel font-mono uppercase tracking-wider mt-1">Likes</p>
                </div>
                <div className="w-px h-10 bg-brand-steel/15 dark:bg-brand-ocean/20 hidden sm:block" />
                <div className="text-center flex flex-col items-center">
                  <div className="flex items-center gap-1.5 justify-center">
                    <Bookmark className="w-4 h-4 text-brand-steel fill-brand-steel/10" />
                    <p className="text-2xl font-bold font-mono text-brand-charcoal dark:text-brand-white">{savesCount}</p>
                  </div>
                  <p className="text-[10px] text-brand-steel font-mono uppercase tracking-wider mt-1">Favorites</p>
                </div>
                <div className="w-px h-10 bg-brand-steel/15 dark:bg-brand-ocean/20 hidden sm:block" />
                <div className="text-center flex flex-col items-center">
                  <div className="flex items-center gap-1.5 justify-center">
                    <Eye className="w-4 h-4 text-brand-steel" />
                    <p className="text-2xl font-bold font-mono text-brand-charcoal dark:text-brand-white">{viewsCount}</p>
                  </div>
                  <p className="text-[10px] text-brand-steel font-mono uppercase tracking-wider mt-1">Views</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                
                {/* Like Trigger */}
                <button
                  onClick={handleLikeToggle}
                  className={`px-4 py-2 text-sm font-semibold rounded-xl border flex items-center gap-2 transition-all cursor-pointer ${
                    liked 
                      ? 'bg-rose-50/70 text-rose-500 border-rose-200 dark:bg-rose-950/20 dark:border-rose-900/40' 
                      : 'hover:bg-slate-50 text-slate-600 border-slate-150 dark:text-zinc-300 dark:border-brand-ocean/20 dark:hover:bg-brand-midnight'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${liked ? 'fill-rose-500 text-rose-500' : ''}`} />
                  {liked ? 'Liked' : 'Like'}
                </button>

                {/* Favorite Trigger */}
                <button
                  onClick={handleFavoriteToggle}
                  className={`px-4 py-2 text-sm font-semibold rounded-xl border flex items-center gap-2 transition-all cursor-pointer ${
                    favorited 
                      ? 'bg-brand-steel/10 text-brand-ocean border-brand-steel/20 dark:bg-brand-ocean/25 dark:border-brand-ocean/30 dark:text-[#8BA3AC]' 
                      : 'hover:bg-slate-50 text-slate-600 border-slate-150 dark:text-zinc-300 dark:border-brand-ocean/20 dark:hover:bg-brand-midnight'
                  }`}
                >
                  <Bookmark className={`w-4 h-4 ${favorited ? 'fill-brand-ocean dark:fill-[#8BA3AC] text-brand-ocean' : ''}`} />
                  {favorited ? 'Saved' : 'Save'}
                </button>

                {/* Share Trigger */}
                <button
                  onClick={handleShareClick}
                  className={`px-4 py-2 text-sm font-semibold rounded-xl border flex items-center gap-2 transition-all cursor-pointer hover:bg-slate-50 text-slate-600 border-slate-150 dark:text-zinc-300 dark:border-brand-ocean/20 dark:hover:bg-brand-midnight ${
                    shareCopied ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900/40' : ''
                  }`}
                >
                  <Share2 className="w-4 h-4 text-emerald-500" />
                  {shareCopied ? 'Copied!' : 'Share'}
                </button>

                {/* Report trigger */}
                <button
                  onClick={() => {
                    if (!user) {
                      showToast('Please sign in to flag compliance disputes.', 'info');
                      onNavigate('/login');
                      return;
                    }
                    setReportModalOpen(true);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-rose-500 hover:text-white hover:bg-rose-500 border border-rose-500/10 hover:border-transparent rounded-xl transition-all cursor-pointer"
                >
                  <AlertTriangle className="w-3.5 h-3.5 inline mr-1" />
                  Report
                </button>

              </div>
            </div>

            {/* Comment Section */}
            <div className="bg-white dark:bg-brand-midnight border border-slate-105 dark:border-brand-ocean/20 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6 relative overflow-hidden">
              
              {/* Blur-overlay layer if premium is locked */}
              {isLocked && (
                <div className="absolute inset-0 bg-slate-50/85 dark:bg-[#011425]/90 backdrop-blur-md z-10 flex flex-col items-center justify-center p-6 text-center">
                  <Lock className="w-8 h-8 text-amber-500 mb-2 animate-bounce" />
                  <p className="text-sm font-bold text-slate-800 dark:text-zinc-100">Evaluations & Reviews Locked</p>
                  <p className="text-xs text-slate-400 max-w-xs mt-1 leading-relaxed">
                    Access to peer reviews, scholar notes, and compliance discussions requires premium subscription.
                  </p>
                  <button
                    onClick={() => onNavigate('/pricing')}
                    className="mt-4 px-5 py-2.5 text-xs font-bold bg-brand-ocean text-white rounded-xl hover:bg-brand-steel transition-all cursor-pointer"
                  >
                    Unlock Community Workspace 🔓
                  </button>
                </div>
              )}

              <h3 className="text-lg font-bold font-sans flex items-center gap-2">
                User Feedback & Insights
                <span className="text-xs font-mono font-bold bg-slate-50 dark:bg-brand-midnight border border-slate-100 dark:border-brand-ocean/10 px-2.5 py-0.5 rounded-full text-slate-500">
                  {comments.length} comments
                </span>
              </h3>

              {/* Submit field (Visible to logged-in users) */}
              <form onSubmit={handleCommentSubmit} className="space-y-3">
                <textarea
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder="Share a thoughtful observation, career pivot wisdom, or personal growth critique relating to this guideline..."
                  rows={3}
                  className="w-full text-sm p-4 bg-slate-50 dark:bg-brand-midnight/50 border border-slate-205 dark:border-brand-ocean/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-steel text-slate-800 dark:text-zinc-100"
                />
                <div className="flex justify-between items-center">
                  <p className="text-[10px] text-slate-400 font-mono">Constructive, academic dialogue encouraged.</p>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-bold rounded-xl bg-brand-ocean text-white hover:bg-brand-steel shadow flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Publish Comment
                  </button>
                </div>
              </form>

              {/* Comments list */}
              <div className="space-y-4 pt-6 border-t border-slate-50 dark:border-zinc-800/60 text-left">
                {comments.length === 0 ? (
                  <p className="text-sm text-slate-405 italic">No reviews published yet. Be the first to share your breakthrough perspective!</p>
                ) : (
                  comments.map(c => (
                    <div key={c.id} className="flex gap-3 text-sm p-4 rounded-xl bg-slate-50/50 dark:bg-brand-midnight border border-brand-steel/15">
                      <img 
                        src={c.userPhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'} 
                        className="w-8 h-8 rounded-full object-cover shrink-0 mt-0.5" 
                        alt="reviewer"
                        referrerPolicy="no-referrer"
                      />
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-bold text-slate-700 dark:text-zinc-300">{c.userName || 'Anonymous peer'}</p>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {safeFormatDate(c.createdAt)}
                          </span>
                        </div>
                        <p className="text-slate-600 dark:text-zinc-400 font-sans leading-relaxed break-words">{c.text}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

          {/* Column Right (Author portfolio) */}
          <div className="space-y-8 text-left">
            
            {/* Author details card */}
            <div className="bg-white dark:bg-brand-midnight border border-slate-105 dark:border-brand-ocean/20 rounded-2xl p-6 shadow-sm space-y-6">
              <h3 className="text-xs font-mono font-bold text-slate-450 uppercase tracking-widest">About the Author</h3>
              
              <div className="flex flex-col items-center text-center space-y-3">
                <img
                  src={lesson.creatorPhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120'}
                  alt={lesson.creatorName}
                  className="w-20 h-20 rounded-2xl object-cover ring-4 ring-brand-steel/10"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-zinc-100">{lesson.creatorName}</h4>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">{lesson.creatorEmail}</p>
                </div>
              </div>

              <div className="space-y-3 border-t pt-4 border-slate-100 dark:border-brand-ocean/20">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Contributor Badge:</span>
                  <span className="font-bold text-emerald-500 font-mono">Verified Scholar</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Total Publications:</span>
                  <span className="font-bold font-mono text-slate-800 dark:text-zinc-200">
                    {lesson.totalPublications !== undefined ? lesson.totalPublications : 3} lessons
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  if (onSelectAuthorEmail) {
                    onSelectAuthorEmail(lesson.creatorEmail);
                  }
                  onNavigate('/public-lessons'); // Filter in catalog
                  showToast(`Filtering lessons by user: ${lesson.creatorName}`, 'info');
                }}
                className="w-full py-2.5 text-xs font-bold text-brand-ocean hover:text-white hover:bg-brand-ocean border border-brand-steel/25 rounded-xl cursor-pointer transition-all text-center block bg-transparent"
              >
                View all lessons by this author
              </button>
            </div>
            
          </div>

        </div>

        {/* Similar & Recommended Lessons */}
        {recommendations.length > 0 && (
          <div className="space-y-6 pt-6 text-left">
            <h3 className="text-xl font-bold tracking-tight font-sans">Recommended Life Lessons</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {recommendations.map(rec => (
                <div
                  key={rec.id}
                  onClick={() => {
                    if (rec.isLocked) {
                      showToast('Premium lesson locked! Redirecting to setup plan.', 'info');
                      onNavigate('/pricing');
                    } else {
                      onNavigate(`/lessons/${rec.id}`);
                    }
                  }}
                  className="bg-white dark:bg-brand-midnight border border-slate-105 dark:border-brand-ocean/20 rounded-2xl overflow-hidden p-5 space-y-3 cursor-pointer hover:border-brand-steel transition-all flex flex-col justify-between shadow-xs hover:shadow-sm"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-mono font-bold tracking-tight">
                      <span className="text-slate-400 uppercase">{rec.category}</span>
                      <span className="text-brand-ocean dark:text-brand-steel">{rec.emotionalTone}</span>
                    </div>
                    <img 
                      src={rec.image || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=400'}
                      referrerPolicy="no-referrer"
                      className="w-full h-32 object-cover rounded-xl"
                      alt="preview"
                    />
                    <h4 className="text-sm font-bold text-slate-800 dark:text-zinc-200 line-clamp-2 leading-snug">{rec.title}</h4>
                    <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">{rec.description}</p>
                  </div>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-brand-ocean/10">
                    <p className="text-[10px] font-mono text-slate-400">By {rec.creatorName}</p>
                    {rec.accessLevel === 'Premium' && <span className="text-[10px] font-bold text-brand-ocean dark:text-brand-steel">Premium</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Flag / Report Popup Modal */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 text-left">
          <div className="bg-brand-white dark:bg-brand-charcoal border border-brand-steel/20 rounded-3xl w-full max-w-sm p-6 sm:p-8 space-y-6 shadow-xl animate-in zoom-in-95 duration-100 text-brand-charcoal dark:text-brand-white">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold font-sans">Report Compliance Issue</h2>
              <button
                onClick={() => setReportModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer text-sm font-mono"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              If this submission features offensive terms, plagiarism, or safety violations, please select a reason below to alert administrative reviewers.
            </p>

            <form onSubmit={handleReportSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-bold uppercase text-slate-400 mb-1.5">Reason for Dispute</label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full text-sm px-4 py-2.5 bg-slate-50 dark:bg-zinc-800 dark:text-zinc-200 border rounded-xl focus:outline-none"
                >
                  <option value="Inappropriate content / language">Inappropriate content / language</option>
                  <option value="Copyright violation / Plagiarism">Copyright violation / Plagiarism</option>
                  <option value="Incorrect or misleading wisdom claims">Incorrect claims or misleading logic</option>
                  <option value="Spam / Self-promotional links">Spammer / Self-promotional redirects</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setReportModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-zinc-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-rose-500 text-white hover:bg-rose-600 rounded-xl cursor-pointer shadow-md shadow-rose-500/10"
                >
                  Submit Report Dispute
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
