/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home as HomeIcon, 
  Bookmark, 
  CheckSquare, 
  PenTool, 
  User, 
  Share2, 
  Heart,
  Plus,
  Trash2,
  ChevronRight,
  Bell,
  Settings as SettingsIcon,
  Cross,
  Facebook,
  Star,
  Zap,
  Users
} from 'lucide-react';
import { Tab, Quote, ChecklistItem, JournalEntry, Comment } from './types';
import { INITIAL_QUOTES, INITIAL_DO_CHECKLIST, INITIAL_DONT_CHECKLIST, INITIAL_COMMENTS } from './constants';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [doList, setDoList] = useState<ChecklistItem[]>(INITIAL_DO_CHECKLIST);
  const [dontList, setDontList] = useState<ChecklistItem[]>(INITIAL_DONT_CHECKLIST);
  const [journal, setJournal] = useState<JournalEntry[]>([]);
  const [comments, setComments] = useState<Comment[]>(INITIAL_COMMENTS);
  const [showNotificationToast, setShowNotificationToast] = useState(false);

  // Persistence
  useEffect(() => {
    const savedBookmarks = localStorage.getItem('bookmarks');
    if (savedBookmarks) setBookmarks(JSON.parse(savedBookmarks));

    const savedDoList = localStorage.getItem('doList');
    if (savedDoList) setDoList(JSON.parse(savedDoList));

    const savedDontList = localStorage.getItem('dontList');
    if (savedDontList) setDontList(JSON.parse(savedDontList));

    const savedJournal = localStorage.getItem('journal');
    if (savedJournal) setJournal(JSON.parse(savedJournal));

    const savedComments = localStorage.getItem('comments');
    if (savedComments) setComments(JSON.parse(savedComments));
  }, []);

  useEffect(() => {
    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  useEffect(() => {
    localStorage.setItem('doList', JSON.stringify(doList));
  }, [doList]);

  useEffect(() => {
    localStorage.setItem('dontList', JSON.stringify(dontList));
  }, [dontList]);

  useEffect(() => {
    localStorage.setItem('journal', JSON.stringify(journal));
  }, [journal]);

  useEffect(() => {
    localStorage.setItem('comments', JSON.stringify(comments));
  }, [comments]);

  const toggleBookmark = (id: string) => {
    setBookmarks(prev => 
      prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]
    );
  };

  const shareQuote = (quote: Quote) => {
    if (navigator.share) {
      navigator.share({
        title: 'Christian Dating Inspiration',
        text: `"${quote.text}" - ${quote.reference}`,
        url: window.location.href,
      }).catch(console.error);
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(`"${quote.text}" - ${quote.reference}`);
      setShowNotificationToast(true);
      setTimeout(() => setShowNotificationToast(false), 2000);
    }
  };

  const addComment = (text: string) => {
    const newComment: Comment = {
      id: Date.now().toString(),
      userName: 'You', // In a real app, this would be the logged in user's name
      text,
      timestamp: new Date().toISOString()
    };
    setComments(prev => [newComment, ...prev]);
  };

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto bg-brand-white relative overflow-hidden">
      {/* Bento Header */}
      <header className="px-6 pt-8 pb-4 flex justify-between items-center bg-brand-white z-10">
        <div className="text-xl font-extrabold tracking-tighter uppercase leading-none">
          Christian Dating<br />
          <span className="text-brand-orange text-2xl">Do's & Dont's</span>
        </div>
        <div className="flex gap-3">
          <button className="w-10 h-10 border-2 border-brand-black rounded-xl flex items-center justify-center bg-white hover:bg-neutral-50 transition-colors">
            <Bell size={20} />
          </button>
          <button onClick={() => setActiveTab('profile')} className="w-10 h-10 border-2 border-brand-black rounded-xl flex items-center justify-center bg-white hover:bg-neutral-50 transition-colors">
            <SettingsIcon size={20} />
          </button>
        </div>
      </header>

      {/* Toast Notification */}
      <AnimatePresence>
        {showNotificationToast && (
          <motion.div 
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 20, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="absolute top-0 left-0 right-0 z-50 flex justify-center px-4"
          >
            <div className="bg-neutral-900 text-white px-6 py-2 rounded-full text-sm font-medium shadow-lg">
              Copied to clipboard!
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-24 px-6 pt-4">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <HomeTab 
              quotes={INITIAL_QUOTES} 
              bookmarks={bookmarks} 
              onToggleBookmark={toggleBookmark}
              onShare={shareQuote}
              comments={comments}
              onAddComment={addComment}
            />
          )}
          {activeTab === 'bookmarks' && (
            <BookmarksTab 
              quotes={INITIAL_QUOTES} 
              bookmarks={bookmarks} 
              onToggleBookmark={toggleBookmark}
              onShare={shareQuote}
            />
          )}
          {activeTab === 'checklist' && (
            <ChecklistTab 
              doList={doList} 
              dontList={dontList} 
              onToggleDo={(id) => setDoList(prev => prev.map(i => i.id === id ? { ...i, completed: !i.completed } : i))}
              onToggleDont={(id) => setDontList(prev => prev.map(i => i.id === id ? { ...i, completed: !i.completed } : i))}
              onAddDo={(text) => setDoList(prev => [...prev, { id: Date.now().toString(), text, type: 'do', completed: false }])}
              onAddDont={(text) => setDontList(prev => [...prev, { id: Date.now().toString(), text, type: 'dont', completed: false }])}
            />
          )}
          {activeTab === 'journal' && (
            <JournalTab 
              entries={journal}
              onAddEntry={(title, content) => setJournal(prev => [{ id: Date.now().toString(), title, content, date: new Date().toISOString() }, ...prev])}
              onDeleteEntry={(id) => setJournal(prev => prev.filter(e => e.id !== id))}
            />
          )}
          {activeTab === 'profile' && <ProfileTab />}
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t-2 border-brand-black px-4 py-3 pb-6 flex justify-around items-center z-40">
        <NavButton icon={<HomeIcon size={22} />} label="Daily" active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
        <NavButton icon={<Bookmark size={22} />} label="Saved" active={activeTab === 'bookmarks'} onClick={() => setActiveTab('bookmarks')} />
        <NavButton icon={<CheckSquare size={22} />} label="Checklist" active={activeTab === 'checklist'} onClick={() => setActiveTab('checklist')} />
        <NavButton icon={<PenTool size={22} />} label="Notes" active={activeTab === 'journal'} onClick={() => setActiveTab('journal')} />
        <NavButton icon={<User size={22} />} label="Stats" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
      </nav>
    </div>
  );
}

