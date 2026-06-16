import React, { useState } from 'react';
import { NotesItem } from '../types';
import { Search, Pin, Plus, Trash2, Calendar, FileText, CheckCircle } from 'lucide-react';

interface NotesSectionProps {
  notes: NotesItem[];
  subjects: string[];
  onAddNote: (note: Omit<NotesItem, 'id' | 'updatedAt'>) => void;
  onUpdateNote: (note: NotesItem) => void;
  onDeleteNote: (noteId: string) => void;
}

export default function NotesSection({
  notes,
  subjects,
  onAddNote,
  onUpdateNote,
  onDeleteNote
}: NotesSectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(notes[0]?.id || null);
  const [filterSubject, setFilterSubject] = useState<string>('All');

  // Input editing states
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editSubject, setEditSubject] = useState(subjects[0] || 'General');
  const [editPinned, setEditPinned] = useState(false);

  // Active note lookup
  const activeNote = notes.find(n => n.id === selectedNoteId);

  // Sync state when active note changes
  React.useEffect(() => {
    if (activeNote) {
      setEditTitle(activeNote.title);
      setEditContent(activeNote.content);
      setEditSubject(activeNote.subject);
      setEditPinned(activeNote.pinned);
    } else {
      setEditTitle('');
      setEditContent('');
      setEditSubject(subjects[0] || 'General');
      setEditPinned(false);
    }
  }, [selectedNoteId, notes]);

  // Handle saving the edited variables
  const handleSaveNote = () => {
    if (!selectedNoteId || !activeNote) return;

    onUpdateNote({
      ...activeNote,
      title: editTitle || 'Untitled Note',
      content: editContent,
      subject: editSubject,
      pinned: editPinned,
      updatedAt: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    });
  };

  // Add new blank note
  const handleCreateNewNote = () => {
    onAddNote({
      title: 'New Study Scribble',
      content: 'Write your exam cheat sheets, formulas, or chapter summaries here...',
      subject: subjects[0] || 'General',
      pinned: false
    });
    // Select the newly created note (normally it would be first in the array)
    if (notes.length > 0) {
      setSelectedNoteId(notes[0].id);
    }
  };

  // Filtering logic
  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          note.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = filterSubject === 'All' || note.subject === filterSubject;
    return matchesSearch && matchesSubject;
  });

  // Split into pinned and unpinned lists
  const pinnedNotesList = filteredNotes.filter(n => n.pinned);
  const unpinnedNotesList = filteredNotes.filter(n => !n.pinned);

  return (
    <div className="bg-white/5 border border-white/10 rounded-[20px] shadow-xl backdrop-blur-md overflow-hidden grid grid-cols-1 md:grid-cols-3 min-h-[550px]">
      {/* LEFT PANEL: Sidebar List */}
      <div className="border-r border-white/5 p-4 flex flex-col justify-between bg-slate-950/20">
        <div className="space-y-4 flex-1">
          {/* Header & Add Button */}
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-indigo-400" /> Study Notepad
            </h3>
            <button
              onClick={handleCreateNewNote}
              className="p-1 px-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center gap-1 text-xs transition"
            >
              <Plus className="w-3.5 h-3.5" /> Note
            </button>
          </div>

          {/* Search bar & filter selection */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4.5 h-4.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-white/10 rounded-xl text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Subject Filters */}
            <div className="flex flex-wrap gap-1">
              <button
                onClick={() => setFilterSubject('All')}
                className={`px-2 py-1 rounded-md text-[10px] font-bold transition ${
                  filterSubject === 'All' 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                All
              </button>
              {subjects.map(sub => (
                <button
                  key={sub}
                  onClick={() => setFilterSubject(sub)}
                  className={`px-2 py-1 rounded-md text-[10px] font-bold transition truncate max-w-[90px] ${
                    filterSubject === sub 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>
          </div>

          {/* Notes Stack: Pinned first */}
          <div className="space-y-4 overflow-y-auto max-h-[360px] scrollbar-thin pt-2">
            {pinnedNotesList.length > 0 && (
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1">Pinned Notes</span>
                <div className="space-y-1.5">
                  {pinnedNotesList.map(note => (
                    <div
                      key={note.id}
                      onClick={() => setSelectedNoteId(note.id)}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition flex items-start justify-between gap-2 ${
                        selectedNoteId === note.id 
                          ? 'bg-indigo-500/10 border-indigo-500/30' 
                          : 'bg-white/2 hover:bg-white/5 border-white/5'
                      }`}
                    >
                      <div className="truncate flex-1">
                        <div className="flex items-center gap-1.5">
                          <Pin className="w-3 h-3 text-pink-400 fill-current" />
                          <span className="text-xs font-semibold text-slate-200 truncate">{note.title}</span>
                        </div>
                        <span className="text-[10px] uppercase tracking-wider text-cyan-400 font-bold block mt-1">{note.subject}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {unpinnedNotesList.length > 0 && (
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1">Standard Papers</span>
                <div className="space-y-1.5">
                  {unpinnedNotesList.map(note => (
                    <div
                      key={note.id}
                      onClick={() => setSelectedNoteId(note.id)}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition flex items-start justify-between gap-2 ${
                        selectedNoteId === note.id 
                          ? 'bg-indigo-500/10 border-indigo-500/30' 
                          : 'bg-white/2 hover:bg-white/5 border-white/5'
                      }`}
                    >
                      <div className="truncate flex-1">
                        <span className="text-xs font-semibold text-slate-200 block truncate">{note.title || 'Untitled Note'}</span>
                        <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block mt-1">{note.subject}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {pinnedNotesList.length === 0 && unpinnedNotesList.length === 0 && (
              <p className="text-xs text-slate-500 text-center py-6">No study notes found.</p>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT/MIDDLE EDITOR PANEL: Main Note workspace */}
      <div className="md:col-span-2 p-6 flex flex-col justify-between relative">
        {activeNote ? (
          <div className="space-y-4 flex-1 flex flex-col justify-between h-full">
            {/* Toolbar row */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Note Title..."
                  className="bg-transparent text-xl font-bold font-sans text-slate-100 placeholder-slate-600 focus:outline-none border-b border-transparent focus:border-white/10 w-full sm:w-auto flex-1 text-slate-200"
                />

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditPinned(!editPinned)}
                    className={`p-2 rounded-xl border transition ${
                      editPinned 
                        ? 'bg-pink-500/10 text-pink-400 border-pink-500/30' 
                        : 'bg-slate-950 text-slate-400 border-white/10'
                    }`}
                    title="Pin status unpins/pins"
                  >
                    <Pin className={`w-4 h-4 ${editPinned ? 'fill-current' : ''}`} />
                  </button>

                  <button
                    onClick={() => {
                      if (confirm('Delete this study note forever?')) {
                        onDeleteNote(activeNote.id);
                        setSelectedNoteId(null);
                      }
                    }}
                    className="p-2 bg-slate-950 border border-white/10 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/5 transition"
                    title="Delete note"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Sub-inputs row */}
              <div className="flex flex-wrap items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Subject:</span>
                  <select
                    value={editSubject}
                    onChange={(e) => setEditSubject(e.target.value)}
                    className="p-1 px-2.5 bg-slate-950 text-cyan-400 font-bold tracking-tight rounded-md border border-white/5 focus:outline-none"
                  >
                    {subjects.map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                    <option value="Placement">Placement Prep</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5 text-slate-500 font-mono">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Modified: {activeNote.updatedAt}</span>
                </div>
              </div>
            </div>

            {/* Note text content editor */}
            <div className="flex-1 mt-4">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                placeholder="Take lecture notes, write summaries, solve proofs, paste code snippets, or draft essay plans here..."
                className="w-full h-[280px] md:h-[300px] bg-transparent text-sm leading-relaxed text-slate-300 placeholder-slate-600 focus:outline-none resize-none font-sans"
              />
            </div>

            {/* Save Button floating right at bottom */}
            <div className="flex justify-end pt-4 border-t border-white/5">
              <button
                onClick={handleSaveNote}
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-100 flex items-center gap-1.5 shadow-lg shadow-emerald-600/10 active:scale-95 transition"
              >
                <CheckCircle className="w-4 h-4" /> Save Cheat Sheet
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center h-full text-slate-500 py-12">
            <FileText className="w-12 h-12 text-slate-600 mb-3 animate-pulse" />
            <p className="text-sm">Click a study sheet from the sidebar to edit, or create a brand new note!</p>
          </div>
        )}
      </div>
    </div>
  );
}
