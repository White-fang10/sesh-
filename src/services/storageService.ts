import { Note, Label, AppearancePreset, WorkspaceSettings } from '../types/note';
import { DEFAULT_WORKSPACE_SETTINGS, SYSTEM_PRESETS } from '../constants/presets';

const DB_NAME = 'sesh_workspace_db';
const DB_VERSION = 1;
const STORE_NOTES = 'notes';
const STORE_META = 'metadata';

class StorageService {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        return reject(new Error('IndexedDB not supported'));
      }

      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event: any) => {
        const db = event.target.result as IDBDatabase;
        if (!db.objectStoreNames.contains(STORE_NOTES)) {
          db.createObjectStore(STORE_NOTES, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORE_META)) {
          db.createObjectStore(STORE_META, { keyPath: 'key' });
        }
      };

      request.onsuccess = (event: any) => {
        resolve(event.target.result);
      };

      request.onerror = (event: any) => {
        console.warn('IndexedDB error, falling back to localStorage', event.target.error);
        reject(event.target.error);
      };
    });

    return this.dbPromise;
  }

  // --- Notes Operations ---

  async getAllNotes(): Promise<Note[]> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NOTES, 'readonly');
        const store = tx.objectStore(STORE_NOTES);
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
      });
    } catch {
      // Fallback
      const raw = localStorage.getItem('sesh_cached_notes');
      return raw ? JSON.parse(raw) : [];
    }
  }

  async saveNote(note: Note): Promise<void> {
    try {
      const db = await this.getDB();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NOTES, 'readwrite');
        const store = tx.objectStore(STORE_NOTES);
        const req = store.put(note);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch {
      // Fallback
      const notes = await this.getAllNotes();
      const idx = notes.findIndex(n => n.id === note.id);
      if (idx >= 0) notes[idx] = note;
      else notes.unshift(note);
      localStorage.setItem('sesh_cached_notes', JSON.stringify(notes));
    }
  }

  async saveNotes(notes: Note[]): Promise<void> {
    try {
      const db = await this.getDB();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NOTES, 'readwrite');
        const store = tx.objectStore(STORE_NOTES);
        store.clear();
        for (const n of notes) {
          store.put(n);
        }
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch {
      localStorage.setItem('sesh_cached_notes', JSON.stringify(notes));
    }
  }

  async deleteNote(id: string): Promise<void> {
    try {
      const db = await this.getDB();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NOTES, 'readwrite');
        const store = tx.objectStore(STORE_NOTES);
        const req = store.delete(id);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch {
      const notes = (await this.getAllNotes()).filter(n => n.id !== id);
      localStorage.setItem('sesh_cached_notes', JSON.stringify(notes));
    }
  }

  // --- Metadata / Settings / Labels / Presets ---

  async getMetadata<T>(key: string, defaultValue: T): Promise<T> {
    try {
      const db = await this.getDB();
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_META, 'readonly');
        const store = tx.objectStore(STORE_META);
        const req = store.get(key);
        req.onsuccess = () => {
          if (req.result && req.result.value !== undefined) {
            resolve(req.result.value);
          } else {
            resolve(defaultValue);
          }
        };
        req.onerror = () => resolve(defaultValue);
      });
    } catch {
      const raw = localStorage.getItem(`sesh_meta_${key}`);
      return raw ? JSON.parse(raw) : defaultValue;
    }
  }

  async setMetadata<T>(key: string, value: T): Promise<void> {
    try {
      const db = await this.getDB();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_META, 'readwrite');
        const store = tx.objectStore(STORE_META);
        const req = store.put({ key, value });
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch {
      localStorage.setItem(`sesh_meta_${key}`, JSON.stringify(value));
    }
  }

  async getLabels(): Promise<Label[]> {
    return this.getMetadata<Label[]>('labels', [
      { id: 'lbl-work', name: 'Work', color: '#93C5FD', createdAt: Date.now() },
      { id: 'lbl-personal', name: 'Personal', color: '#84A98C', createdAt: Date.now() },
      { id: 'lbl-ideas', name: 'Ideas', color: '#FFBF24', createdAt: Date.now() },
    ]);
  }

  async saveLabels(labels: Label[]): Promise<void> {
    await this.setMetadata('labels', labels);
  }

  async getPresets(): Promise<AppearancePreset[]> {
    const custom = await this.getMetadata<AppearancePreset[]>('presets', []);
    return [...SYSTEM_PRESETS, ...custom];
  }

  async saveCustomPresets(presets: AppearancePreset[]): Promise<void> {
    const onlyCustom = presets.filter(p => !p.isSystem);
    await this.setMetadata('presets', onlyCustom);
  }

  async getWorkspaceSettings(): Promise<WorkspaceSettings> {
    return this.getMetadata<WorkspaceSettings>('settings', DEFAULT_WORKSPACE_SETTINGS);
  }

  async saveWorkspaceSettings(settings: WorkspaceSettings): Promise<void> {
    await this.setMetadata('settings', settings);
  }
}

export const storageService = new StorageService();