// Sub-components

function NavButton({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center gap-1 transition-all ${active ? 'text-brand-orange' : 'text-neutral-400'}`}
    >
      <div className={`p-2 rounded-xl border-2 transition-all ${active ? 'border-brand-black bg-brand-orange/5 shadow-[2px_2px_0px_#141414]' : 'border-transparent'}`}>
        {icon}
      </div>
      <span className="text-[9px] font-bold uppercase tracking-tight">{label}</span>
    </button>
  );
}

function HomeTab({ quotes, bookmarks, onToggleBookmark, onShare, comments, onAddComment }: { quotes: Quote[], bookmarks: string[], onToggleBookmark: (id: string) => void, onShare: (q: Quote) => void, comments: Comment[], onAddComment: (text: string) => void }) {
  const dailyQuote = quotes[0];
  const pastQuotes = quotes.slice(1, 3);
  const [newComment, setNewComment] = useState('');

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      className="grid grid-cols-2 gap-4 pb-12"
    >
      <div className="col-span-2">
        <QuoteCard 
          quote={dailyQuote} 
          isBookmarked={bookmarks.includes(dailyQuote.id)} 
          onToggleBookmark={() => onToggleBookmark(dailyQuote.id)}
          onShare={() => onShare(dailyQuote)}
          variant="large"
        />
      </div>

      <div className="col-span-1 bento-card bg-brand-gray border-dashed">
        <div className="bento-title">Next Word</div>
        <div className="flex-1 flex flex-col justify-center items-center text-center py-4">
          <span className="text-3xl font-black text-brand-black/10">14:22</span>
          <span className="text-[10px] uppercase font-bold text-neutral-400">Time to wait</span>
        </div>
      </div>

      <div className="col-span-1 bento-card bg-brand-black text-brand-white">
        <div className="bento-title !text-brand-white after:bg-brand-white">Growth</div>
        <div className="flex-1 flex flex-col justify-center items-center">
          <span className="text-2xl font-black text-brand-orange">85%</span>
          <span className="text-[10px] uppercase font-bold text-brand-white/50">Goal Reached</span>
        </div>
      </div>

      <div className="col-span-2">
        <div className="flex justify-between items-center mb-4 px-2">
          <div className="text-[13px] font-black uppercase tracking-wider flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-brand-black rounded-full" />
            Recently Shared
          </div>
          <ChevronRight size={16} />
        </div>
        <div className="space-y-4">
          {pastQuotes.map(q => (
            <QuoteCard 
              key={q.id}
              quote={q} 
              isBookmarked={bookmarks.includes(q.id)} 
              onToggleBookmark={() => onToggleBookmark(q.id)}
              onShare={() => onShare(q)}
              variant="small"
            />
          ))}
        </div>
      </div>

      <div className="col-span-2 bento-card bg-brand-white border-brand-black shadow-[4px_4px_0px_#FF6321]">
        <div className="bento-title">Community Talk</div>
        <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto no-scrollbar pr-2">
          {comments.map(comment => (
            <div key={comment.id} className="flex flex-col gap-1 bento-card !p-4 !rounded-xl bg-brand-gray/50 border-brand-black/5">
              <div className="flex justify-between items-center">
                <span className="font-black text-[10px] uppercase tracking-widest text-brand-orange">{comment.userName}</span>
                <span className="text-[8px] text-neutral-400 font-bold">
                  {new Date(comment.timestamp).toLocaleDateString()}
                </span>
              </div>
              <p className="text-[13px] font-medium leading-tight text-neutral-700">
                {comment.text}
              </p>
            </div>
          ))}
          {comments.length === 0 && (
            <p className="text-center text-neutral-400 text-xs py-4 font-bold uppercase tracking-widest">Be the first to share a thought 🙏</p>
          )}
        </div>
        
        <div className="relative">
          <input 
            type="text" 
            placeholder="Share a thought or testimony..."
            className="w-full bg-brand-white border-2 border-brand-black rounded-xl py-3 px-4 pr-12 font-bold text-sm tracking-tight placeholder:text-neutral-300 focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && newComment.trim()) {
                onAddComment(newComment);
                setNewComment('');
              }
            }}
          />
          <button 
            onClick={() => {
              if (newComment.trim()) {
                onAddComment(newComment);
                setNewComment('');
              }
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-brand-black text-white rounded-lg active:scale-95 transition-transform"
          >
            <Plus size={18} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function BookmarksTab({ quotes, bookmarks, onToggleBookmark, onShare }: { quotes: Quote[], bookmarks: string[], onToggleBookmark: (id: string) => void, onShare: (q: Quote) => void }) {
  const bookmarkedQuotes = quotes.filter(q => bookmarks.includes(q.id));

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <h1 className="text-4xl font-serif font-bold">Your Favorites</h1>
      
      {bookmarkedQuotes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-neutral-400">
          <Bookmark size={48} className="mb-4 opacity-20" />
          <p className="font-medium text-lg">No saved quotes yet</p>
          <p className="text-sm">Tap the bookmark icon on any card to save it.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {bookmarkedQuotes.map(q => (
            <QuoteCard 
              key={q.id}
              quote={q} 
              isBookmarked={true} 
              onToggleBookmark={() => onToggleBookmark(q.id)}
              onShare={() => onShare(q)}
              variant="medium"
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}

function ChecklistTab({ doList, dontList, onToggleDo, onToggleDont, onAddDo, onAddDont }: any) {
  const [activeTab, setActiveTab] = useState<'do' | 'dont'>('do');
  const [newItemText, setNewItemText] = useState('');

  const completedCount = doList.filter((i: any) => i.completed).length + dontList.filter((i: any) => i.completed).length;
  const totalCount = doList.length + dontList.length;
  const progress = (completedCount / totalCount) * 100;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      className="space-y-6"
    >
      <div className="bento-card bg-brand-orange text-brand-white border-brand-black shadow-[4px_4px_0px_#141414]">
        <div className="bento-title !text-brand-white after:bg-brand-white">Evaluation</div>
        <h2 className="text-3xl font-black leading-none mb-6">Dating Checklist</h2>
        <div className="space-y-3">
          <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
            <span>{completedCount}/{totalCount} Goals</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-3 w-full bg-brand-white/20 rounded-full overflow-hidden border border-brand-black/20">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-brand-white"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button 
          onClick={() => setActiveTab('do')}
          className={`flex-1 py-3 px-4 rounded-xl border-2 font-black text-sm uppercase tracking-wider transition-all ${activeTab === 'do' ? 'bg-brand-black text-brand-white border-brand-black shadow-[3px_3px_0px_#FF6321]' : 'bg-brand-white text-brand-black border-brand-black'}`}
        >
          Do's
        </button>
        <button 
          onClick={() => setActiveTab('dont')}
          className={`flex-1 py-3 px-4 rounded-xl border-2 font-black text-sm uppercase tracking-wider transition-all ${activeTab === 'dont' ? 'bg-brand-black text-brand-white border-brand-black shadow-[3px_3px_0px_#FF6321]' : 'bg-brand-white text-brand-black border-brand-black'}`}
        >
          Don'ts
        </button>
      </div>

      <div className="bento-card !p-0">
        <div className="p-6 pb-2">
          <div className="bento-title">{activeTab === 'do' ? "Growth Areas" : "Red Flags"}</div>
        </div>
        <div className="divide-y-2 divide-brand-black shadow-inner">
          {(activeTab === 'do' ? doList : dontList).map((item: any) => (
            <div key={item.id} className="flex items-center gap-4 p-5 hover:bg-neutral-50 transition-colors group">
              <button 
                onClick={() => activeTab === 'do' ? onToggleDo(item.id) : onToggleDont(item.id)}
                className={`h-7 w-7 rounded-lg border-2 border-brand-black flex items-center justify-center transition-all ${item.completed ? 'bg-brand-orange text-white' : 'bg-white'}`}
              >
                {item.completed && <CheckSquare size={18} strokeWidth={3} />}
              </button>
              <p className={`text-[15px] font-bold tracking-tight leading-tight ${item.completed ? 'text-neutral-400 line-through' : 'text-brand-black'}`}>
                {item.text}
              </p>
            </div>
          ))}
        </div>

        <div className="p-6 bg-brand-gray border-t-2 border-brand-black">
          <div className="relative">
            <input 
              type="text" 
              placeholder={`+ Add New ${activeTab === 'do' ? 'Do' : "Don't"}`}
              className="w-full bg-brand-white border-2 border-brand-black rounded-xl py-3 px-4 font-bold text-brand-black placeholder:text-neutral-400 focus:ring-0 outline-none text-center shadow-[3px_3px_0px_#141414]"
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newItemText) {
                  activeTab === 'do' ? onAddDo(newItemText) : onAddDont(newItemText);
                  setNewItemText('');
                }
              }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function JournalTab({ entries, onAddEntry, onDeleteEntry }: { entries: JournalEntry[], onAddEntry: (t: string, c: string) => void, onDeleteEntry: (id: string) => void }) {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center px-2">
        <h1 className="text-3xl font-black uppercase tracking-tight">Journal</h1>
        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)}
            className="w-12 h-12 border-2 border-brand-black bg-brand-orange text-white rounded-xl flex items-center justify-center shadow-[2px_2px_0px_#141414]"
          >
            <Plus size={24} />
          </button>
        )}
      </div>

      {isAdding && (
        <motion.div 
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="bento-card bg-brand-white border-brand-black shadow-[4px_4px_0px_#141414] overflow-hidden"
        >
          <div className="bento-title">New Reflection</div>
          <input 
            type="text" 
            placeholder="Entry Title" 
            className="text-lg font-black w-full outline-none mb-4 bg-transparent border-b border-neutral-100 pb-2"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
          <textarea 
            placeholder="How is God moving in your heart today?" 
            className="w-full h-40 outline-none text-neutral-600 resize-none leading-relaxed font-serif italic text-lg bg-transparent"
            value={content}
            onChange={e => setContent(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-3 mt-4">
            <button 
              onClick={() => {
                onAddEntry(title || 'Untitled Entry', content);
                setIsAdding(false);
                setTitle('');
                setContent('');
              }}
              className="bg-brand-black text-brand-white py-3 rounded-xl font-black uppercase text-xs tracking-wider"
            >
              Save Note
            </button>
            <button 
              onClick={() => setIsAdding(false)}
              className="py-3 rounded-xl font-black uppercase text-xs tracking-wider border-2 border-brand-black text-brand-black bg-brand-gray"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {entries.map(entry => (
          <div key={entry.id} className="bento-card group hover:shadow-[4px_4px_0px_#FF6321] transition-all bg-white">
            <div className="flex justify-between items-start mb-4">
              <div className="bento-title !mb-0">{new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
              <button 
                onClick={() => onDeleteEntry(entry.id)}
                className="text-neutral-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 size={16} />
              </button>
            </div>
            <h3 className="text-xl font-black text-brand-black mb-2 leading-none tracking-tight">{entry.title}</h3>
            <p className="text-neutral-500 text-sm leading-relaxed line-clamp-2 font-serif italic">
              {entry.content}
            </p>
          </div>
        ))}
        {entries.length === 0 && !isAdding && (
          <div className="flex flex-col items-center justify-center py-20 text-neutral-300 bento-card border-dashed">
            <PenTool size={48} className="mb-4 opacity-50" />
            <p className="font-black uppercase text-xs tracking-widest">No notes yet</p>
            <p className="text-[10px] mt-1">Capture your spiritual journey.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function ProfileTab() {
  const [notifications, setNotifications] = useState(true);
  const [reminders, setReminders] = useState(true);
  const [adsRemoved, setAdsRemoved] = useState(false);
  const [isNativeApp, setIsNativeApp] = useState(false);

  useEffect(() => {
    // Check if running in React Native WebView
    const checkNative = () => {
      const isRN = !!(window.ReactNativeWebView && window.ReactNativeWebView.postMessage);
      setIsNativeApp(isRN);
      
      if (isRN) {
        // Request ads status from native
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'CHECK_ADS_STATUS'
        }));
      }
    };
    checkNative();

    // Listen for ads status from native
    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'ADS_STATUS') {
          setAdsRemoved(data.adsRemoved);
        }
      } catch (e) {}
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleRemoveAds = () => {
    if (isNativeApp && window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'PURCHASE_REMOVE_ADS'
      }));
    } else {
      // Web fallback - could redirect to purchase page
      alert('Please download our mobile app to remove ads!');
    }
  };

  const handleRestorePurchases = () => {
    if (isNativeApp && window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'RESTORE_PURCHASES'
      }));
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      className="space-y-6"
    >
      <div className="bento-card border-none bg-brand-black text-brand-white shadow-[4px_4px_0px_#FF6321]">
        <div className="bento-title !text-brand-white after:bg-brand-white">Profile</div>
        <div className="flex items-center gap-6">
          <div className="h-16 w-16 rounded-2xl border-2 border-brand-white flex items-center justify-center overflow-hidden bg-brand-orange/20">
            <img 
              src="https://picsum.photos/seed/christian/200/200" 
              alt="Profile" 
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight">Sarah J.</h1>
            <p className="text-brand-orange text-[10px] font-black uppercase tracking-widest">Faith First</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3 mt-6">
          <div className="p-3 bg-brand-white/10 rounded-xl border border-brand-white/10 flex flex-col items-center">
            <span className="text-xl font-black">12</span>
            <span className="text-[8px] font-bold uppercase tracking-widest text-brand-white/50">Journal</span>
          </div>
          <div className="p-3 bg-brand-white/10 rounded-xl border border-brand-white/10 flex flex-col items-center">
            <span className="text-xl font-black">42</span>
            <span className="text-[8px] font-bold uppercase tracking-widest text-brand-white/50">Saved</span>
          </div>
        </div>
      </div>

      <div className="bento-card bg-brand-orange/5 border-brand-orange shadow-[6px_6px_0px_#141414]">
        <div className="bento-title !text-brand-orange after:bg-brand-orange">Exclusive Access</div>
        <div className="grid grid-cols-1 gap-3">
          {adsRemoved ? (
            <div className="bento-btn bg-green-500 text-white flex items-center justify-center gap-3">
              <Zap size={18} fill="white" />
              <span className="tracking-tighter">Ads Removed - Thank You!</span>
            </div>
          ) : (
            <button 
              onClick={handleRemoveAds}
              className="bento-btn bg-brand-orange text-white flex items-center justify-center gap-3 active:translate-y-1 active:shadow-none shadow-[3px_3px_0px_#141414]"
            >
              <Zap size={18} fill="white" />
              <span className="tracking-tighter">Remove Ads ($4.99)</span>
            </button>
          )}
          {isNativeApp && !adsRemoved && (
            <button 
              onClick={handleRestorePurchases}
              className="bento-btn bg-brand-gray text-brand-black flex items-center justify-center gap-3 active:translate-y-1 active:shadow-none border-2 border-brand-black"
            >
              <span className="tracking-tighter text-xs">Restore Purchases</span>
            </button>
          )}
          <button className="bento-btn bg-brand-black text-white flex items-center justify-center gap-3 active:translate-y-1 active:shadow-none shadow-[3px_3px_0px_#FF6321]">
            <Users size={18} />
            <span className="tracking-tighter">Join Members Circle</span>
          </button>
        </div>
      </div>

      <div className="bento-card bg-brand-gray">
        <div className="bento-title">Preferences</div>
        <div className="space-y-1">
          <ToggleItem 
            label="Daily Reminders" 
            on={reminders} 
            onChange={setReminders} 
            icon={<Bell size={18} />}
          />
          <div className="h-0.5 bg-brand-black/5 mx-2" />
          <ToggleItem 
            label="Push Alerts" 
            on={notifications} 
            onChange={setNotifications} 
            icon={<Bell size={18} />}
          />
        </div>
      </div>

      <div className="bento-card">
        <div className="bento-title">Global</div>
        <div className="space-y-1">
          <LinkItem label="Account" icon={<SettingsIcon size={18} />} />
          <div className="h-0.5 bg-brand-black/5 mx-2" />
          <LinkItem label="Privacy" icon={<User size={18} />} />
          <div className="h-0.5 bg-brand-black/5 mx-2" />
          <LinkItem label="Facebook" icon={<Facebook size={18} className="text-blue-600" />} />
          <div className="h-0.5 bg-brand-black/5 mx-2" />
          <LinkItem label="Rate App" icon={<Star size={18} className="text-brand-orange" />} />
          <div className="h-0.5 bg-brand-black/5 mx-2" />
          <LinkItem label="Support" icon={<Share2 size={18} />} />
        </div>
      </div>

      <div className="bento-card border-brand-black/10 border-dashed">
        <div className="bento-title">Credits</div>
        <div className="text-center space-y-1">
          <p className="font-black text-xs uppercase tracking-tight text-neutral-800">
            Christian Dating <span className="text-brand-orange">Do's & Dont's</span>
          </p>
          <p className="text-[10px] font-bold text-neutral-500 uppercase">
            Developed By Christian App Empire LLC
          </p>
          <p className="text-[9px] font-medium text-neutral-400">
            Copyright © 2026. All Rights Reserved.
          </p>
        </div>
      </div>

      <button className="w-full py-4 rounded-xl border-2 border-brand-black font-black uppercase tracking-widest text-xs text-red-500 bg-red-50 hover:bg-red-100 transition-colors mt-4">
        Sign Out
      </button>
    </motion.div>
  );
}

function ToggleItem({ label, on, onChange, icon }: any) {
  return (
    <div className="flex items-center justify-between p-3 px-4">
      <div className="flex items-center gap-3">
        <div className="text-brand-orange">{icon}</div>
        <span className="font-black text-[11px] uppercase tracking-wider text-brand-black">{label}</span>
      </div>
      <button 
        onClick={() => onChange(!on)}
        className={`w-10 h-5 rounded-md p-0.5 border-2 border-brand-black transition-all ${on ? 'bg-brand-orange' : 'bg-brand-white'}`}
      >
        <motion.div 
          animate={{ x: on ? 20 : 0 }}
          className="h-3 w-3 bg-brand-black rounded-sm shadow-sm"
        />
      </button>
    </div>
  );
}

function LinkItem({ label, icon }: any) {
  return (
    <button className="w-full flex items-center justify-between p-3 px-4 hover:bg-white hover:border-brand-black rounded-xl transition-all border-2 border-transparent">
      <div className="flex items-center gap-3">
        <div className="text-neutral-400">{icon}</div>
        <span className="font-black text-[11px] uppercase tracking-wider text-brand-black">{label}</span>
      </div>
      <ChevronRight size={14} className="text-neutral-300" />
    </button>
  );
}

interface QuoteCardProps {
  quote: Quote;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  onShare: () => void;
  variant?: 'small' | 'medium' | 'large';
  key?: string;
}

function QuoteCard({ quote, isBookmarked, onToggleBookmark, onShare, variant = 'medium' }: QuoteCardProps) {
  const isLarge = variant === 'large';
  const isSmall = variant === 'small';

  return (
    <div className={`
      bento-card group active:scale-[0.98]
      ${isLarge ? 'bg-brand-orange text-brand-white border-brand-black min-h-[340px] shadow-[6px_6px_0px_#141414]' : 'bg-brand-white text-brand-black'}
      ${isSmall ? 'min-h-[140px] !p-5' : ''}
    `}>
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex justify-between items-center mb-4">
          <div className="bento-title !mb-0 !text-inherit after:!bg-current">
            {isLarge ? "Daily Inspiration" : quote.type}
          </div>
          <div className="flex gap-1">
            <button 
              onClick={onToggleBookmark}
              className={`p-1.5 rounded-lg border border-transparent hover:border-current transition-all`}
            >
              <Bookmark size={18} fill={isBookmarked ? (isLarge ? 'white' : '#FF6321') : 'none'} strokeWidth={2.5} />
            </button>
            <button 
              onClick={onShare}
              className={`p-1.5 rounded-lg border border-transparent hover:border-current transition-all`}
            >
              <Share2 size={18} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center">
          <p className={`font-serif italic font-bold leading-tight tracking-tight ${isLarge ? 'text-3xl' : 'text-xl'} mb-4 pr-2`}>
            "{quote.text}"
          </p>
          <div className="space-y-1">
            <p className={`font-black uppercase tracking-widest text-[11px] opacity-80`}>
              {quote.reference}
            </p>
          </div>
        </div>

        {isLarge && (
          <div className="flex gap-2 mt-6">
            <button onClick={onToggleBookmark} className="flex-1 bento-btn bg-brand-white text-brand-black hover:bg-brand-black hover:text-brand-white">
              {isBookmarked ? 'Saved' : 'Save'}
            </button>
            <button onClick={onShare} className="flex-1 bento-btn bg-brand-white text-brand-black hover:bg-brand-black hover:text-brand-white">
              Share
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
