/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Layout, PlusCircle, BookOpen, Star, User as UserIcon, 
  Settings, Trash2, CheckCircle2, ShieldAlert, BarChart3, 
  Users, Bookmark, Flag, Sparkles, Check, X, ShieldCheck, 
  Eye, Edit, Info, AlertTriangle, RefreshCw, Calendar, RefreshCw as LoopIcon,
  Flame
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Dashboard({ initialTab = 'overview', onNavigate }) {
  const { user, token, updateProfile } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState(initialTab);
  const [loading, setLoading] = useState(false);

  // States for user self lessons
  const [myLessons, setMyLessons] = useState([]);
  const [myFavorites, setMyFavorites] = useState([]);

  // Filter lists inside favorites
  const [favCategoryFilter, setFavCategoryFilter] = useState('');
  const [favToneFilter, setFavToneFilter] = useState('');

  // Filter lists inside admin moderate lessons
  const [adminLessonCategoryFilter, setAdminLessonCategoryFilter] = useState('');
  const [adminLessonVisibilityFilter, setAdminLessonVisibilityFilter] = useState('');
  const [adminLessonFlagFilter, setAdminLessonFlagFilter] = useState('');

  // Update Lesson state
  const [editingLesson, setEditingLesson] = useState(null);

  // Sync tab with route props
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Unified tab switch handler with URL navigation
  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    if (tab === 'overview') onNavigate('/dashboard');
    else if (tab === 'add-lesson') onNavigate('/dashboard/add-lesson');
    else if (tab === 'my-lessons') onNavigate('/dashboard/my-lessons');
    else if (tab === 'my-favorites') onNavigate('/dashboard/my-favorites');
    else if (tab === 'profile') onNavigate('/dashboard/profile');
    else if (tab === 'admin') onNavigate('/dashboard/admin');
    else if (tab === 'admin-users') onNavigate('/dashboard/admin/manage-users');
    else if (tab === 'admin-lessons') onNavigate('/dashboard/admin/manage-lessons');
    else if (tab === 'admin-reports') onNavigate('/dashboard/admin/reported-lessons');
    else if (tab === 'admin-profile') onNavigate('/dashboard/admin/profile');
  };

  // Profile Edit fields
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profilePhoto, setProfilePhoto] = useState(user?.photoURL || '');

  // Synchronize profile fields as user state changes
  useEffect(() => {
    if (user) {
      setProfileName(user.name || '');
      setProfilePhoto(user.photoURL || '');
    }
  }, [user]);

  // Admin states
  const [adminStats, setAdminStats] = useState(null);
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminLessons, setAdminLessons] = useState([]);
  const [adminReports, setAdminReports] = useState([]);
  const [activeReportDetails, setActiveReportDetails] = useState(null);

  // Streak simulation state
  const [streakDays] = useState(() => Math.floor(Math.random() * 8) + 4);

  // Form states for adding lessons
  const [addTitle, setAddTitle] = useState('');
  const [addDescription, setAddDescription] = useState('');
  const [addCategory, setAddCategory] = useState('Personal Growth');
  const [addTone, setAddTone] = useState('Motivational');
  const [addAccess, setAddAccess] = useState('Free');
  const [addVisibility, setAddVisibility] = useState('Public');
  const [addImage, setAddImage] = useState('');

  const isPremiumUser = user?.isPremium || user?.role === 'admin';

  // React on tab switches to load data
  useEffect(() => {
    if (!user || !token) {
      // Force signin if they navigate here
      onNavigate('/login');
      return;
    }
    loadDataByTab();
  }, [activeTab, token, user?.id, favCategoryFilter, favToneFilter]);

  const loadDataByTab = async () => {
    try {
      setLoading(true);
      const headers = { 'Authorization': `Bearer ${token}` };

      // User overview or My Lessons
      if (activeTab === 'overview' || activeTab === 'my-lessons') {
        const res = await fetch('/api/lessons?limit=100', { headers });
        if (res.ok) {
          const data = await res.json();
          // Filter to only self comments
          const self = (data.lessons || []).filter((l) => l.creatorId === user?.id);
          setMyLessons(self);
        }
      }

      // My Favorites
      if (activeTab === 'my-favorites' || activeTab === 'overview') {
        const queryParams = new URLSearchParams();
        if (favCategoryFilter) queryParams.set('category', favCategoryFilter);
        if (favToneFilter) queryParams.set('emotionalTone', favToneFilter);

        const res = await fetch(`/api/favorites?${queryParams.toString()}`, { headers });
        if (res.ok) {
          const data = await res.json();
          setMyFavorites(data.favorites || []);
        }
      }

      // Admin global synchronized data loader
      if (activeTab.startsWith('admin') && user?.role === 'admin') {
        const [resStats, resUsers, resLessons, resReports] = await Promise.all([
          fetch('/api/admin/stats', { headers }),
          fetch('/api/admin/users', { headers }),
          fetch('/api/admin/lessons', { headers }),
          fetch('/api/admin/reports', { headers })
        ]);

        if (resStats.ok) {
          const s = await resStats.json();
          setAdminStats(s);
        }
        if (resUsers.ok) {
          const uData = await resUsers.json();
          setAdminUsers(uData.users || []);
        }
        if (resLessons.ok) {
          const lData = await resLessons.json();
          setAdminLessons(lData.lessons || []);
        }
        if (resReports.ok) {
          const rData = await resReports.json();
          setAdminReports(rData.reports || []);
        }
      }

    } catch (err) {
      console.error(err);
      showToast('Error syncing list with database', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Add Lesson submit handle
  const handleAddLessonSubmit = async (e) => {
    e.preventDefault();
    if (!addTitle.trim() || !addDescription.trim()) {
      showToast('Lessons must carry a valid title and meaningful description content.', 'error');
      return;
    }

    try {
      setLoading(true);
      const lessonPayload = {
        title: addTitle,
        description: addDescription,
        category: addCategory,
        emotionalTone: addTone,
        visibility: addVisibility,
        accessLevel: isPremiumUser ? addAccess : 'Free', // auto downgrade if free
        image: addImage
      };

      const res = await fetch('/api/lessons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(lessonPayload)
      });

      const data = await res.json();
      if (res.ok) {
        showToast('Life lesson stored and published successfully!', 'success');
        // Reset form
        setAddTitle('');
        setAddDescription('');
        setAddImage('');
        // Redirect to my lessons list
        setActiveTab('my-lessons');
      } else {
        showToast(data.error || 'Failed to save lesson', 'error');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Update lesson modal submit
  const handleUpdateLessonSubmit = async (e) => {
    e.preventDefault();
    if (!editingLesson) return;

    try {
      setLoading(true);
      const res = await fetch(`/api/lessons/${editingLesson.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: editingLesson.title,
          description: editingLesson.description,
          category: editingLesson.category,
          emotionalTone: editingLesson.emotionalTone,
          visibility: editingLesson.visibility,
          accessLevel: isPremiumUser ? editingLesson.accessLevel : 'Free',
          image: editingLesson.image
        })
      });

      if (res.ok) {
        showToast('Lesson parameters modified successfully!', 'success');
        setEditingLesson(null);
        loadDataByTab(); // Sync
      } else {
        const d = await res.json();
        showToast(d.error || 'Update failed', 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Switch Lesson visibility
  const toggleVisibility = async (lesson) => {
    const nextVis = lesson.visibility === 'Public' ? 'Private' : 'Public';
    try {
      const res = await fetch(`/api/lessons/${lesson.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ visibility: nextVis })
      });
      if (res.ok) {
        showToast(`Visibility changed to ${nextVis}!`, 'success');
        loadDataByTab();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Switch Lesson access (Premium / Free)
  const toggleAccessLevel = async (lesson) => {
    if (!isPremiumUser) {
      showToast('Only Premium tier users can toggle paid lesson gates!', 'info');
      onNavigate('/pricing');
      return;
    }
    const nextAcc = lesson.accessLevel === 'Free' ? 'Premium' : 'Free';
    try {
      const res = await fetch(`/api/lessons/${lesson.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ accessLevel: nextAcc })
      });
      if (res.ok) {
        showToast(`Access level set to ${nextAcc}!`, 'success');
        loadDataByTab();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Lesson Handler
  const handleDeleteLesson = async (id) => {
    if (!confirm('Are you absolutely sure you want to permantly delete this life lesson? This action is non-reversible.')) return;
    try {
      const res = await fetch(`/api/lessons/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message, 'success');
        loadDataByTab();
      } else {
        showToast(data.error || 'Failed to remove', 'error');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Remove favorite directly
  const handleRemoveFavorite = async (id) => {
    try {
      const res = await fetch(`/api/lessons/${id}/favorite`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        showToast('Removed from personal favorites list', 'success');
        loadDataByTab();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Admin user role promoter
  const handlePromoteAdmin = async (id, currentRole) => {
    const nextRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      const res = await fetch(`/api/admin/users/${id}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: nextRole })
      });
      if (res.ok) {
        showToast(`User database promoted to ${nextRole} role!`, 'success');
        loadDataByTab();
      } else {
        const d = await res.json();
        showToast(d.error || 'Failed to update user role', 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Admin delete offensive user account
  const handleDeleteUserAccount = async (id) => {
    if (!confirm('Are you sure you want to completely delete this user account from the platform database?')) return;
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        showToast('User account successfully purged.', 'success');
        loadDataByTab();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Toggle Featured Admin nominations
  const handleToggleFeatured = async (lesson) => {
    const nextFeat = !lesson.isFeatured;
    try {
      const res = await fetch(`/api/admin/lessons/${lesson.id}/featured`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isFeatured: nextFeat })
      });
      if (res.ok) {
        showToast(nextFeat ? 'Nominated to Home slider section!' : 'Removed from Home slide nominations.', 'success');
        loadDataByTab();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Mark lesson reviewed
  const handleMarkReviewed = async (id) => {
    try {
      const res = await fetch(`/api/admin/lessons/${id}/reviewed`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        showToast('Lesson marked as reviewed by Compliance Admin.', 'success');
        loadDataByTab();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Admin reported lessons clearing
  const handleIgnoreReport = async (lessonId) => {
    try {
      const res = await fetch(`/api/admin/reports/${lessonId}/ignore`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        showToast('Reports discarded. Content marked safe.', 'success');
        loadDataByTab();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Profile fields submission
  const handleProfileUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!profileName.trim()) {
      showToast('Name cannot be blank.', 'error');
      return;
    }

    try {
      setLoading(true);
      const res = await updateProfile(profileName, profilePhoto);
      if (res && res.success) {
        showToast('Scholar profile modifications saved.', 'success');
      } else {
        showToast((res && res.error) || 'Failed to modify profile', 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Premium responsive inline SVG line area chart builder
  const renderSVGChart = (data, dataKey, color, fillId) => {
    const width = 450;
    const height = 180;
    const paddingLeft = 40;
    const paddingRight = 20;
    const paddingTop = 20;
    const paddingBottom = 30;

    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;

    const values = data.map(d => d[dataKey] || 0);
    const maxVal = Math.max(...values, 10) * 1.1;
    const minVal = 0;

    const points = data.map((d, i) => {
      const x = paddingLeft + (i / (data.length - 1)) * chartWidth;
      const y = height - paddingBottom - (((d[dataKey] || 0) - minVal) / (maxVal - minVal)) * chartHeight;
      return { x, y, label: d.label, val: d[dataKey] };
    });

    let linePath = '';
    let areaPath = '';

    if (points.length > 0) {
      linePath = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');
      areaPath = `${linePath} L ${points[points.length - 1].x} ${height - paddingBottom} L ${points[0].x} ${height - paddingBottom} Z`;
    }

    return (
      <div className="w-full h-44">
        <svg className="w-full h-full" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
          <defs>
            <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.3" />
              <stop offset="100%" stopColor={color} stopOpacity="0.0" />
            </linearGradient>
          </defs>
          
          {/* Dash helper grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
            const y = paddingTop + ratio * chartHeight;
            return (
              <line 
                key={index} 
                x1={paddingLeft} 
                y1={y} 
                x2={width - paddingRight} 
                y2={y} 
                stroke="currentColor" 
                className="text-slate-100 dark:text-zinc-800" 
                strokeDasharray="4,4" 
              />
            );
          })}

          {/* Area under the line */}
          {areaPath && <path d={areaPath} fill={`url(#${fillId})`} className="animate-fade-in" />}
          
          {/* Main glowing line */}
          {linePath && <path d={linePath} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />}

          {/* Markers and indicators */}
          {points.map((p, i) => (
            <g key={i}>
              <circle 
                cx={p.x} 
                cy={p.y} 
                r="4.5" 
                fill={color} 
                className="stroke-white dark:stroke-zinc-900" 
                strokeWidth="2"
              />
              
              {/* Value labels for active peaks */}
              {(i === 0 || i === Math.floor(points.length / 2) || i === points.length - 1) && (
                <text 
                  x={p.x} 
                  y={p.y - 10} 
                  textAnchor="middle"
                  className="text-[10px] font-mono font-bold fill-current text-slate-700 dark:fill-zinc-300"
                >
                  {p.val}
                </text>
              )}
              
              {/* X Axis month dates */}
              <text 
                x={p.x} 
                y={height - 8} 
                textAnchor="middle" 
                className="text-[10px] font-mono fill-current text-slate-400 dark:fill-zinc-500 font-semibold"
              >
                {p.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
    );
  };

  return (
    <div className="bg-brand-white dark:bg-brand-midnight text-brand-charcoal dark:text-brand-white min-h-screen transition-colors">
      <div className="flex flex-col md:flex-row min-h-screen">
        
        {/* SIDEBAR RAIL LAYOUT */}
        <div className="w-full md:w-64 bg-brand-white dark:bg-brand-charcoal border-r border-brand-steel/20 p-6 flex flex-col justify-between">
          
          <div className="space-y-8">
            {/* Header profile info */}
            <div className="flex items-center gap-3 pb-6 border-b border-brand-steel/10">
              <img
                src={user?.photoURL}
                alt={user?.name}
                className="w-10 h-10 rounded-xl object-cover ring-2 ring-brand-steel/20"
                referrerPolicy="no-referrer"
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold truncate">{user?.name}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className={`inline-flex px-1.5 py-0.5 text-[9px] font-mono font-bold rounded ${
                    user?.role === 'admin' 
                      ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                      : isPremiumUser ? 'bg-brand-ocean/15 text-brand-ocean dark:bg-brand-steel/20 dark:text-brand-steel' : 'bg-slate-100 text-slate-500 dark:bg-zinc-800'
                  }`}>
                    {user?.role === 'admin' ? 'Admin Operator' : isPremiumUser ? 'Premium' : 'Free Plan'}
                  </span>
                </div>
              </div>
            </div>

            {/* Nav list */}
            <div className="space-y-1">
              <p className="text-[10px] font-bold font-mono uppercase tracking-wider text-brand-steel px-3 mb-2">My Workspace</p>
              
              <button
                onClick={() => handleTabSwitch('overview')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === 'overview'
                    ? 'bg-brand-ocean text-white shadow-md shadow-brand-ocean/10'
                    : 'text-brand-charcoal hover:bg-brand-steel/10 dark:text-brand-steel dark:hover:bg-brand-steel/10'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Layout className="w-4 h-4" />
                  Dashboard Home
                </span>
              </button>
 
              <button
                onClick={() => handleTabSwitch('add-lesson')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === 'add-lesson'
                    ? 'bg-brand-ocean text-white shadow-md shadow-brand-ocean/10'
                    : 'text-brand-charcoal hover:bg-brand-steel/10 dark:text-brand-steel dark:hover:bg-brand-steel/10'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <PlusCircle className="w-4 h-4" />
                  Add Life Lesson
                </span>
              </button>
 
              <button
                onClick={() => handleTabSwitch('my-lessons')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === 'my-lessons'
                    ? 'bg-brand-ocean text-white shadow-md shadow-brand-ocean/10'
                    : 'text-brand-charcoal hover:bg-brand-steel/10 dark:text-brand-steel dark:hover:bg-brand-steel/10'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <BookOpen className="w-4 h-4" />
                  My Lessons
                </span>
                {myLessons.length > 0 && (
                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${activeTab === 'my-lessons' ? 'bg-white/20 text-white' : 'bg-brand-steel/10 text-brand-steel'}`}>
                    {myLessons.length}
                  </span>
                )}
              </button>
 
              <button
                onClick={() => handleTabSwitch('my-favorites')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === 'my-favorites'
                    ? 'bg-brand-ocean text-white shadow-md shadow-brand-ocean/10'
                    : 'text-brand-charcoal hover:bg-brand-steel/10 dark:text-brand-steel dark:hover:bg-brand-steel/10'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Bookmark className="w-4 h-4" />
                  My Favorites
                </span>
                {myFavorites.length > 0 && (
                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${activeTab === 'my-favorites' ? 'bg-white/20 text-white' : 'bg-brand-steel/10 text-brand-steel'}`}>
                    {myFavorites.length}
                  </span>
                )}
              </button>
 
              <button
                onClick={() => handleTabSwitch('profile')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === 'profile'
                    ? 'bg-brand-ocean text-white shadow-md shadow-brand-ocean/10'
                    : 'text-brand-charcoal hover:bg-brand-steel/10 dark:text-brand-steel dark:hover:bg-brand-steel/10'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <UserIcon className="w-4 h-4" />
                  Profile & Settings
                </span>
              </button>
            </div>
 
            {/* Admin Block (restricted) */}
            {user?.role === 'admin' && (
              <div className="space-y-1 pt-6 border-t border-brand-steel/10">
                <p className="text-[10px] font-bold font-mono uppercase tracking-wider text-brand-steel px-3 mb-2">Admin Panel</p>
                
                <button
                  onClick={() => handleTabSwitch('admin')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                    activeTab === 'admin'
                      ? 'bg-brand-steel text-white shadow-md shadow-brand-steel/10'
                      : 'text-brand-charcoal hover:bg-brand-steel/10 dark:text-brand-steel dark:hover:bg-brand-steel/10'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <BarChart3 className="w-4 h-4" />
                    Admin Overview
                  </span>
                </button>
 
                <button
                  onClick={() => handleTabSwitch('admin-users')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                    activeTab === 'admin-users'
                      ? 'bg-brand-steel text-white shadow-md shadow-brand-steel/10'
                      : 'text-brand-charcoal hover:bg-brand-steel/10 dark:text-brand-steel dark:hover:bg-brand-steel/10'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Users className="w-4 h-4" />
                    Manage Users
                  </span>
                </button>
 
                <button
                  onClick={() => handleTabSwitch('admin-lessons')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                    activeTab === 'admin-lessons'
                      ? 'bg-brand-steel text-white shadow-md shadow-brand-steel/10'
                      : 'text-brand-charcoal hover:bg-brand-steel/10 dark:text-brand-steel dark:hover:bg-brand-steel/10'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <BookOpen className="w-4 h-4" />
                    Manage Lessons
                  </span>
                </button>
 
                <button
                  onClick={() => handleTabSwitch('admin-reports')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                    activeTab === 'admin-reports'
                      ? 'bg-brand-steel text-white shadow-md shadow-brand-steel/10'
                      : 'text-brand-charcoal hover:bg-brand-steel/10 dark:text-brand-steel dark:hover:bg-brand-steel/10'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Flag className="w-4 h-4" />
                    Reported Disputes
                  </span>
                  {adminReports.length > 0 && (
                    <span className="text-[9px] font-bold font-mono px-1.5 py-0.5 rounded-full bg-brand-ocean text-white animate-pulse">
                      {adminReports.length}
                    </span>
                  )}
                </button>
 
                <button
                  onClick={() => handleTabSwitch('admin-profile')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                    activeTab === 'admin-profile'
                      ? 'bg-brand-steel text-white shadow-md shadow-brand-steel/10'
                      : 'text-brand-charcoal hover:bg-brand-steel/10 dark:text-brand-steel dark:hover:bg-brand-steel/10'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <UserIcon className="w-4 h-4" />
                    Admin Profile
                  </span>
                </button>
              </div>
            )}
 
          </div>
 
          <p className="text-[10px] font-mono text-brand-steel/70 mt-12 select-none">
            Sofia Framework v1.0.6
          </p>
        </div>

        {/* CORE WORKSPACE CONTENT WINDOW */}
        <div className="flex-1 p-6 sm:p-10 space-y-8 overflow-y-auto max-w-5xl w-full">
          
          <AnimatePresence mode="wait">
            {/* TAB: OVERVIEW */}
            {activeTab === 'overview' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-8"
              >
                {/* Greeting banner */}
                <div className="p-8 rounded-3xl bg-brand-midnight text-white dark:bg-brand-charcoal border border-brand-steel/20 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md relative overflow-hidden">
                  <div className="space-y-2 z-10">
                    <h2 className="text-2xl font-bold">Good Day, {user?.name}!</h2>
                    <p className="text-xs text-brand-steel">
                      You are in high-integrity reflection active mode. You currently have <span className="font-bold underline text-white">{myLessons.length} shared lessons</span> and <span className="font-bold underline text-white">{myFavorites.length} saved favorites</span>.
                    </p>
                  </div>
                  
                  {/* Streak Card */}
                  <div className="p-4 bg-brand-ocean/30 rounded-2xl text-center border border-brand-steel/20 shrink-0 font-sans backdrop-blur cursor-pointer z-10 font-bold flex flex-col items-center justify-center">
                    <p className="text-[10px] font-mono text-brand-steel uppercase tracking-wider">Reflection Streak</p>
                    <p className="text-3xl font-extrabold text-white font-mono mt-1 flex items-center justify-center gap-1.5">
                      <Flame className="w-6 h-6 text-brand-steel fill-brand-steel/30 animate-pulse" />
                      {streakDays} days
                    </p>
                  </div>
                </div>

                {/* Dashboard Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  
                  <div className="bg-brand-white dark:bg-brand-charcoal border border-brand-steel/20 rounded-2xl p-6 shadow-sm space-y-1">
                    <p className="text-xs font-mono text-brand-steel uppercase font-bold">My Publications</p>
                    <p className="text-3xl font-bold font-mono text-brand-midnight dark:text-brand-white">{myLessons.length}</p>
                    <p className="text-[10px] text-brand-steel pt-2 flex items-center gap-1 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-brand-steel" /> Auto-saved in database
                    </p>
                  </div>

                  <div className="bg-brand-white dark:bg-brand-charcoal border border-brand-steel/20 rounded-2xl p-6 shadow-sm space-y-1">
                    <p className="text-xs font-mono text-brand-steel uppercase font-bold">Favorited Treasures</p>
                    <p className="text-3xl font-bold font-mono text-brand-midnight dark:text-brand-white">{myFavorites.length}</p>
                    <p className="text-[10px] text-brand-steel pt-2 flex items-center gap-1 font-semibold">
                      <Bookmark className="w-3.5 h-3.5 text-brand-steel" /> Preserved mentors wisdom
                    </p>
                  </div>

                  <div className="bg-brand-white dark:bg-brand-charcoal border border-brand-steel/20 rounded-2xl p-6 shadow-sm space-y-1">
                    <p className="text-xs font-mono text-brand-steel uppercase font-bold">Verification Badge</p>
                    <div className="pt-1">
                      {isPremiumUser ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold font-sans rounded-full bg-brand-ocean/15 text-brand-ocean dark:bg-brand-steel/15 dark:text-brand-steel border border-brand-ocean/20 dark:border-brand-steel/20">
                          Premium Scholar Active
                        </span>
                      ) : (
                        <button
                          onClick={() => setActiveTab('add-lesson')}
                          className="text-xs text-brand-ocean hover:underline inline-flex items-center gap-1 font-bold cursor-pointer"
                        >
                          Upgrade to Premium plan
                        </button>
                      )}
                    </div>
                    <p className="text-[10px] text-brand-steel pt-4 font-mono">Platform status tier</p>
                  </div>

                </div>

                {/* Quick actions workspace panel */}
                <div className="bg-brand-white dark:bg-brand-charcoal border border-brand-steel/20 rounded-2xl p-6 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider font-mono text-brand-steel">Quick Actions Workspace</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <button
                      onClick={() => setActiveTab('add-lesson')}
                      className="p-4 bg-brand-steel/5 hover:bg-brand-steel/10 dark:bg-brand-midnight dark:hover:bg-brand-midnight/80 rounded-xl text-center space-y-2 cursor-pointer transition-all border border-brand-steel/20 block group"
                    >
                      <PlusCircle className="w-6 h-6 mx-auto text-brand-ocean group-hover:scale-110 transition-transform" />
                      <p className="text-xs font-bold text-brand-midnight dark:text-brand-white">Publish Lesson</p>
                    </button>
                    <button
                      onClick={() => setActiveTab('my-lessons')}
                      className="p-4 bg-brand-steel/5 hover:bg-brand-steel/10 dark:bg-brand-midnight dark:hover:bg-brand-midnight/80 rounded-xl text-center space-y-2 cursor-pointer transition-all border border-brand-steel/20 block group"
                    >
                      <BookOpen className="w-6 h-6 mx-auto text-brand-steel group-hover:scale-110 transition-transform" />
                      <p className="text-xs font-bold text-brand-midnight dark:text-brand-white">My Publications</p>
                    </button>
                    <button
                      onClick={() => setActiveTab('my-favorites')}
                      className="p-4 bg-brand-steel/5 hover:bg-brand-steel/10 dark:bg-brand-midnight dark:hover:bg-brand-midnight/80 rounded-xl text-center space-y-2 cursor-pointer transition-all border border-brand-steel/20 block group"
                    >
                      <Star className="w-6 h-6 mx-auto text-brand-steel group-hover:scale-110 transition-transform" />
                      <p className="text-xs font-bold text-brand-midnight dark:text-brand-white">My Favorites</p>
                    </button>
                    <button
                      onClick={() => onNavigate('/public-lessons')}
                      className="p-4 bg-brand-steel/5 hover:bg-brand-steel/10 dark:bg-brand-midnight dark:hover:bg-brand-midnight/80 rounded-xl text-center space-y-2 cursor-pointer transition-all border border-brand-steel/20 block group"
                    >
                      <Sparkles className="w-6 h-6 mx-auto text-brand-ocean group-hover:scale-110 transition-transform" />
                      <p className="text-xs font-bold text-brand-midnight dark:text-brand-white">Explore Catalog</p>
                    </button>
                  </div>
                </div>

                {/* Custom Analytical SVG graph */}
                <div className="bg-brand-white dark:bg-brand-charcoal border border-brand-steel/20 rounded-2xl p-6 shadow-sm space-y-6">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider font-mono text-brand-steel">Weekly Reflection Intensity</h3>
                    <p className="text-xs text-brand-steel mt-1">A visual representation of lessons added vs. platform-wide wisdom growth.</p>
                  </div>
                  
                  {/* SVG Chart */}
                  <div className="w-full h-44 flex items-end justify-between pt-6 px-4">
                    <div className="flex-1 flex flex-col items-center">
                      <div className="w-8 bg-brand-steel/20 hover:bg-brand-steel/40 dark:bg-brand-midnight rounded-t-lg h-12 transition-all cursor-pointer" />
                      <span className="text-[10px] font-mono text-brand-steel mt-2">Mon</span>
                    </div>
                    <div className="flex-1 flex flex-col items-center">
                      <div className="w-8 bg-brand-steel/40 hover:bg-brand-steel/60 dark:bg-brand-midnight rounded-t-lg h-20 transition-all cursor-pointer" />
                      <span className="text-[10px] font-mono text-brand-steel mt-2">Tue</span>
                    </div>
                    <div className="flex-1 flex flex-col items-center">
                      <div className="w-8 bg-brand-steel/60 hover:bg-brand-steel/80 dark:bg-brand-midnight rounded-t-lg h-28 transition-all cursor-pointer" />
                      <span className="text-[10px] font-mono text-brand-steel mt-2">Wed</span>
                    </div>
                    <div className="flex-1 flex flex-col items-center">
                      <div className="w-8 bg-brand-ocean hover:bg-brand-steel dark:bg-brand-steel rounded-t-lg h-36 transition-all shadow cursor-pointer" />
                      <span className="text-[10px] font-mono text-brand-steel mt-2">Thu (Today)</span>
                    </div>
                  </div>
                </div>

                {/* Recently added lessons review shortcut */}
                <div className="space-y-4">
                  <h3 className="text-base font-bold font-sans">Recently Added Wisdom</h3>
                  {myLessons.length === 0 ? (
                    <div className="p-6 text-center border-2 border-dashed border-brand-steel/20 rounded-2xl">
                      <p className="text-xs text-brand-steel italic">No publications created yet. Create your first set above!</p>
                      <button
                        onClick={() => setActiveTab('add-lesson')}
                        className="mt-3 px-4 py-2 bg-brand-steel hover:bg-brand-steel/80 text-brand-midnight rounded-xl text-xs font-bold shadow-sm inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        Publish Your First Lesson
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {myLessons.slice(0, 2).map((l) => (
                        <div key={l.id} className="p-5 rounded-2xl bg-brand-white dark:bg-brand-charcoal border border-brand-steel/20 shadow-sm space-y-3 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 font-bold">
                              <span>{l.category}</span>
                              <span>{new Date(l.createdAt).toLocaleDateString()}</span>
                            </div>
                            <h4 className="text-sm font-bold mt-1 line-clamp-1">{l.title}</h4>
                            <p className="text-xs text-slate-400 line-clamp-2 mt-1">{l.description}</p>
                          </div>
                          <button
                            onClick={() => onNavigate(`/lessons/${l.id}`)}
                            className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer text-left"
                          >
                            Review details & feedback
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </motion.div>
            )}

            {/* TAB: ADD LESSON */}
            {activeTab === 'add-lesson' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-white dark:bg-zinc-900 border rounded-3xl p-6 sm:p-10 shadow-sm space-y-8"
              >
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold font-sans">Publish a Meaningful Life Lesson</h2>
                  <p className="text-xs text-slate-400 mt-1">Share individual setbacks, career boundaries, startup pivots, or emotional insights.</p>
                </div>

                <form onSubmit={handleAddLessonSubmit} className="space-y-6">
                  
                  {/* Title */}
                  <div className="space-y-1">
                    <label className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block">Lesson Title</label>
                    <input
                      type="text"
                      required
                      value={addTitle}
                      onChange={(e) => setAddTitle(e.target.value)}
                      placeholder="e.g., Setting Strict Technical Boundaries Early in Career"
                      className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-zinc-800 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-zinc-100"
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-1">
                    <label className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block">Full Narrative / Wisdom Description</label>
                    <textarea
                      required
                      value={addDescription}
                      onChange={(e) => setAddDescription(e.target.value)}
                      rows={6}
                      placeholder="Summarize the background, error made, critical emotional tone, and structured feedback loop we should keep..."
                      className="w-full text-sm p-4 bg-slate-50 dark:bg-zinc-800 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-zinc-100"
                    />
                  </div>

                  {/* Dropdowns row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    
                    {/* Category Dropdown */}
                    <div className="space-y-1">
                      <label className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block">Category Segment</label>
                      <select
                        value={addCategory}
                        onChange={(e) => setAddCategory(e.target.value)}
                        className="w-full text-sm px-4 py-2.5 bg-slate-50 border dark:bg-zinc-800 dark:border-zinc-800 text-slate-800 dark:text-zinc-100 rounded-xl focus:outline-none"
                      >
                        <option value="Personal Growth" className="bg-white dark:bg-brand-midnight text-slate-800 dark:text-zinc-100">Personal Growth</option>
                        <option value="Career" className="bg-white dark:bg-brand-midnight text-slate-800 dark:text-zinc-100">Career</option>
                        <option value="Relationships" className="bg-white dark:bg-brand-midnight text-slate-800 dark:text-zinc-100">Relationships</option>
                        <option value="Mindset" className="bg-white dark:bg-brand-midnight text-slate-800 dark:text-zinc-100">Mindset</option>
                        <option value="Mistakes Learned" className="bg-white dark:bg-brand-midnight text-slate-800 dark:text-zinc-100">Mistakes Learned</option>
                      </select>
                    </div>

                    {/* Emotional Tone */}
                    <div className="space-y-1">
                      <label className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block">Emotional Tone</label>
                      <select
                        value={addTone}
                        onChange={(e) => setAddTone(e.target.value)}
                        className="w-full text-sm px-4 py-2.5 bg-slate-50 border dark:bg-zinc-800 dark:border-zinc-800 text-slate-800 dark:text-zinc-100 rounded-xl focus:outline-none"
                      >
                        <option value="Motivational" className="bg-white dark:bg-brand-midnight text-slate-800 dark:text-zinc-100">Motivational</option>
                        <option value="Sad" className="bg-white dark:bg-brand-midnight text-slate-800 dark:text-zinc-100">Sad</option>
                        <option value="Realization" className="bg-white dark:bg-brand-midnight text-slate-800 dark:text-zinc-100">Realization</option>
                        <option value="Gratitude" className="bg-white dark:bg-brand-midnight text-slate-800 dark:text-zinc-100">Gratitude</option>
                      </select>
                    </div>

                  </div>

                  {/* Settings Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    
                    {/* Cover image optional */}
                    <div className="space-y-1">
                      <label className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block">Cover Image Link (Optional)</label>
                      <input
                        type="url"
                        value={addImage}
                        onChange={(e) => setAddImage(e.target.value)}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full px-4 py-2.5 text-xs bg-slate-50 dark:bg-zinc-800 border dark:border-zinc-800 text-slate-800 dark:text-zinc-100 rounded-xl focus:outline-none"
                      />
                    </div>

                    {/* Visibility */}
                    <div className="space-y-1">
                      <label className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block">Visibility Filter</label>
                      <select
                        value={addVisibility}
                        onChange={(e) => setAddVisibility(e.target.value)}
                        className="w-full text-sm px-4 py-2.5 bg-slate-50 border dark:bg-zinc-800 dark:border-zinc-800 text-slate-800 dark:text-zinc-100 rounded-xl focus:outline-none"
                      >
                        <option value="Public" className="bg-white dark:bg-brand-midnight text-slate-800 dark:text-zinc-100">Public (visible in archives)</option>
                        <option value="Private" className="bg-white dark:bg-brand-midnight text-slate-800 dark:text-zinc-100">Private (personal use only)</option>
                      </select>
                    </div>

                    {/* Access Level Dropdown with strict lock gates */}
                    <div className="space-y-1">
                      <label className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block font-sans">Access Level</label>
                      {isPremiumUser ? (
                        <select
                          value={addAccess}
                          onChange={(e) => setAddAccess(e.target.value)}
                          className="w-full text-sm px-4 py-2.5 bg-slate-50 border dark:bg-zinc-800 dark:border-zinc-800 text-slate-800 dark:text-zinc-100 rounded-xl focus:outline-none cursor-pointer"
                        >
                          <option value="Free" className="bg-white dark:bg-brand-midnight text-slate-800 dark:text-zinc-100">Free</option>
                          <option value="Premium" className="bg-white dark:bg-brand-midnight text-slate-800 dark:text-zinc-100">Premium</option>
                        </select>
                      ) : (
                        <div 
                          className="w-full px-4 py-2.5 text-xs bg-slate-100 text-slate-500 dark:bg-zinc-800 rounded-xl select-none cursor-not-allowed border flex items-center gap-1 font-sans"
                          title="Upgrade to Premium to create paid lessons."
                        >
                          <Info className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                          Disabled: Upgrade to Premium to create paid lessons.
                        </div>
                      )}
                    </div>

                  </div>

                  {/* Submission triggers */}
                  <div className="pt-6 border-t flex justify-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-3 text-sm font-bold text-white bg-brand-ocean hover:bg-brand-steel disabled:opacity-45 rounded-xl shadow cursor-pointer transition-colors"
                    >
                      {loading ? 'Submitting to database...' : 'Publish Wisdom'}
                    </button>
                  </div>

                </form>

              </motion.div>
            )}

            {/* TAB: MY LESSONS */}
            {activeTab === 'my-lessons' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-white dark:bg-zinc-900 border rounded-3xl p-6 sm:p-8 shadow-sm space-y-6"
              >
                <div>
                  <h2 className="text-xl font-bold font-sans">Manage publications</h2>
                  <p className="text-xs text-slate-400 mt-1">Review stats, toggle visibilities, or delete entries permanently.</p>
                </div>

                {myLessons.length === 0 ? (
                  <p className="text-sm text-slate-400 italic py-8">You haven't added any life lessons to the platform yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs sm:text-sm">
                      <thead>
                        <tr className="bg-slate-50/50 dark:bg-zinc-800/40 border-b border-slate-100 font-mono text-slate-400 text-[10px] uppercase">
                          <th className="py-3 px-4">Title / Info</th>
                          <th className="py-3 px-4">Stats</th>
                          <th className="py-3 px-4 text-center">Visibility</th>
                          <th className="py-3 px-4 text-center">Plan level</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                        {myLessons.map((l) => (
                          <tr key={l.id} className="hover:bg-slate-50/30">
                            <td className="py-4 px-4 pr-1">
                              <p className="font-bold text-slate-800 dark:text-zinc-200 line-clamp-1">{l.title}</p>
                              <p className="text-[10px] font-mono text-slate-400 mt-0.5">{l.category}</p>
                            </td>
                            <td className="py-4 px-4 font-mono text-xs text-slate-500 whitespace-nowrap">
                              <div className="space-y-0.5">
                                <p className="text-[10px] text-brand-steel font-sans">Created: {new Date(l.createdAt).toLocaleDateString()}</p>
                                <p className="text-[11px] font-mono font-medium text-brand-steel">Likes: {l.likesCount} • Saves: {l.savesCount}</p>
                              </div>
                            </td>
                            
                            {/* Toggle visibility */}
                            <td className="py-4 px-4 text-center">
                              <button
                                onClick={() => toggleVisibility(l)}
                                className={`px-2.5 py-1 rounded text-[10px] font-bold font-mono uppercase cursor-pointer border ${
                                  l.visibility === 'Public' 
                                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                                    : 'bg-rose-50 text-rose-500 border-rose-100'
                                }`}
                              >
                                {l.visibility}
                              </button>
                            </td>

                            {/* Toggle Access level */}
                            <td className="py-4 px-4 text-center whitespace-nowrap">
                              <button
                                onClick={() => toggleAccessLevel(l)}
                                className={`px-2.5 py-1 rounded text-[10px] font-bold font-mono uppercase cursor-pointer border ${
                                  l.accessLevel === 'Premium' 
                                    ? 'bg-brand-ocean/10 text-brand-ocean border-brand-ocean/20' 
                                    : 'bg-indigo-50 text-indigo-600 border-indigo-100'
                                }`}
                              >
                                {l.accessLevel === 'Premium' ? 'Premium' : 'Free'}
                              </button>
                            </td>

                            <td className="py-4 px-4 text-right whitespace-nowrap space-x-1.5 font-semibold">
                              <button
                                onClick={() => onNavigate(`/lessons/${l.id}`)}
                                className="p-1.5 text-slate-500 hover:text-indigo-600 cursor-pointer"
                                title="Inspect Details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              
                              {/* Open edit modal */}
                              <button
                                onClick={() => setEditingLesson({ ...l })}
                                className="p-1.5 text-slate-500 hover:text-amber-500 cursor-pointer"
                                title="Update Lesson"
                              >
                                <Edit className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => handleDeleteLesson(l.id)}
                                className="p-1.5 text-slate-500 hover:text-rose-500 cursor-pointer"
                                title="Purge Permanently"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

              </motion.div>
            )}

            {/* TAB: MY FAVORITES */}
            {activeTab === 'my-favorites' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-white dark:bg-zinc-900 border rounded-3xl p-6 sm:p-8 shadow-sm space-y-6"
              >
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div>
                    <h2 className="text-xl font-bold font-sans">Saved Wisdom List</h2>
                    <p className="text-xs text-slate-400 mt-1">Reflect on curated guidelines you favorited from other scholars.</p>
                  </div>
                  
                  {/* Category & Tone Quick Filters */}
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={favCategoryFilter}
                      onChange={(e) => { setFavCategoryFilter(e.target.value); }}
                      className="text-xs px-3 py-1.5 bg-slate-100 dark:bg-zinc-800 border rounded-lg cursor-pointer text-slate-800 dark:text-zinc-100 font-sans"
                    >
                      <option value="">All Categories</option>
                      <option value="Personal Growth">Personal Growth</option>
                      <option value="Career">Career</option>
                      <option value="Relationships">Relationships</option>
                      <option value="Mindset">Mindset</option>
                      <option value="Mistakes Learned">Mistakes Learned</option>
                    </select>

                    <select
                      value={favToneFilter}
                      onChange={(e) => { setFavToneFilter(e.target.value); }}
                      className="text-xs px-3 py-1.5 bg-slate-100 dark:bg-zinc-800 border rounded-lg cursor-pointer text-slate-800 dark:text-zinc-100 font-sans"
                    >
                      <option value="">All Emotional Tones</option>
                      <option value="Motivational">Motivational</option>
                      <option value="Sad">Sad</option>
                      <option value="Realization">Realization</option>
                      <option value="Gratitude">Gratitude</option>
                    </select>
                  </div>
                </div>

                {myFavorites.length === 0 ? (
                  <p className="text-sm text-slate-400 italic py-8">No saved favorites items match your filters.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs sm:text-sm">
                      <thead>
                        <tr className="bg-slate-50/50 dark:bg-zinc-800/40 border-b border-slate-100 font-mono text-slate-400 text-[10px] uppercase">
                          <th className="py-3 px-4">Lesson Header</th>
                          <th className="py-3 px-4">Author</th>
                          <th className="py-3 px-4">Category</th>
                          <th className="py-3 px-4">Tone</th>
                          <th className="py-3 px-4">Access Level</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                        {myFavorites.map((l) => (
                          <tr key={l.id} className="hover:bg-slate-50/30">
                            <td className="py-4 px-4 font-bold text-slate-850 dark:text-zinc-200">
                              {l.title}
                            </td>
                            <td className="py-4 px-4 text-xs font-semibold text-slate-500">
                              {l.creatorName}
                            </td>
                            <td className="py-4 px-4 font-mono text-[10px] text-indigo-600 dark:text-indigo-400">
                              {l.category}
                            </td>
                            <td className="py-4 px-4 font-sans text-xs text-slate-500">
                              <span className="px-2 py-0.5 bg-slate-105 dark:bg-zinc-800 rounded-md">
                                {l.emotionalTone}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase ${
                                l.accessLevel === 'Premium' 
                                  ? 'bg-brand-ocean/10 text-brand-ocean' 
                                  : 'bg-indigo-100 text-indigo-700'
                              }`}>
                                {l.accessLevel === 'Premium' ? 'Premium' : 'Free'}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-right whitespace-nowrap space-x-1 font-semibold text-xs">
                              <button
                                onClick={() => onNavigate(`/lessons/${l.id}`)}
                                className="px-3 py-1.5 text-indigo-600 hover:underline cursor-pointer"
                              >
                                See Details
                              </button>
                              <button
                                onClick={() => handleRemoveFavorite(l.id)}
                                className="px-3 py-1.5 text-rose-550 hover:underline cursor-pointer"
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </motion.div>
            )}

            {/* TAB: PROFILE & EDIT */}
            {activeTab === 'profile' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-8"
              >
                {/* Profile Overview Card */}
                <div className="bg-white dark:bg-zinc-900 border rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-center gap-6 justify-between animate-fade-in">
                  <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
                    <img
                      src={user?.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120'}
                      alt={user?.name}
                      className="w-20 h-20 rounded-2xl object-cover ring-4 ring-indigo-500/10 border-2 border-white dark:border-zinc-800"
                      referrerPolicy="no-referrer"
                    />
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                        <h2 className="text-xl font-extrabold font-sans text-slate-900 dark:text-white leading-tight">{user?.name}</h2>
                        {isPremiumUser ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold font-mono rounded-full bg-brand-ocean/10 text-brand-ocean dark:bg-brand-steel/15 dark:text-brand-steel border border-brand-ocean/20 dark:border-brand-steel/20 shadow-sm">
                            Premium
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold font-mono rounded-full bg-slate-100 text-slate-500 dark:bg-zinc-800 border shadow-sm">
                            Standard Scholar
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 font-mono">{user?.email}</p>
                      
                      {!isPremiumUser && (
                        <p className="text-[11px] text-slate-400 pt-1 font-semibold font-sans">
                          Standard Plan –{' '}
                          <button
                            onClick={() => onNavigate('/pricing')}
                            className="font-bold text-indigo-600 hover:underline cursor-pointer"
                          >
                            Upgrade to Premium
                          </button>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Profile Stats blocks */}
                  <div className="flex gap-4 border-t sm:border-t-0 md:border-l pt-4 md:pt-0 md:pl-8 w-full md:w-auto justify-around sm:justify-center">
                    <div className="text-center px-5 py-2.5 bg-brand-white dark:bg-brand-charcoal text-brand-charcoal dark:text-brand-white rounded-2xl min-w-[90px] border border-brand-steel/20 shadow-sm">
                      <p className="text-[10px] text-brand-steel font-mono uppercase font-bold tracking-wider">Lessons</p>
                      <p className="text-2xl font-extrabold font-sans text-brand-charcoal dark:text-brand-white mt-1">{myLessons.length}</p>
                    </div>
                    <div className="text-center px-5 py-2.5 bg-brand-white dark:bg-brand-charcoal text-brand-charcoal dark:text-brand-white rounded-2xl min-w-[90px] border border-brand-steel/20 shadow-sm">
                      <p className="text-[10px] text-brand-steel font-mono uppercase font-bold tracking-wider">Saved</p>
                      <p className="text-2xl font-extrabold font-sans text-brand-charcoal dark:text-brand-white mt-1">{myFavorites.length}</p>
                    </div>
                  </div>
                </div>

                {/* Manage info form */}
                <div className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                  <div>
                    <h2 className="text-lg font-bold font-sans text-slate-900 dark:text-white">Edit Profile Identity</h2>
                    <p className="text-xs text-slate-400 mt-1">Keep your credentials and avatar details synchronized (Email read-only).</p>
                  </div>

                  <form onSubmit={handleProfileUpdateSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      {/* Name */}
                      <div className="space-y-1">
                        <label className="text-xs font-mono font-bold text-slate-400 block uppercase">Display Name</label>
                        <input
                          type="text"
                          required
                          value={profileName}
                          onChange={(e) => setProfileName(e.target.value)}
                          className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-zinc-800 border dark:border-zinc-800 rounded-xl focus:outline-none text-slate-800 dark:text-zinc-100"
                        />
                      </div>

                      {/* Email (Read Only!) */}
                      <div className="space-y-1">
                        <label className="text-xs font-mono font-bold text-slate-400 block uppercase">Registered Email (Read-Only)</label>
                        <input
                          type="email"
                          readOnly
                          value={user?.email}
                          className="w-full px-4 py-2.5 text-sm bg-slate-100 text-slate-500 dark:bg-zinc-800 rounded-xl focus:outline-none cursor-not-allowed border border-slate-200 dark:border-zinc-700/60"
                        />
                      </div>

                    </div>

                    {/* Photo URL */}
                    <div className="space-y-1">
                      <label className="text-xs font-mono font-bold text-slate-400 block uppercase">Photo URL</label>
                      <input
                        type="url"
                        value={profilePhoto}
                        onChange={(e) => setProfilePhoto(e.target.value)}
                        className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-zinc-800 border dark:border-zinc-800 rounded-xl focus:outline-none text-slate-800 dark:text-zinc-100"
                      />
                    </div>

                    <div className="pt-4 flex justify-end">
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-5 py-2.5 text-xs font-bold text-white bg-brand-ocean hover:bg-brand-steel disabled:opacity-45 rounded-xl cursor-pointer shadow-sm transition-colors"
                      >
                        Save modifications
                      </button>
                    </div>

                  </form>
                </div>

                {/* Self public listings catalog */}
                <div className="space-y-6 pt-4">
                  <div>
                    <h3 className="text-lg font-bold font-sans text-slate-900 dark:text-white">All Public Wisdom Published by Me</h3>
                    <p className="text-xs text-slate-400 mt-1">These are the public elements currently live in the community catalog, sorted by newest first.</p>
                  </div>

                  {myLessons.filter((l) => l.visibility === 'Public').length === 0 ? (
                    <div className="p-12 text-center border bg-white dark:bg-zinc-900 rounded-2xl">
                      <p className="text-sm text-slate-400 italic">No public assets published yet. Change a lesson's visibility to 'Public' to display it here.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                      {myLessons
                        .filter((lesson) => lesson.visibility === 'Public')
                        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                        .map((lesson) => {
                          return (
                            <div
                              key={lesson.id}
                              className="flex flex-col h-full justify-between bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm relative transition-all hover:shadow-md group"
                            >
                              {/* Card Media Header */}
                              <div className="relative w-full h-40 bg-slate-100 dark:bg-zinc-850 overflow-hidden">
                                <img
                                  src={lesson.image || 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=600'}
                                  alt={lesson.title}
                                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                  referrerPolicy="no-referrer"
                                />
                                <span className="absolute top-4 left-4 px-2.5 py-1 text-[10px] font-bold font-mono uppercase bg-slate-900/80 text-white rounded-lg backdrop-blur">
                                  {lesson.category}
                                </span>
                                <span className={`absolute top-4 right-4 inline-flex px-2 py-1 text-[10px] font-bold rounded-lg ${
                                  lesson.accessLevel === 'Premium' 
                                    ? 'bg-brand-ocean text-white shadow-sm'
                                    : 'bg-indigo-650 text-white shadow-sm backdrop-blur'
                                }`}>
                                  {lesson.accessLevel === 'Premium' ? 'Premium' : 'Free'}
                                </span>
                              </div>

                              {/* Body Content */}
                              <div className="p-5 flex-1 flex flex-col justify-between">
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold py-0.5 px-2 bg-slate-100 dark:bg-zinc-800 rounded-md text-slate-500 dark:text-zinc-400 font-sans">
                                      {lesson.emotionalTone}
                                    </span>
                                    <span className="text-[10px] font-mono text-slate-400 font-bold">
                                      {new Date(lesson.createdAt).toLocaleDateString()}
                                    </span>
                                  </div>

                                  <h3 className="text-sm font-bold font-sans text-slate-900 dark:text-white leading-snug line-clamp-2">
                                    {lesson.title}
                                  </h3>

                                  <p className="text-xs text-slate-500 dark:text-zinc-450 line-clamp-3">
                                    {lesson.description}
                                  </p>
                                </div>

                                {/* Footer Author Row */}
                                <div className="mt-4 pt-4 border-t border-slate-50 dark:border-zinc-800 flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <img
                                      src={user?.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120'}
                                      alt={user?.name}
                                      className="w-7 h-7 rounded-full object-cover border"
                                      referrerPolicy="no-referrer"
                                    />
                                    <div className="text-xs max-w-[100px]">
                                      <p className="font-bold text-slate-705 dark:text-zinc-300 truncate">{user?.name}</p>
                                      <p className="text-[9px] text-slate-400">Author</p>
                                    </div>
                                  </div>

                                  <button
                                    onClick={() => onNavigate(`/lessons/${lesson.id}`)}
                                    className="px-3 py-1.5 text-xs font-bold rounded-lg bg-brand-ocean hover:bg-brand-steel text-white shadow-sm transition-all cursor-pointer"
                                  >
                                    See Details
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}

                </div>

              </motion.div>
            )}

            {/* TAB: ADMIN OVERVIEW */}
            {activeTab === 'admin' && user?.role === 'admin' && adminStats && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-8"
              >
                <div>
                  <span className="text-xs font-mono font-bold uppercase text-rose-500">Super Admin Gateway</span>
                  <h2 className="text-2xl font-bold font-sans mt-0.5">Platform Analytics Panel</h2>
                </div>

                {/* Grid stats */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 font-semibold">
                  
                  <div className="bg-white dark:bg-zinc-900 border rounded-2xl p-6 shadow-sm">
                    <p className="text-[10px] font-mono font-bold text-slate-405 uppercase">Total User base</p>
                    <p className="text-3xl font-bold font-mono mt-2">{adminStats.totalUsers}</p>
                  </div>

                  <div className="bg-white dark:bg-zinc-900 border rounded-2xl p-6 shadow-sm">
                    <p className="text-[10px] font-mono font-bold text-slate-400 uppercase">Live Public Lessons</p>
                    <p className="text-3xl font-bold font-mono mt-2">{adminStats.totalPublicLessons}</p>
                  </div>

                  <div className="bg-white dark:bg-zinc-900 border rounded-2xl p-6 shadow-sm">
                    <p className="text-[10px] font-mono font-bold text-slate-400 uppercase">Flagged Disputes</p>
                    <p className="text-3xl font-bold font-mono mt-2 text-rose-500">{adminStats.totalReports}</p>
                  </div>

                  <div className="bg-white dark:bg-zinc-900 border rounded-2xl p-6 shadow-sm">
                    <p className="text-[10px] font-mono font-bold text-slate-400 uppercase">Added Today</p>
                    <p className="text-3xl font-bold font-mono mt-2 text-indigo-600">{adminStats.todaysLessons}</p>
                  </div>

                </div>

                {/* Contributors & Visual Graphs Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  
                  {/* Top providers */}
                  <div className="bg-white dark:bg-zinc-900 border rounded-2xl p-6 shadow-sm space-y-4 md:col-span-1">
                    <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-slate-400">Top Plateform Contributors</h3>
                    
                    <div className="space-y-3">
                      {adminStats.activeContributors && adminStats.activeContributors.length > 0 ? (
                        adminStats.activeContributors.map((c, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-100 dark:border-zinc-800">
                            <div className="flex items-center gap-2">
                              <img src={c.photo} referrerPolicy="no-referrer" className="w-7 h-7 rounded-full object-cover border border-slate-200" />
                              <span className="text-xs font-bold truncate max-w-[120px]">{c.name}</span>
                            </div>
                            <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-200/50 dark:bg-zinc-700 px-1.5 py-0.5 rounded">{c.count} publ.</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-400 italic py-4 text-center">No active contributors found yet.</p>
                      )}
                    </div>
                  </div>

                  {/* User Growth Chart */}
                  <div className="bg-white dark:bg-zinc-900 border rounded-2xl p-6 shadow-sm space-y-4 md:col-span-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-slate-400">User Signups Growth</h3>
                        <p className="text-[10px] text-slate-400">Represented registry count history</p>
                      </div>
                      <span className="inline-flex items-center px-1.5 py-0.5 text-[9px] font-bold font-mono text-rose-600 bg-rose-50 rounded">Monthly</span>
                    </div>
                    {renderSVGChart([
                      { label: 'Jan', val: 5 },
                      { label: 'Feb', val: 18 },
                      { label: 'Mar', val: 34 },
                      { label: 'Apr', val: 62 },
                      { label: 'May', val: 89 },
                      { label: 'Jun', val: adminStats.totalUsers || 105 }
                    ], 'val', '#f43f5e', 'userGrowthGrad')}
                  </div>

                  {/* Lesson Growth Chart */}
                  <div className="bg-white dark:bg-zinc-900 border rounded-2xl p-6 shadow-sm space-y-4 md:col-span-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-slate-400">Lessons Growth</h3>
                        <p className="text-[10px] text-slate-400">Wisdom library volume history</p>
                      </div>
                      <span className="inline-flex items-center px-1.5 py-0.5 text-[9px] font-bold font-mono text-indigo-600 bg-indigo-50 rounded">Monthly</span>
                    </div>
                    {renderSVGChart([
                      { label: 'Jan', val: 2 },
                      { label: 'Feb', val: 9 },
                      { label: 'Mar', val: 21 },
                      { label: 'Apr', val: 39 },
                      { label: 'May', val: 54 },
                      { label: 'Jun', val: adminStats.totalPublicLessons || 75 }
                    ], 'val', '#6366f1', 'lessonGrowthGrad')}
                  </div>

                </div>

              </motion.div>
            )}

            {/* TAB: ADMIN MANAGE USERS */}
            {activeTab === 'admin-users' && user?.role === 'admin' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-white dark:bg-zinc-900 border rounded-3xl p-6 sm:p-8 shadow-sm space-y-6"
              >
                <div>
                  <h2 className="text-xl font-bold font-sans">Control User Accounts</h2>
                  <p className="text-xs text-slate-400 mt-1">Review register accounts, update administration privileges, or purge accounts.</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs sm:text-sm">
                    <thead>
                      <tr className="bg-slate-50/50 dark:bg-zinc-800/40 border-b border-slate-100 font-mono text-slate-404 text-[10px] uppercase">
                        <th className="py-3 px-4">Scholar name</th>
                        <th className="py-3 px-4">Email</th>
                        <th className="py-3 px-4">Role Permission</th>
                        <th className="py-3 px-4 text-center">Publications</th>
                        <th className="py-3 px-4 text-right">Settings</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-101 dark:divide-zinc-800">
                      {adminUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-50/30">
                          <td className="py-4 px-4 flex items-center gap-2">
                            <img src={u.photoURL} referrerPolicy="no-referrer" className="w-7 h-7 rounded-lg object-cover" />
                            <span className="font-bold">{u.name}</span>
                            {u.isPremium && (
                              <span className="px-1.5 py-0.5 text-[9px] font-bold font-mono rounded bg-brand-ocean/10 text-brand-ocean dark:bg-brand-steel/15 dark:text-brand-steel border border-brand-ocean/15" title="Premium Active">
                                Premium
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-4 font-mono text-slate-440">{u.email}</td>
                          <td className="py-4 px-4">
                            <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase ${u.role === 'admin' ? 'bg-rose-500/10 text-rose-500' : 'bg-slate-50 text-slate-500'}`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-center font-mono">{u.totalLessons}</td>
                          <td className="py-4 px-4 text-right whitespace-nowrap space-x-1 font-semibold">
                            <button
                              onClick={() => handlePromoteAdmin(u.id, u.role)}
                              className="px-2 py-1 text-xs font-bold border border-brand-steel/30 text-brand-ocean dark:text-brand-steel hover:bg-brand-steel/10 rounded-lg cursor-pointer transition-colors"
                            >
                              {u.role === 'admin' ? 'Revoke Admin' : 'Make Admin'}
                            </button>
                            <button
                              onClick={() => handleDeleteUserAccount(u.id)}
                              className="p-1 text-slate-400 hover:text-rose-500 cursor-pointer"
                              title="Delete Account"
                            >
                              <Trash2 className="w-4 h-4 inline" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

              </motion.div>
            )}

            {/* TAB: ADMIN MANAGE LESSONS */}
            {activeTab === 'admin-lessons' && user?.role === 'admin' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-white dark:bg-zinc-900 border rounded-3xl p-6 sm:p-8 shadow-sm space-y-6"
              >
                <div>
                  <h2 className="text-xl font-bold font-sans">Moderate wisdom pool</h2>
                  <p className="text-xs text-slate-400 mt-1">Control home page slide nominees, check contents, and trigger reviewed signals.</p>
                </div>

                {/* Grid summary stats inside Manage Lessons */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 font-semibold">
                  <div className="bg-slate-50 dark:bg-zinc-800 border border-slate-100 dark:border-zinc-800 rounded-2xl p-4 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-mono font-bold text-slate-400 dark:text-zinc-500 uppercase">Public Lessons</p>
                      <p className="text-2xl font-bold font-mono mt-1 text-slate-800 dark:text-zinc-100">
                        {adminLessons.filter(l => l.visibility === 'Public').length}
                      </p>
                    </div>
                    <BookOpen className="w-8 h-8 text-indigo-500/20" />
                  </div>

                  <div className="bg-slate-50 dark:bg-zinc-800 border border-slate-100 dark:border-zinc-800 rounded-2xl p-4 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-mono font-bold text-slate-400 dark:text-zinc-500 uppercase">Private Lessons</p>
                      <p className="text-2xl font-bold font-mono mt-1 text-slate-800 dark:text-zinc-100">
                        {adminLessons.filter(l => l.visibility === 'Private').length}
                      </p>
                    </div>
                    <Settings className="w-8 h-8 text-amber-500/20" />
                  </div>

                  <div className="bg-slate-50 dark:bg-zinc-800 border border-slate-100 dark:border-zinc-800 rounded-2xl p-4 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-mono font-bold text-slate-400 dark:text-zinc-500 uppercase">Flagged Content</p>
                      <p className="text-2xl font-bold font-mono mt-1 text-rose-500">
                        {new Set(adminReports.map(r => r.lessonId)).size}
                      </p>
                    </div>
                    <Flag className="w-8 h-8 text-rose-500/20" />
                  </div>
                </div>

                {/* Filter Controls Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 dark:bg-zinc-800 p-4 rounded-2xl border border-slate-100 dark:border-zinc-800">
                  <div>
                    <label className="block text-[10px] font-mono font-bold uppercase text-slate-400 mb-1">Filter Category</label>
                    <select
                      value={adminLessonCategoryFilter}
                      onChange={(e) => setAdminLessonCategoryFilter(e.target.value)}
                      className="w-full text-xs font-sans rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-750 px-3 py-2 cursor-pointer focus:outline-none focus:ring-1 focus:ring-rose-500"
                    >
                      <option value="">All Categories</option>
                      <option value="Personal Growth">Personal Growth</option>
                      <option value="Career">Career</option>
                      <option value="Relationships">Relationships</option>
                      <option value="Mindset">Mindset</option>
                      <option value="Mistakes Learned">Mistakes Learned</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono font-bold uppercase text-slate-400 mb-1">Filter Visibility</label>
                    <select
                      value={adminLessonVisibilityFilter}
                      onChange={(e) => setAdminLessonVisibilityFilter(e.target.value)}
                      className="w-full text-xs font-sans rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-750 px-3 py-2 cursor-pointer focus:outline-none focus:ring-1 focus:ring-rose-500"
                    >
                      <option value="">All Visibilities</option>
                      <option value="Public">Public</option>
                      <option value="Private">Private</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono font-bold uppercase text-slate-400 mb-1">Filter Flags</label>
                    <select
                      value={adminLessonFlagFilter}
                      onChange={(e) => setAdminLessonFlagFilter(e.target.value)}
                      className="w-full text-xs font-sans rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-750 px-3 py-2 cursor-pointer focus:outline-none focus:ring-1 focus:ring-rose-500"
                    >
                      <option value="">All Content</option>
                      <option value="flagged">Flagged / Reported Only</option>
                      <option value="unflagged">Unflagged Only</option>
                    </select>
                  </div>
                </div>

                {/* Filter Calculation */}
                {(() => {
                  const filteredAdminLessons = adminLessons.filter((l) => {
                    if (adminLessonCategoryFilter && l.category !== adminLessonCategoryFilter) return false;
                    if (adminLessonVisibilityFilter && l.visibility !== adminLessonVisibilityFilter) return false;
                    
                    const isFlagged = adminReports.some((r) => r.lessonId === l.id);
                    if (adminLessonFlagFilter === 'flagged' && !isFlagged) return false;
                    if (adminLessonFlagFilter === 'unflagged' && isFlagged) return false;
                    
                    return true;
                  });

                  if (filteredAdminLessons.length === 0) {
                    return (
                      <p className="text-center text-sm text-slate-400 italic py-8 border border-dashed rounded-2xl">
                        No platform wisdom publications match the specified filters. Try refining your filters above.
                      </p>
                    );
                  }

                  return (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs sm:text-sm">
                        <thead>
                          <tr className="bg-slate-50/50 dark:bg-zinc-800/40 border-b border-slate-100 font-mono text-slate-405 text-[10px] uppercase">
                            <th className="py-3 px-4">Title / Author</th>
                            <th className="py-3 px-4">Category</th>
                            <th className="py-3 px-4 text-center">Status Vetted</th>
                            <th className="py-3 px-4 text-center">Featured Slide</th>
                            <th className="py-3 px-4 text-right">Moderations</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                          {filteredAdminLessons.map((l) => {
                            const hasFlag = adminReports.some(r => r.lessonId === l.id);
                            return (
                              <tr key={l.id} className={`hover:bg-slate-50/30 transition-colors ${hasFlag ? 'bg-rose-500/5 hover:bg-rose-500/10' : ''}`}>
                                <td className="py-4 px-4 flex-1">
                                  <div className="flex items-center gap-1.5">
                                    <p className="font-bold line-clamp-1">{l.title}</p>
                                    {hasFlag && (
                                      <span className="px-1.5 py-0.5 text-[8px] font-mono font-bold bg-rose-500 text-white rounded animate-pulse">FLAGGED</span>
                                    )}
                                  </div>
                                  <p className="text-[10px] text-slate-400 font-mono">By: {l.creatorName}</p>
                                </td>
                                <td className="py-4 px-4 font-mono text-xs">{l.category}</td>
                                <td className="py-4 px-4 text-center">
                                  {l.isReviewed ? (
                                    <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[10px] font-bold border border-emerald-100 font-mono uppercase">Vetted</span>
                                  ) : (
                                    <button
                                      onClick={() => handleMarkReviewed(l.id)}
                                      className="px-2 py-0.5 bg-brand-ocean text-white rounded text-[10px] font-bold font-mono hover:bg-brand-steel cursor-pointer transition-colors"
                                    >
                                      Vet Review
                                    </button>
                                  )}
                                </td>
                                
                                {/* Featured toggle */}
                                <td className="py-4 px-4 text-center font-semibold">
                                  <button
                                    onClick={() => handleToggleFeatured(l)}
                                    className={`px-2 py-1 rounded text-[10px] font-bold font-mono border cursor-pointer ${
                                      l.isFeatured
                                        ? 'bg-amber-50 border-amber-100 text-amber-600'
                                        : 'bg-slate-50 hover:bg-slate-100 border-slate-100 text-slate-450'
                                    }`}
                                  >
                                    {l.isFeatured ? 'Nominated' : 'Nominate'}
                                  </button>
                                </td>

                                <td className="py-4 px-4 text-right whitespace-nowrap space-x-1.5 font-semibold">
                                  <button
                                    onClick={() => onNavigate(`/lessons/${l.id}`)}
                                    className="p-1 text-slate-400 hover:text-indigo-600 cursor-pointer"
                                  >
                                    <Eye className="w-4 h-4 inline" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteLesson(l.id)}
                                    className="p-1 text-slate-400 hover:text-rose-500 cursor-pointer"
                                  >
                                    <Trash2 className="w-4 h-4 inline" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  );
                })()}

              </motion.div>
            )}

            {/* TAB: ADMIN REPORTED DISPUTES */}
            {activeTab === 'admin-reports' && user?.role === 'admin' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-white dark:bg-zinc-900 border rounded-3xl p-6 sm:p-8 shadow-sm space-y-6"
              >
                <div>
                  <h2 className="text-xl font-bold font-sans">Reported Flagged Compliance</h2>
                  <p className="text-xs text-slate-400 mt-1">Inspect reported lesson issues submitted by platform members.</p>
                </div>

                {(() => {
                  // Group administrative compliance reports by lesson ID
                  const groupedReports = Object.values(
                    adminReports.reduce((acc, report) => {
                      const { lessonId, lessonTitle, reporterEmail, reason, id, timestamp } = report;
                      if (!acc[lessonId]) {
                        acc[lessonId] = {
                          lessonId,
                          lessonTitle,
                          reports: [],
                        };
                      }
                      acc[lessonId].reports.push({ id, reporterEmail, reason, timestamp });
                      return acc;
                    }, {})
                  );

                  if (groupedReports.length === 0) {
                    return (
                      <p className="text-center text-sm text-slate-450 italic py-8 border border-dashed rounded-2xl">
                        Great work! The compliance reports dashboard is completely clear.
                      </p>
                    );
                  }

                  return (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs sm:text-sm">
                        <thead>
                          <tr className="bg-slate-50/50 dark:bg-zinc-800/40 border-b border-slate-100 font-mono text-slate-400 text-[10px] uppercase">
                            <th className="py-3 px-4">Reported Lesson Title</th>
                            <th className="py-3 px-4 text-center">Flags Count</th>
                            <th className="py-3 px-4">Latest Indicator</th>
                            <th className="py-3 px-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-101 dark:divide-zinc-800">
                          {groupedReports.map((g) => {
                            const latestReason = g.reports[g.reports.length - 1]?.reason || 'Flagged';
                            return (
                              <tr key={g.lessonId} className="hover:bg-rose-500/5 transition-colors">
                                <td className="py-4 px-4 font-bold max-w-[200px] truncate">{g.lessonTitle || 'Untitled Publication'}</td>
                                <td className="py-4 px-4 text-center">
                                  <span className="inline-flex px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 font-mono text-xs font-bold">
                                    {g.reports.length}
                                  </span>
                                </td>
                                <td className="py-4 px-4 text-xs font-semibold text-rose-500/80">{latestReason}</td>
                                <td className="py-4 px-4 text-right whitespace-nowrap space-x-2 font-semibold">
                                  
                                  {/* Opened details in modal showing all reasons and reporters */}
                                  <button
                                    onClick={() => setActiveReportDetails(g.reports)}
                                    className="px-2.5 py-1 text-xs border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-850 rounded-lg cursor-pointer"
                                  >
                                    View reasons ({g.reports.length})
                                  </button>

                                  <button
                                    onClick={() => handleIgnoreReport(g.lessonId)}
                                    className="px-2.5 py-1 text-xs border border-brand-steel/30 text-brand-ocean dark:text-brand-steel hover:bg-brand-steel/10 rounded-lg cursor-pointer font-bold transition-colors"
                                  >
                                    Ignore
                                  </button>
                                  
                                  <button
                                    onClick={() => handleDeleteLesson(g.lessonId)}
                                    className="p-1 hover:text-rose-500 text-slate-450 cursor-pointer inline-flex items-center"
                                    title="Delete Lesson"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  );
                })()}

              </motion.div>
            )}

            {/* TAB: ADMIN PROFILE */}
            {activeTab === 'admin-profile' && user?.role === 'admin' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-8"
              >
                {/* Admin Role Badge & Info Block */}
                <div className="md:col-span-1 space-y-6">
                  <div className="bg-gradient-to-br from-rose-500 to-red-600 rounded-3xl p-6 text-white text-center shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full translate-x-12 -translate-y-12" />
                    
                    <img
                      src={profilePhoto || user?.photoURL}
                      alt={user?.name}
                      className="w-20 h-20 rounded-full mx-auto object-cover border-4 border-white/20 shadow-md mb-4"
                      referrerPolicy="no-referrer"
                    />
                    
                    <h3 className="font-bold text-lg font-sans line-clamp-1">{user?.name}</h3>
                    <p className="text-xs text-white/80 font-mono mt-1 break-all">{user?.email}</p>
                    
                    <div className="mt-6 inline-flex px-3 py-1 bg-white/10 rounded-full text-xs font-bold font-mono tracking-wide">
                      SYSTEM ADMIN
                    </div>
                  </div>

                  <div className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-4">
                    <h4 className="text-xs font-bold uppercase font-mono text-slate-400">Activity Summary</h4>
                    
                    <div className="space-y-3 font-semibold text-xs">
                      <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-zinc-800">
                        <span className="text-slate-500">Lessons Reviewed</span>
                        <span className="font-mono text-emerald-600 font-bold">{adminLessons.filter(l => l.isReviewed).length}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-zinc-800">
                        <span className="text-slate-500">Nominated Slides</span>
                        <span className="font-mono text-amber-500 font-bold">{adminLessons.filter(l => l.isFeatured).length}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-zinc-800">
                        <span className="text-slate-500">Total System Users</span>
                        <span className="font-mono text-indigo-500 font-bold">{adminUsers.length || 6}</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-slate-500">Clearance Badge</span>
                        <span className="font-mono text-rose-500 font-bold">Root Master</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Update Details Form */}
                <div className="md:col-span-2 bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                  <div>
                    <h2 className="text-xl font-bold font-sans">Admin Settings</h2>
                    <p className="text-xs text-slate-400 mt-1">Configure your personal credentials on the Scholar platform.</p>
                  </div>

                  <form onSubmit={handleProfileUpdateSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono font-bold text-slate-450 block uppercase">Display Name</label>
                      <input
                        type="text"
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        className="w-full text-xs font-sans rounded-xl bg-slate-50 dark:bg-zinc-850 border dark:border-zinc-850 px-4 py-3 focus:outline-none focus:ring-1 focus:ring-rose-500 font-semibold"
                        required
                        placeholder="Admin Display Name"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-mono font-bold text-slate-450 block uppercase">Avatar Photo URL</label>
                      <input
                        type="text"
                        value={profilePhoto}
                        onChange={(e) => setProfilePhoto(e.target.value)}
                        className="w-full text-xs font-mono rounded-xl bg-slate-50 dark:bg-zinc-850 border dark:border-zinc-850 px-4 py-3 focus:outline-none focus:ring-1 focus:ring-rose-500"
                        placeholder="https://example.com/photo.jpg"
                      />
                    </div>

                    <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 flex justify-end">
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2.5 text-xs font-bold font-mono tracking-wide text-white bg-brand-ocean hover:bg-brand-steel disabled:opacity-50 rounded-xl cursor-pointer shadow-md shadow-brand-ocean/15 transition-colors"
                      >
                        {loading ? 'Saving credentials...' : 'Update Admin Identity'}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            )}

          </AnimatePresence>

        </div>
      </div>

      {/* UPDATE LESSON PORTAL MODAL DIALOG */}
      {editingLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-250">
          <div className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-3xl w-full max-w-2xl p-6 sm:p-8 space-y-6 shadow-xl overflow-y-auto max-h-[90vh] animate-in zoom-in-95 duration-150">
            
            <div className="flex justify-between items-center pb-4 border-b">
              <h2 className="text-lg font-bold font-sans">Update Wisdom Publications Details</h2>
              <button
                onClick={() => setEditingLesson(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer text-sm font-sans"
              >
                ✕ Close
              </button>
            </div>

            {/* Read-Only Creator Info Block to validate: All fields editable except User Name & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-dashed border-slate-100 dark:border-zinc-800">
              <div className="space-y-1">
                <label className="text-xs font-mono font-bold text-slate-450 block uppercase">Author Name (Read-Only)</label>
                <div className="px-4 py-2 text-xs bg-slate-100 dark:bg-zinc-850 text-slate-500 dark:text-zinc-400 rounded-xl select-none font-sans font-bold">
                  {user?.name}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-mono font-bold text-slate-450 block uppercase">Author Email (Read-Only)</label>
                <div className="px-4 py-2 text-xs bg-slate-100 dark:bg-zinc-850 text-slate-500 dark:text-zinc-400 rounded-xl select-none font-mono">
                  {user?.email}
                </div>
              </div>
            </div>

            <form onSubmit={handleUpdateLessonSubmit} className="space-y-4">
              
              {/* Title */}
              <div className="space-y-1">
                <label className="text-xs font-mono font-bold text-slate-400 block uppercase">Title</label>
                <input
                  type="text"
                  required
                  value={editingLesson.title}
                  onChange={(e) => setEditingLesson({ ...editingLesson, title: e.target.value })}
                  className="w-full px-4 py-2 text-sm bg-slate-50 dark:bg-zinc-800 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-505"
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-mono font-bold text-slate-400 block uppercase font-sans">Wisdom Description Narrative</label>
                <textarea
                  required
                  rows={5}
                  value={editingLesson.description}
                  onChange={(e) => setEditingLesson({ ...editingLesson, description: e.target.value })}
                  className="w-full text-sm p-4 bg-slate-50 dark:bg-zinc-800 border rounded-xl focus:outline-none"
                />
              </div>

              {/* Category & Tone */}
              <div className="grid grid-cols-2 gap-4 font-semibold">
                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold text-slate-400 block uppercase">Category</label>
                  <select
                    value={editingLesson.category}
                    onChange={(e) => setEditingLesson({ ...editingLesson, category: e.target.value })}
                    className="w-full text-xs px-4 py-2 bg-slate-50 border border-slate-200 dark:border-zinc-700/60 dark:bg-zinc-800 rounded-xl focus:outline-none text-slate-800 dark:text-zinc-100"
                  >
                    <option value="Personal Growth" className="bg-white dark:bg-brand-midnight text-slate-800 dark:text-zinc-100">Personal Growth</option>
                    <option value="Career" className="bg-white dark:bg-brand-midnight text-slate-800 dark:text-zinc-100">Career</option>
                    <option value="Relationships" className="bg-white dark:bg-brand-midnight text-slate-800 dark:text-zinc-100">Relationships</option>
                    <option value="Mindset" className="bg-white dark:bg-brand-midnight text-slate-800 dark:text-zinc-100">Mindset</option>
                    <option value="Mistakes Learned" className="bg-white dark:bg-brand-midnight text-slate-800 dark:text-zinc-100">Mistakes Learned</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold text-slate-400 block uppercase">Emotional Tone</label>
                  <select
                    value={editingLesson.emotionalTone}
                    onChange={(e) => setEditingLesson({ ...editingLesson, emotionalTone: e.target.value })}
                    className="w-full text-xs px-4 py-2 bg-slate-50 border border-slate-200 dark:border-zinc-700/60 dark:bg-zinc-800 rounded-xl focus:outline-none text-slate-800 dark:text-zinc-100"
                  >
                    <option value="Motivational" className="bg-white dark:bg-brand-midnight text-slate-800 dark:text-zinc-100">Motivational</option>
                    <option value="Sad" className="bg-white dark:bg-brand-midnight text-slate-800 dark:text-zinc-100">Sad</option>
                    <option value="Realization" className="bg-white dark:bg-brand-midnight text-slate-800 dark:text-zinc-100">Realization</option>
                    <option value="Gratitude" className="bg-white dark:bg-brand-midnight text-slate-800 dark:text-zinc-100">Gratitude</option>
                  </select>
                </div>
              </div>

              {/* Cover Image & Visibility */}
              <div className="grid grid-cols-3 gap-4 font-semibold font-sans">
                <div className="col-span-2 space-y-1">
                  <label className="text-xs font-mono font-bold text-slate-400 block uppercase">Cover Image Link</label>
                  <input
                    type="url"
                    value={editingLesson.image || ''}
                    onChange={(e) => setEditingLesson({ ...editingLesson, image: e.target.value })}
                    className="w-full px-4 py-2 text-xs bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700/60 text-slate-800 dark:text-zinc-100 rounded-xl focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold text-slate-400 block uppercase">Visibility</label>
                  <select
                    value={editingLesson.visibility}
                    onChange={(e) => setEditingLesson({ ...editingLesson, visibility: e.target.value })}
                    className="w-full text-xs px-4 py-2 bg-slate-50 border border-slate-200 dark:border-zinc-700/60 dark:bg-zinc-800 rounded-xl focus:outline-none text-slate-800 dark:text-zinc-100"
                  >
                    <option value="Public" className="bg-white dark:bg-brand-midnight text-slate-800 dark:text-zinc-100">Public</option>
                    <option value="Private" className="bg-white dark:bg-brand-midnight text-slate-800 dark:text-zinc-100">Private</option>
                  </select>
                </div>
              </div>

              {/* Access gates */}
              <div className="space-y-1 border-t pt-4 font-semibold font-sans">
                <label className="text-xs font-mono font-bold text-slate-400 block uppercase">Access Level</label>
                {isPremiumUser ? (
                  <select
                    value={editingLesson.accessLevel}
                    onChange={(e) => setEditingLesson({ ...editingLesson, accessLevel: e.target.value })}
                    className="w-full text-xs px-4 py-2.5 bg-slate-50 border border-slate-200 dark:border-zinc-700/60 dark:bg-zinc-800 rounded-xl focus:outline-none cursor-pointer text-slate-800 dark:text-zinc-100"
                  >
                    <option value="Free" className="bg-white dark:bg-brand-midnight text-slate-800 dark:text-zinc-100">Free</option>
                    <option value="Premium" className="bg-white dark:bg-brand-midnight text-slate-800 dark:text-zinc-100">Premium</option>
                  </select>
                ) : (
                  <div 
                    className="w-full px-4 py-2.5 text-xs bg-slate-100 text-slate-500 dark:bg-zinc-800 rounded-xl select-none cursor-not-allowed border border-slate-200 dark:border-zinc-700/60 flex items-center gap-1 font-sans"
                    title="Upgrade to Premium to create paid lessons."
                  >
                    <Info className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                    Disabled: Upgrade to Premium to create paid lessons.
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t font-sans font-semibold">
                <button
                  type="button"
                  onClick={() => setEditingLesson(null)}
                  className="px-4 py-2 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-zinc-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-brand-ocean text-white hover:bg-brand-steel rounded-xl cursor-pointer transition-colors"
                >
                  Save modifications
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ADMIN REPORT REASONS INSPECTOR MODAL */}
      {activeReportDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-250">
          <div className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-3xl w-full max-w-md p-6 sm:p-8 space-y-6 shadow-xl animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold font-sans">Dispute Compliance Records</h2>
              <button
                onClick={() => setActiveReportDetails(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer text-sm font-sans"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-xs font-mono font-bold text-slate-400">Total reported flags: {activeReportDetails.length}</p>
              
              <div className="space-y-3 max-h-[50vh] overflow-y-auto">
                {activeReportDetails.map((report) => (
                  <div key={report.id} className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/10 space-y-1 text-xs">
                    <p className="font-bold text-rose-600 font-sans">Option: {report.reason}</p>
                    <p className="text-slate-400 font-mono text-[10px]">Reporter: {report.reporterEmail}</p>
                    <p className="text-slate-400 text-[10px] font-mono">Timestamp: {new Date(report.timestamp).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t">
              <button
                onClick={() => setActiveReportDetails(null)}
                className="px-4 py-2 text-xs font-bold bg-slate-900 hover:bg-slate-850 text-white dark:bg-white dark:text-slate-950 rounded-xl cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
