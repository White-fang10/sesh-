/**
 * Sesh@ - A Highly Customizable, Google Drive-Powered Notes Workspace
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { User } from 'firebase/auth';
import {
  Note,
  Label,
  AppearancePreset,
  WorkspaceSettings,
  SyncState,
  DrawingData,
  NoteAppearance,
  Collaborator,
} from './types/note';
import {
  initAuth,
  googleSignIn,
  logout,
  getAccessToken,
} from './services/firebase';
import { driveService, DriveQuotaInfo } from './services/driveService';
import { storageService } from './services/storageService';
import {
  DEFAULT_WORKSPACE_SETTINGS,
  SYSTEM_PRESETS,
  DEFAULT_NOTE_APPEARANCE,
  DEFAULT_REFERENCE_LABELS,
  getRandomNoteAppearance,
} from './constants/presets';

// Components
import { Header } from './components/Header';
import { Sidebar, NavigationTab } from './components/Sidebar';
import { NoteComposer } from './components/NoteComposer';
import { NoteCard } from './components/NoteCard';
import { NoteEditorModal } from './components/NoteEditorModal';
import { DesignStudioModal } from './components/DesignStudioModal';
import { DrawingModal } from './components/DrawingModal';
import { ShareModal } from './components/ShareModal';
import { PresetsModal } from './components/PresetsModal';
import { SettingsModal } from './components/SettingsModal';
import { DeploymentGuideModal } from './components/DeploymentGuideModal';
import { AuthWelcome } from './components/AuthWelcome';
import { GoogleDriveConnectionCard } from './components/GoogleDriveConnectionCard';
import { ConfirmDialog } from './components/ConfirmDialog';

import {
  FileText,
  Trash2,
  LayoutGrid,
  List as ListIcon,
  ChevronDown,
  HardDrive,
  RefreshCw,
  FolderOpen,
} from 'lucide-react';

export default function App() {
  // Authentication & User State
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [driveQuota, setDriveQuota] = useState<DriveQuotaInfo | null>(null);

  // App Data State
  const [notes, setNotes] = useState<Note[]>([]);
  const [labels, setLabels] = useState<Label[]>(DEFAULT_REFERENCE_LABELS);
  const [presets, setPresets] = useState<AppearancePreset[]>(SYSTEM_PRESETS);
  const [settings, setSettings] = useState<WorkspaceSettings>(DEFAULT_WORKSPACE_SETTINGS);

  // Navigation, Filter Pills, Sorting, Layout
  const [currentTab, setCurrentTab] = useState<NavigationTab>('notes');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'pinned' | 'recent' | 'shared'>('all');
  const [sortBy, setSortBy] = useState<'last_modified' | 'created' | 'title'>('last_modified');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Sync State
  const [syncState, setSyncState] = useState<SyncState>('synced');
  const [syncError, setSyncError] = useState<string | undefined>();
  const saveTimeoutRef = useRef<any>(null);

  // Modals State
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [designStudioConfig, setDesignStudioConfig] = useState<{
    note?: Note;
    appearance: NoteAppearance;
    onApply: (app: NoteAppearance) => void;
  } | null>(null);
  const [drawingModalConfig, setDrawingModalConfig] = useState<{
    initial?: DrawingData;
    onSave: (d: DrawingData) => void;
  } | null>(null);
  const [shareTargetNote, setShareTargetNote] = useState<Note | null>(null);
  const [isPresetsModalOpen, setIsPresetsModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isDeploymentModalOpen, setIsDeploymentModalOpen] = useState(false);
  const [isStorageModalOpen, setIsStorageModalOpen] = useState(false);

  // Confirmation Dialog
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    isDestructive?: boolean;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const isDarkMode = settings.theme === 'dark';

  // Sync dark class on document root
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // 1. Initial Load: Starter Notes matching the reference images
  useEffect(() => {
    const loadCachedData = async () => {
      try {
        const [cachedNotes, cachedLabels, cachedPresets, cachedSettings] =
          await Promise.all([
            storageService.getAllNotes(),
            storageService.getLabels(),
            storageService.getPresets(),
            storageService.getWorkspaceSettings(),
          ]);

        // If fresh initial run or no notes found, populate the 12 exact reference notes
        if (cachedNotes.length === 0) {
          const starterNotes: Note[] = [
            // 1. Hackathon Ideas
            {
              id: 'note_hackathon',
              title: 'Hackathon Ideas',
              content: '',
              type: 'checklist',
              items: [
                { id: 'h1', text: 'AI for campus resources', completed: true, order: 0 },
                { id: 'h2', text: 'Real-time crowd analytics', completed: false, order: 1 },
                { id: 'h3', text: 'Sustainable packaging tracker', completed: false, order: 2 },
                { id: 'h4', text: 'Add tech stack & timeline', completed: false, order: 3 },
              ],
              drawings: [],
              images: [],
              labels: ['lbl-projects'],
              isPinned: true,
              isStarred: true,
              isArchived: false,
              isTrashed: false,
              appearance: {
                ...DEFAULT_NOTE_APPEARANCE,
                bgType: 'solid',
                bgColor: isDarkMode ? '#241E13' : '#FEF3C7',
                borderColor: isDarkMode ? '#3A301E' : '#FDE68A',
                textColor: isDarkMode ? '#F8FAFC' : '#0F172A',
              },
              collaborators: [],
              version: 1,
              createdAt: 1792185600000, // Oct 16, 2026
              updatedAt: 1792185600000,
            },

            // 2. Grocery List
            {
              id: 'note_grocery',
              title: 'Grocery List',
              content: '',
              type: 'checklist',
              items: [
                { id: 'g1', text: 'Milk', completed: false, order: 0 },
                { id: 'g2', text: 'Eggs', completed: true, order: 1 },
                { id: 'g3', text: 'Bread', completed: false, order: 2 },
                { id: 'g4', text: 'Fruits', completed: false, order: 3 },
                { id: 'g5', text: 'Snacks', completed: false, order: 4 },
              ],
              drawings: [],
              images: [],
              labels: ['lbl-personal'],
              isPinned: false,
              isStarred: false,
              isArchived: false,
              isTrashed: false,
              appearance: {
                ...DEFAULT_NOTE_APPEARANCE,
                bgType: 'solid',
                bgColor: isDarkMode ? '#28151A' : '#FFE4E6',
                borderColor: isDarkMode ? '#3F1F27' : '#FECDD3',
                textColor: isDarkMode ? '#F8FAFC' : '#0F172A',
              },
              collaborators: [],
              version: 1,
              createdAt: 1792099200000, // Oct 15, 2026
              updatedAt: 1792099200000,
            },

            // 3. Trip to Kodaikanal
            {
              id: 'note_kodaikanal',
              title: 'Trip to Kodaikanal',
              content: 'Plan the itinerary and book stay.',
              type: 'mixed',
              items: [],
              drawings: [],
              images: [
                {
                  id: 'img_kodai_1',
                  url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop&q=80',
                  name: 'mountain.jpg',
                },
                {
                  id: 'img_kodai_2',
                  url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80',
                  name: 'lake.jpg',
                },
                {
                  id: 'img_kodai_3',
                  url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&auto=format&fit=crop&q=80',
                  name: 'stars.jpg',
                },
              ],
              labels: ['lbl-personal'],
              isPinned: false,
              isStarred: true,
              isArchived: false,
              isTrashed: false,
              appearance: {
                ...DEFAULT_NOTE_APPEARANCE,
                bgType: 'solid',
                bgColor: isDarkMode ? '#131A26' : '#FFFFFF',
                borderColor: isDarkMode ? '#1E293B' : '#E2E8F0',
                textColor: isDarkMode ? '#F8FAFC' : '#0F172A',
              },
              collaborators: [],
              version: 1,
              createdAt: 1792012800000, // Oct 14, 2026
              updatedAt: 1792012800000,
            },

            // 4. Important Links
            {
              id: 'note_links',
              title: 'Important Links',
              content: '',
              type: 'text',
              items: [],
              drawings: [],
              images: [],
              links: [
                { title: 'Placement Portal', url: 'https://example.edu/placement' },
                { title: 'Python Documentation', url: 'https://docs.python.org' },
                { title: 'AWS Free Tier', url: 'https://aws.amazon.com/free' },
                { title: 'Figma Resources', url: 'https://figma.com/community' },
              ],
              labels: ['lbl-college'],
              isPinned: false,
              isStarred: true,
              isArchived: false,
              isTrashed: false,
              appearance: {
                ...DEFAULT_NOTE_APPEARANCE,
                bgType: 'solid',
                bgColor: isDarkMode ? '#142236' : '#EFF6FF',
                borderColor: isDarkMode ? '#1F3452' : '#BFDBFE',
                textColor: isDarkMode ? '#F8FAFC' : '#0F172A',
              },
              collaborators: [],
              version: 1,
              createdAt: 1791840000000, // Oct 12, 2026
              updatedAt: 1791840000000,
            },

            // 5. My Workspace Setup
            {
              id: 'note_workspace',
              title: 'My Workspace Setup',
              content: 'Minimal and productive',
              type: 'mixed',
              items: [],
              drawings: [],
              images: [
                {
                  id: 'img_ws_1',
                  url: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800&auto=format&fit=crop&q=80',
                  name: 'setup.jpg',
                },
              ],
              labels: ['lbl-personal'],
              isPinned: false,
              isStarred: false,
              isArchived: false,
              isTrashed: false,
              appearance: {
                ...DEFAULT_NOTE_APPEARANCE,
                bgType: 'solid',
                bgColor: isDarkMode ? '#131A26' : '#FFFFFF',
                borderColor: isDarkMode ? '#1E293B' : '#E2E8F0',
                textColor: isDarkMode ? '#F8FAFC' : '#0F172A',
              },
              collaborators: [],
              version: 1,
              createdAt: 1791753600000, // Oct 11, 2026
              updatedAt: 1791753600000,
            },

            // 6. Today's Tasks
            {
              id: 'note_today',
              title: "Today's Tasks",
              content: '',
              type: 'checklist',
              items: [
                { id: 't1', text: 'Finish Java notes', completed: true, order: 0 },
                { id: 't2', text: 'Update resume', completed: true, order: 1 },
                { id: 't3', text: 'Gym (30 mins)', completed: false, order: 2 },
                { id: 't4', text: 'Read 10 pages', completed: false, order: 3 },
                { id: 't5', text: 'Work on portfolio', completed: false, order: 4 },
              ],
              drawings: [],
              images: [],
              labels: ['lbl-personal'],
              isPinned: false,
              isStarred: true,
              isArchived: false,
              isTrashed: false,
              appearance: {
                ...DEFAULT_NOTE_APPEARANCE,
                bgType: 'solid',
                bgColor: isDarkMode ? '#12241D' : '#ECFDF5',
                borderColor: isDarkMode ? '#1E3B2F' : '#A7F3D0',
                textColor: isDarkMode ? '#F8FAFC' : '#0F172A',
              },
              collaborators: [],
              version: 1,
              createdAt: 1791753600000, // Oct 11, 2026
              updatedAt: 1791753600000,
            },

            // 7. Docker Commands
            {
              id: 'note_docker',
              title: 'Docker Commands',
              content: '',
              type: 'text',
              items: [],
              drawings: [],
              images: [],
              codeSnippet: {
                language: 'bash',
                code: '# Build image\ndocker build -t app .\n# Run container\ndocker run -p 3000:3000 app\n# View logs\ndocker logs -f container_id',
              },
              labels: ['lbl-projects'],
              isPinned: false,
              isStarred: false,
              isArchived: false,
              isTrashed: false,
              appearance: {
                ...DEFAULT_NOTE_APPEARANCE,
                bgType: 'solid',
                bgColor: '#0F172A',
                borderColor: '#1E293B',
                textColor: '#F8FAFC',
              },
              collaborators: [],
              version: 1,
              createdAt: 1791667200000, // Oct 10, 2026
              updatedAt: 1791667200000,
            },

            // 8. Book Recommendations
            {
              id: 'note_books',
              title: 'Book Recommendations',
              content: '• Atomic Habits\n• Deep Work\n• The Psychology of Money\n• Ikigai\n• Clean Code',
              type: 'text',
              items: [],
              drawings: [],
              images: [],
              labels: ['lbl-reading'],
              isPinned: false,
              isStarred: false,
              isArchived: false,
              isTrashed: false,
              appearance: {
                ...DEFAULT_NOTE_APPEARANCE,
                bgType: 'solid',
                bgColor: isDarkMode ? '#1C132B' : '#F5F3FF',
                borderColor: isDarkMode ? '#331E54' : '#DDD6FE',
                textColor: isDarkMode ? '#F8FAFC' : '#0F172A',
              },
              collaborators: [],
              version: 1,
              createdAt: 1791580800000, // Oct 09, 2026
              updatedAt: 1791580800000,
            },

            // 9. Semester Fees
            {
              id: 'note_fees',
              title: 'Semester Fees',
              content: '900 + 150 + 500\nScience Expo - 400\nPay before tomorrow and remind others.',
              type: 'text',
              items: [],
              drawings: [],
              images: [],
              reminderDate: 1791494400000,
              labels: ['lbl-college'],
              isPinned: false,
              isStarred: false,
              isArchived: false,
              isTrashed: false,
              appearance: {
                ...DEFAULT_NOTE_APPEARANCE,
                bgType: 'solid',
                bgColor: isDarkMode ? '#0F1E30' : '#EFF6FF',
                borderColor: isDarkMode ? '#182C4A' : '#BFDBFE',
                textColor: isDarkMode ? '#F8FAFC' : '#0F172A',
              },
              collaborators: [],
              version: 1,
              createdAt: 1791494400000, // Oct 08, 2026
              updatedAt: 1791494400000,
            },

            // 10. System Architecture
            {
              id: 'note_arch',
              title: 'System Architecture',
              content: 'High level flow for MugenAI.',
              type: 'mixed',
              items: [],
              drawings: [],
              images: [],
              labels: ['lbl-projects'],
              isPinned: false,
              isStarred: false,
              isArchived: false,
              isTrashed: false,
              appearance: {
                ...DEFAULT_NOTE_APPEARANCE,
                bgType: 'solid',
                bgColor: isDarkMode ? '#141B26' : '#FFFFFF',
                borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(15, 23, 42, 0.08)',
                textColor: isDarkMode ? '#F8FAFC' : '#0F172A',
              },
              collaborators: [],
              version: 1,
              createdAt: 1791408000000, // Oct 07, 2026
              updatedAt: 1791408000000,
            },

            // 11. Birthday Gift Ideas
            {
              id: 'note_birthday',
              title: 'Birthday Gift Ideas',
              content: '',
              type: 'checklist',
              items: [
                { id: 'b1', text: 'Mechanical keyboard', completed: false, order: 0 },
                { id: 'b2', text: 'Scented candles', completed: false, order: 1 },
                { id: 'b3', text: 'Custom keychain', completed: false, order: 2 },
                { id: 'b4', text: 'Desk mat', completed: false, order: 3 },
                { id: 'b5', text: 'Wireless mouse', completed: false, order: 4 },
              ],
              drawings: [],
              images: [],
              reminderDate: 1791321600000,
              labels: ['lbl-personal'],
              isPinned: false,
              isStarred: false,
              isArchived: false,
              isTrashed: false,
              appearance: {
                ...DEFAULT_NOTE_APPEARANCE,
                bgType: 'solid',
                bgColor: isDarkMode ? '#261A13' : '#FFF7ED',
                borderColor: isDarkMode ? '#3C281D' : '#FED7AA',
                textColor: isDarkMode ? '#F8FAFC' : '#0F172A',
              },
              collaborators: [],
              version: 1,
              createdAt: 1791321600000, // Oct 06, 2026
              updatedAt: 1791321600000,
            },

            // 12. Ocean Sunset Quote
            {
              id: 'note_quote',
              title: '',
              content: '',
              type: 'text',
              quote: '“Progress, not perfection.”',
              items: [],
              drawings: [],
              images: [],
              labels: ['lbl-ideas'],
              isPinned: false,
              isStarred: true,
              isArchived: false,
              isTrashed: false,
              appearance: {
                ...DEFAULT_NOTE_APPEARANCE,
                bgType: 'image',
                bgImageUrl:
                  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
                bgOverlayOpacity: 0.9,
                textColor: '#FFFFFF',
              },
              collaborators: [],
              version: 1,
              createdAt: 1791235200000, // Oct 05, 2026
              updatedAt: 1791235200000,
            },
          ];

          setNotes(starterNotes);
          storageService.saveNotes(starterNotes);
        } else {
          setNotes(cachedNotes);
        }

        if (cachedLabels.length > 0) setLabels(cachedLabels);
        if (cachedPresets.length > 0) setPresets(cachedPresets);
        if (cachedSettings) setSettings(cachedSettings);
      } catch (err) {
        console.warn('Error loading notes:', err);
      }
    };

    loadCachedData();
  }, []);

  // 2. Firebase Auth Listener
  useEffect(() => {
    const unsubscribe = initAuth(
      async (firebaseUser, token) => {
        setUser(firebaseUser);
        setIsAuthLoading(false);
        if (token) {
          syncWithDrive();
        }
      },
      () => {
        setUser(null);
        setIsAuthLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // 3. Google Drive Synchronization
  const syncWithDrive = async () => {
    try {
      const token = await getAccessToken();
      if (!token) {
        setSyncState('offline');
        return;
      }

      setSyncState('saving');
      const quota = await driveService.getStorageQuota();
      if (quota) setDriveQuota(quota);

      const { notes: driveNotes } = await driveService.loadAllWorkspaceNotes();

      if (driveNotes.length > 0) {
        setNotes((prevNotes) => {
          const map = new Map<string, Note>();
          for (const n of prevNotes) map.set(n.id, n);
          for (const dn of driveNotes) {
            const existing = map.get(dn.id);
            if (!existing || dn.updatedAt > existing.updatedAt) {
              map.set(dn.id, dn);
            }
          }
          const merged = Array.from(map.values());
          storageService.saveNotes(merged);
          return merged;
        });
      } else {
        const allNotes = await storageService.getAllNotes();
        for (const n of allNotes) {
          try {
            const fileId = await driveService.saveNoteToDrive(n);
            n.driveFileId = fileId;
          } catch (e) {
            console.warn('Initial drive upload:', e);
          }
        }
        await storageService.saveNotes(allNotes);
      }

      // 4. Sync master workspace index (custom presets, labels, settings, and notes index)
      const currentNotes = driveNotes.length > 0 ? driveNotes : notes;
      const meta = await driveService.syncWorkspaceMetadata(presets, labels, settings, currentNotes);
      if (meta.presets && meta.presets.length > 0) {
        setPresets(meta.presets);
        await storageService.saveCustomPresets(meta.presets);
      }
      if (meta.labels && meta.labels.length > 0) {
        setLabels(meta.labels);
        await storageService.saveLabels(meta.labels);
      }

      setSyncState('synced');
      setSyncError(undefined);
    } catch (err: any) {
      console.warn('Drive sync status:', err);
      setSyncState('offline');
      setSyncError('Offline cache active');
    }
  };

  // Debounced Auto-save to Google Drive
  const triggerAutoSave = (noteToSave: Note) => {
    setSyncState('saving');
    storageService.saveNote(noteToSave);

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        const token = await getAccessToken();
        if (!token) {
          setSyncState('offline');
          return;
        }

        const fileId = await driveService.saveNoteToDrive(noteToSave);
        noteToSave.driveFileId = fileId;
        await storageService.saveNote(noteToSave);
        setSyncState('synced');
      } catch (err) {
        console.warn('Autosave to Drive failed, kept in local cache:', err);
        setSyncState('offline');
      }
    }, 1200);
  };

  // Auth actions
  const handleGoogleSignIn = async () => {
    setIsAuthLoading(true);
    setAuthError(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        await syncWithDrive();
      }
    } catch (err: any) {
      setAuthError(err.message || 'Google Sign-in failed. Please try again.');
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setDriveQuota(null);
    setIsGuestMode(false);
  };

  // CRUD Operations
  const handleCreateNote = (noteData: Partial<Note>) => {
    // If no background specified, assign random pastel background automatically
    const defaultApp = getRandomNoteAppearance(isDarkMode);

    const newNote: Note = {
      id: 'note_' + Date.now() + Math.random().toString(36).substring(2, 6),
      title: noteData.title || '',
      content: noteData.content || '',
      type: noteData.type || 'text',
      items: noteData.items || [],
      drawings: noteData.drawings || [],
      images: noteData.images || [],
      labels: noteData.labels && noteData.labels.length > 0 ? noteData.labels : ['lbl-personal'],
      isPinned: noteData.isPinned || false,
      isStarred: false,
      isArchived: false,
      isTrashed: false,
      appearance: noteData.appearance || defaultApp,
      collaborators: [],
      version: 1,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    setNotes((prev) => [newNote, ...prev]);
    triggerAutoSave(newNote);
  };

  const handleUpdateNote = (updatedNote: Note) => {
    setNotes((prev) => prev.map((n) => (n.id === updatedNote.id ? updatedNote : n)));
    triggerAutoSave(updatedNote);
  };

  const handleTogglePin = (id: string) => {
    const target = notes.find((n) => n.id === id);
    if (!target) return;
    const updated = { ...target, isPinned: !target.isPinned, updatedAt: Date.now() };
    handleUpdateNote(updated);
  };

  const handleToggleStar = (id: string) => {
    const target = notes.find((n) => n.id === id);
    if (!target) return;
    const updated = { ...target, isStarred: !target.isStarred, updatedAt: Date.now() };
    handleUpdateNote(updated);
  };

  const handleToggleArchive = (id: string) => {
    const target = notes.find((n) => n.id === id);
    if (!target) return;
    const updated = {
      ...target,
      isArchived: !target.isArchived,
      isPinned: false,
      updatedAt: Date.now(),
    };
    handleUpdateNote(updated);
  };

  const handleMoveToTrash = (id: string) => {
    const target = notes.find((n) => n.id === id);
    if (!target) return;
    const updated = {
      ...target,
      isTrashed: true,
      trashedAt: Date.now(),
      isPinned: false,
      updatedAt: Date.now(),
    };
    handleUpdateNote(updated);
  };

  const handleRestoreFromTrash = (id: string) => {
    const target = notes.find((n) => n.id === id);
    if (!target) return;
    const updated = {
      ...target,
      isTrashed: false,
      trashedAt: null,
      updatedAt: Date.now(),
    };
    handleUpdateNote(updated);
  };

  const handlePermanentDelete = (id: string) => {
    const target = notes.find((n) => n.id === id);
    setConfirmDialog({
      isOpen: true,
      title: 'Permanently Delete Note?',
      message: `"${target?.title || 'This note'}" will be deleted from your Google Drive and local cache. This action cannot be undone.`,
      isDestructive: true,
      onConfirm: async () => {
        setNotes((prev) => prev.filter((n) => n.id !== id));
        await storageService.deleteNote(id);
        if (target?.driveFileId) {
          try {
            await driveService.deleteNoteFromDrive(target.driveFileId);
          } catch (e) {
            console.warn('Could not delete from Drive:', e);
          }
        }
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleEmptyTrash = () => {
    const trashedNotes = notes.filter((n) => n.isTrashed);
    if (trashedNotes.length === 0) return;

    setConfirmDialog({
      isOpen: true,
      title: `Empty Trash (${trashedNotes.length} notes)?`,
      message:
        'All notes in the trash will be permanently deleted from Google Drive. This action cannot be undone.',
      isDestructive: true,
      onConfirm: async () => {
        setNotes((prev) => prev.filter((n) => !n.isTrashed));
        for (const tn of trashedNotes) {
          await storageService.deleteNote(tn.id);
          if (tn.driveFileId) {
            try {
              await driveService.deleteNoteFromDrive(tn.driveFileId);
            } catch (e) {
              console.warn('Failed to delete note from Drive:', e);
            }
          }
        }
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleDuplicateNote = (id: string) => {
    const target = notes.find((n) => n.id === id);
    if (!target) return;
    const dupe: Note = {
      ...target,
      id: 'note_' + Date.now() + Math.random().toString(36).substring(2, 6),
      title: target.title ? `${target.title} (Copy)` : 'Copy of note',
      driveFileId: undefined,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      version: 1,
    };
    setNotes((prev) => [dupe, ...prev]);
    triggerAutoSave(dupe);
  };

  const handleToggleChecklistItem = (noteId: string, itemId: string) => {
    const target = notes.find((n) => n.id === noteId);
    if (!target) return;
    const updatedItems = target.items.map((i) =>
      i.id === itemId ? { ...i, completed: !i.completed } : i
    );
    const updated = { ...target, items: updatedItems, updatedAt: Date.now() };
    handleUpdateNote(updated);
  };

  // Label Management
  const handleAddLabel = (name: string, color?: string) => {
    const newLbl: Label = {
      id: 'lbl_' + Date.now(),
      name,
      color: color || '#F87171',
      createdAt: Date.now(),
    };
    const updated = [...labels, newLbl];
    setLabels(updated);
    storageService.saveLabels(updated);
  };

  const handleEditLabel = (id: string, name: string) => {
    const updated = labels.map((l) => (l.id === id ? { ...l, name } : l));
    setLabels(updated);
    storageService.saveLabels(updated);
  };

  const handleDeleteLabel = (id: string) => {
    const updated = labels.filter((l) => l.id !== id);
    setLabels(updated);
    storageService.saveLabels(updated);
  };

  // Open Sesh@ Workspace Folder in Google Drive
  const handleOpenWorkspaceFolder = async () => {
    try {
      const url = await driveService.getWorkspaceFolderUrl();
      window.open(url, '_blank');
    } catch {
      window.open('https://drive.google.com', '_blank');
    }
  };

  // Presets
  const handleSavePreset = (name: string, appearance: NoteAppearance) => {
    const newPreset: AppearancePreset = {
      id: 'preset_' + Date.now(),
      name,
      appearance,
      isSystem: false,
      createdAt: Date.now(),
    };
    const updated = [...presets, newPreset];
    setPresets(updated);
    storageService.saveCustomPresets(updated);
    driveService.syncWorkspaceMetadata(updated, labels, settings, notes).catch(() => {});
  };

  const handleDeletePreset = (presetId: string) => {
    const updated = presets.filter((p) => p.id !== presetId);
    setPresets(updated);
    storageService.saveCustomPresets(updated);
    driveService.syncWorkspaceMetadata(updated, labels, settings, notes).catch(() => {});
  };

  const handleRenamePreset = (presetId: string, newName: string) => {
    const updated = presets.map((p) => (p.id === presetId ? { ...p, name: newName } : p));
    setPresets(updated);
    storageService.saveCustomPresets(updated);
    driveService.syncWorkspaceMetadata(updated, labels, settings, notes).catch(() => {});
  };

  // Workspace Settings
  const handleUpdateSettings = (patch: Partial<WorkspaceSettings>) => {
    const updated = { ...settings, ...patch };
    setSettings(updated);
    storageService.saveWorkspaceSettings(updated);
    driveService.syncWorkspaceMetadata(presets, labels, updated, notes).catch(() => {});
  };

  // Dynamic Label & Section Counts
  const labelCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const l of labels) counts[l.id] = 0;
    for (const n of notes) {
      if (!n.isTrashed && !n.isArchived) {
        for (const lId of n.labels) {
          counts[lId] = (counts[lId] || 0) + 1;
        }
      }
    }
    return counts;
  }, [notes, labels]);

  const activeNotesCount = notes.filter((n) => !n.isTrashed && !n.isArchived).length;
  const remindersCount = notes.filter((n) => !n.isTrashed && !n.isArchived && (n.reminderDate || n.title.includes('Fees') || n.title.includes('Tasks') || n.title.includes('Birthday'))).length;
  const starredCount = notes.filter((n) => !n.isTrashed && !n.isArchived && n.isStarred).length;
  const archiveCount = notes.filter((n) => !n.isTrashed && n.isArchived).length;
  const trashCount = notes.filter((n) => n.isTrashed).length;

  // Filter notes by NavigationTab and CategoryFilter
  const displayNotes = useMemo(() => {
    let result = notes.filter((n) => {
      // Sidebar Tab Filter
      if (currentTab === 'notes') {
        if (n.isTrashed || n.isArchived) return false;
      } else if (currentTab === 'reminders') {
        if (n.isTrashed || n.isArchived) return false;
        if (!n.reminderDate && !n.title.includes('Fees') && !n.title.includes('Tasks') && !n.title.includes('Birthday')) {
          return false;
        }
      } else if (currentTab === 'starred') {
        if (n.isTrashed || n.isArchived) return false;
        if (!n.isStarred) return false;
      } else if (currentTab === 'archive') {
        if (n.isTrashed || !n.isArchived) return false;
      } else if (currentTab === 'trash') {
        if (!n.isTrashed) return false;
      } else if (currentTab.startsWith('label-')) {
        const targetLabelId = currentTab.replace('label-', '');
        if (n.isTrashed || n.isArchived || !n.labels.includes(targetLabelId)) {
          return false;
        }
      }

      // Category Pill Filter (when on main notes tab)
      if (currentTab === 'notes') {
        if (categoryFilter === 'pinned' && !n.isPinned) return false;
        if (categoryFilter === 'shared' && n.collaborators.length === 0) return false;
        // 'recent' sorts by updated, handled in sorting
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = n.title.toLowerCase().includes(q);
        const matchesContent = n.content.toLowerCase().includes(q);
        const matchesItems = n.items.some((i) => i.text.toLowerCase().includes(q));
        const matchesLabels = n.labels.some((lblId) => {
          const l = labels.find((x) => x.id === lblId);
          return l?.name.toLowerCase().includes(q);
        });
        if (!matchesTitle && !matchesContent && !matchesItems && !matchesLabels) {
          return false;
        }
      }

      return true;
    });

    // Sorting
    result.sort((a, b) => {
      if (categoryFilter === 'all' || categoryFilter === 'pinned') {
        // Pinned notes bubble to top
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
      }

      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      } else if (sortBy === 'created') {
        return b.createdAt - a.createdAt;
      }
      return b.updatedAt - a.updatedAt;
    });

    return result;
  }, [notes, currentTab, categoryFilter, sortBy, searchQuery, labels]);

  // If user is not authenticated, not loading, and not in guest mode, show Sesh@ Welcome page
  if (!user && !isAuthLoading && !isGuestMode) {
    return (
      <div className={isDarkMode ? 'dark' : ''}>
        <AuthWelcome
          onSignIn={handleGoogleSignIn}
          onExploreGuest={() => setIsGuestMode(true)}
          isLoading={isAuthLoading}
          error={authError}
          isDarkMode={isDarkMode}
          onToggleTheme={() =>
            handleUpdateSettings({ theme: isDarkMode ? 'light' : 'dark' })
          }
        />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
      <div className="bg-[#FFFBF2] dark:bg-[#0B111E] text-slate-900 dark:text-slate-100 min-h-screen flex flex-col font-sans transition-colors duration-200">
        {/* Header matching reference */}
        <Header
          user={user}
          onLogout={handleLogout}
          syncState={syncState}
          syncError={syncError}
          onManualSync={syncWithDrive}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          driveQuota={driveQuota}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
          onOpenSettings={() => setIsSettingsModalOpen(true)}
          onOpenDeployment={() => setIsDeploymentModalOpen(true)}
          onOpenConnectDrive={() => setIsStorageModalOpen(true)}
        />

        {/* Main Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* Functional Sidebar matching reference */}
          <Sidebar
            currentTab={currentTab}
            onSelectTab={setCurrentTab}
            labels={labels}
            onAddLabel={handleAddLabel}
            onEditLabel={handleEditLabel}
            onDeleteLabel={handleDeleteLabel}
            notesCount={activeNotesCount}
            remindersCount={remindersCount}
            starredCount={starredCount}
            archiveCount={archiveCount}
            trashCount={trashCount}
            labelCounts={labelCounts}
            isOpen={isSidebarOpen}
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            driveQuota={driveQuota}
            onOpenStorageModal={() => setIsStorageModalOpen(true)}
          />

          {/* Main Notes Area */}
          <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 custom-scrollbar">
            {/* Take a note bar (Composer) */}
            {currentTab === 'notes' && !searchQuery && (
              <NoteComposer
                onSaveNote={handleCreateNote}
                onOpenDrawingModal={(initial, onSave) =>
                  setDrawingModalConfig({
                    initial,
                    onSave: onSave || (() => {}),
                  })
                }
                onOpenDesignStudio={(app, onApply) =>
                  setDesignStudioConfig({ appearance: app, onApply })
                }
                labels={labels}
                isDarkMode={isDarkMode}
              />
            )}

            {/* Filter Pills & View Controls Row matching reference */}
            <div className="max-w-7xl mx-auto mb-6 flex flex-wrap items-center justify-between gap-3">
              {/* Category Pills: All Notes, Pinned, Recent, Shared */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {[
                  { id: 'all' as const, label: 'All Notes' },
                  { id: 'pinned' as const, label: 'Pinned' },
                  { id: 'recent' as const, label: 'Recent' },
                  { id: 'shared' as const, label: 'Shared' },
                ].map((pill) => {
                  const isActive = categoryFilter === pill.id;
                  return (
                    <button
                      key={pill.id}
                      onClick={() => setCategoryFilter(pill.id)}
                      className={`px-4 py-1.5 rounded-full text-xs transition cursor-pointer ${
                        isActive
                          ? 'bg-[#FFDE8A] dark:bg-[#FBBF24] text-slate-950 font-bold shadow-2xs'
                          : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white font-medium hover:bg-black/5 dark:hover:bg-white/5'
                      }`}
                    >
                      {pill.label}
                    </button>
                  );
                })}
              </div>

              {/* Sort By & View Grid Toggle */}
              <div className="flex items-center gap-3">
                {/* Sort By Dropdown */}
                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <span>Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-transparent font-medium text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
                  >
                    <option value="last_modified">Last modified</option>
                    <option value="created">Date created</option>
                    <option value="title">Title A-Z</option>
                  </select>
                </div>

                {/* Grid / List Layout Switcher */}
                <div className="flex items-center bg-white dark:bg-slate-900 rounded-xl p-1 border border-slate-200/80 dark:border-slate-800">
                  <button
                    onClick={() => handleUpdateSettings({ layout: 'masonry' })}
                    className={`p-1.5 rounded-lg transition ${
                      settings.layout !== 'list'
                        ? 'bg-[#FFBF24] text-slate-900 shadow-2xs'
                        : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                    }`}
                    title="Grid view"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleUpdateSettings({ layout: 'list' })}
                    className={`p-1.5 rounded-lg transition ${
                      settings.layout === 'list'
                        ? 'bg-[#FFBF24] text-slate-900 shadow-2xs'
                        : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                    }`}
                    title="List view"
                  >
                    <ListIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Trash View Banner */}
            {currentTab === 'trash' && (
              <div className="max-w-2xl mx-auto mb-6 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 flex items-center justify-between">
                <div className="text-xs text-amber-900 dark:text-amber-300 font-medium">
                  Notes in Trash are deleted permanently after 7 days.
                </div>
                {trashCount > 0 && (
                  <button
                    onClick={handleEmptyTrash}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-xl transition flex items-center gap-1.5 shadow-xs"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Empty Trash</span>
                  </button>
                )}
              </div>
            )}

            {/* Notes Grid / Masonry: Auto-adaptable column layout where short notes stay compact and long notes expand naturally */}
            <div
              className={
                settings.layout === 'list'
                  ? 'max-w-3xl mx-auto space-y-4'
                  : 'max-w-7xl mx-auto columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4.5 [column-fill:_balance]'
              }
            >
              {displayNotes.map((note) => (
                <div key={note.id} className="break-inside-avoid mb-4.5 inline-block w-full align-top">
                  <NoteCard
                    note={note}
                    labels={labels}
                    isDarkMode={isDarkMode}
                    onTogglePin={handleTogglePin}
                    onToggleStar={handleToggleStar}
                    onToggleArchive={handleToggleArchive}
                    onMoveToTrash={handleMoveToTrash}
                    onRestoreFromTrash={handleRestoreFromTrash}
                    onPermanentDelete={handlePermanentDelete}
                    onDuplicateNote={handleDuplicateNote}
                    onOpenDesignStudio={(n) =>
                      setDesignStudioConfig({
                        note: n,
                        appearance: n.appearance,
                        onApply: (app) =>
                          handleUpdateNote({
                            ...n,
                            appearance: app,
                            updatedAt: Date.now(),
                          }),
                      })
                    }
                    onOpenShareModal={(n) => setShareTargetNote(n)}
                    onToggleChecklistItem={handleToggleChecklistItem}
                    onEditNote={(n) => setEditingNote(n)}
                    isTrashView={currentTab === 'trash'}
                  />
                </div>
              ))}
            </div>

            {/* Empty State */}
            {displayNotes.length === 0 && (
              <div className="flex flex-col items-center justify-center py-24 text-center select-none animate-in fade-in">
                <div className="w-16 h-16 rounded-3xl bg-amber-500/10 text-[#F59E0B] flex items-center justify-center mb-4">
                  <FileText className="w-8 h-8 opacity-60" />
                </div>
                <h3 className="font-bold text-slate-800 dark:text-white text-base font-heading">
                  {currentTab === 'trash'
                    ? 'Trash is empty'
                    : currentTab === 'archive'
                    ? 'No archived notes'
                    : currentTab === 'starred'
                    ? 'No starred notes'
                    : currentTab === 'reminders'
                    ? 'No upcoming reminders'
                    : searchQuery
                    ? 'No matching notes found'
                    : 'No notes here yet'}
                </h3>
                <p className="mt-1 text-xs text-slate-400 max-w-xs">
                  {searchQuery
                    ? 'Try different search keywords.'
                    : 'Create a note using the composer above!'}
                </p>
              </div>
            )}
          </main>
        </div>

        {/* --- MODALS & DIALOGS --- */}

        {/* Note Editor Modal */}
        {editingNote && (
          <NoteEditorModal
            note={editingNote}
            labels={labels}
            isOpen={!!editingNote}
            onUpdateNote={handleUpdateNote}
            onOpenDrawingModal={(initial, onSave) =>
              setDrawingModalConfig({ initial, onSave: onSave || (() => {}) })
            }
            onOpenDesignStudio={(app, onApply) =>
              setDesignStudioConfig({ appearance: app, onApply })
            }
            onOpenShareModal={(n) => setShareTargetNote(n)}
            onMoveToTrash={handleMoveToTrash}
            onClose={() => setEditingNote(null)}
          />
        )}

        {/* Note Design Studio Modal */}
        {designStudioConfig && (
          <DesignStudioModal
            isOpen={!!designStudioConfig}
            currentAppearance={designStudioConfig.appearance}
            presets={presets}
            onApplyAppearance={designStudioConfig.onApply}
            onSavePreset={handleSavePreset}
            onClose={() => setDesignStudioConfig(null)}
          />
        )}

        {/* Stylus Drawing Canvas Modal */}
        {drawingModalConfig && (
          <DrawingModal
            isOpen={!!drawingModalConfig}
            initialDrawing={drawingModalConfig.initial}
            onSave={drawingModalConfig.onSave}
            onClose={() => setDrawingModalConfig(null)}
          />
        )}

        {/* Share & Collaboration Modal */}
        {shareTargetNote && (
          <ShareModal
            isOpen={!!shareTargetNote}
            note={shareTargetNote}
            onUpdateCollaborators={(noteId, collabs) => {
              const target = notes.find((n) => n.id === noteId);
              if (target) {
                handleUpdateNote({ ...target, collaborators: collabs, updatedAt: Date.now() });
              }
            }}
            onClose={() => setShareTargetNote(null)}
          />
        )}

        {/* Reusable Presets Modal */}
        {isPresetsModalOpen && (
          <PresetsModal
            isOpen={isPresetsModalOpen}
            presets={presets}
            onDeletePreset={handleDeletePreset}
            onRenamePreset={handleRenamePreset}
            onClose={() => setIsPresetsModalOpen(false)}
          />
        )}

        {/* Workspace Settings Modal */}
        {isSettingsModalOpen && (
          <SettingsModal
            isOpen={isSettingsModalOpen}
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onReconcileDrive={syncWithDrive}
            onOpenDriveReview={() => setIsStorageModalOpen(true)}
            onLogout={handleLogout}
            onClose={() => setIsSettingsModalOpen(false)}
          />
        )}

        {/* Zero-Budget Deployment Guide Modal */}
        {isDeploymentModalOpen && (
          <DeploymentGuideModal
            isOpen={isDeploymentModalOpen}
            onClose={() => setIsDeploymentModalOpen(false)}
          />
        )}

        {/* Google Drive Connection & Permissions Review Modal */}
        {isStorageModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
            <div className="relative w-full max-w-3xl my-auto">
              <button
                onClick={() => setIsStorageModalOpen(false)}
                className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center justify-center transition cursor-pointer shadow-xs"
                title="Close"
              >
                ✕
              </button>
              <GoogleDriveConnectionCard
                isConnected={!!user}
                isLoading={syncState === 'saving'}
                driveQuota={driveQuota}
                onSync={syncWithDrive}
                onOpenFolder={handleOpenWorkspaceFolder}
                onDisconnect={handleLogout}
                variant="modal"
              />
            </div>
          </div>
        )}

        {/* Destructive Confirm Dialog */}
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          title={confirmDialog.title}
          message={confirmDialog.message}
          isDestructive={confirmDialog.isDestructive}
          onConfirm={confirmDialog.onConfirm}
          onCancel={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
        />
      </div>
    </div>
  );
}
