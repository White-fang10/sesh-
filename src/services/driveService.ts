/**
 * Sesh@ Google Drive API Service
 * Handles folder creation, file uploads, workspace-index.json sync, and attachments
 */

import { Note, WorkspaceIndex, Label, AppearancePreset, WorkspaceSettings } from '../types/note';
import { SYSTEM_PRESETS } from '../constants/presets';
import { getAccessToken } from './firebase';

const DRIVE_API_URL = 'https://www.googleapis.com/drive/v3';
const UPLOAD_API_URL = 'https://www.googleapis.com/upload/drive/v3';
const WORKSPACE_FOLDER_NAME = 'Sesh@ Workspace';
const INDEX_FILE_NAME = 'workspace-index.json';

export interface DriveQuotaInfo {
  limit: number;
  usage: number;
  usageInDrive: number;
  userDisplayName?: string;
  userEmail?: string;
  userPhotoUrl?: string;
}

class DriveService {
  private workspaceFolderId: string | null = null;
  private indexFileId: string | null = null;

  private async getAuthHeader(): Promise<Record<string, string>> {
    const token = await getAccessToken();
    if (!token) {
      throw new Error('NO_TOKEN: Google Drive access token missing or expired.');
    }
    return {
      Authorization: `Bearer ${token}`,
    };
  }

  /**
   * Fetch user profile & Drive storage quota from Google Drive API
   */
  async getStorageQuota(): Promise<DriveQuotaInfo | null> {
    try {
      const headers = await this.getAuthHeader();
      const res = await fetch(`${DRIVE_API_URL}/about?fields=storageQuota,user`, { headers });
      if (!res.ok) {
        if (res.status === 401) throw new Error('TOKEN_EXPIRED');
        return null;
      }
      const data = await res.json();
      return {
        limit: Number(data.storageQuota?.limit || 15 * 1024 * 1024 * 1024),
        usage: Number(data.storageQuota?.usage || 0),
        usageInDrive: Number(data.storageQuota?.usageInDrive || 0),
        userDisplayName: data.user?.displayName,
        userEmail: data.user?.emailAddress,
        userPhotoUrl: data.user?.photoLink,
      };
    } catch (err: any) {
      if (err.message === 'TOKEN_EXPIRED') throw err;
      return null;
    }
  }

  /**
   * Initialize or locate the Sesh@ Workspace folder in user's Drive
   */
  async getOrCreateWorkspaceFolder(): Promise<string> {
    if (this.workspaceFolderId) return this.workspaceFolderId;

    const headers = await this.getAuthHeader();
    // Query for folder
    const query = encodeURIComponent(
      `name = '${WORKSPACE_FOLDER_NAME}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`
    );
    const searchRes = await fetch(`${DRIVE_API_URL}/files?q=${query}&fields=files(id,name)`, {
      headers,
    });

    if (!searchRes.ok) {
      if (searchRes.status === 401) throw new Error('TOKEN_EXPIRED');
      throw new Error(`Failed to search Drive folder: ${searchRes.statusText}`);
    }

    const searchData = await searchRes.json();
    if (searchData.files && searchData.files.length > 0) {
      this.workspaceFolderId = searchData.files[0].id;
      return this.workspaceFolderId!;
    }

    // Create workspace folder
    const createRes = await fetch(`${DRIVE_API_URL}/files`, {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: WORKSPACE_FOLDER_NAME,
        mimeType: 'application/vnd.google-apps.folder',
        description: 'Sesh@ Notes Workspace root folder',
      }),
    });

    if (!createRes.ok) {
      if (createRes.status === 401) throw new Error('TOKEN_EXPIRED');
      throw new Error(`Failed to create Sesh@ folder in Drive: ${createRes.statusText}`);
    }

    const folder = await createRes.json();
    this.workspaceFolderId = folder.id;
    return this.workspaceFolderId!;
  }

  /**
   * Load or initialize workspace-index.json
   */
  async getWorkspaceIndex(): Promise<{ index: WorkspaceIndex | null; fileId: string | null }> {
    const folderId = await this.getOrCreateWorkspaceFolder();
    const headers = await this.getAuthHeader();

    const query = encodeURIComponent(
      `name = '${INDEX_FILE_NAME}' and '${folderId}' in parents and trashed = false`
    );
    const res = await fetch(`${DRIVE_API_URL}/files?q=${query}&fields=files(id,name)`, { headers });
    if (!res.ok) {
      if (res.status === 401) throw new Error('TOKEN_EXPIRED');
      return { index: null, fileId: null };
    }

    const data = await res.json();
    if (data.files && data.files.length > 0) {
      this.indexFileId = data.files[0].id;
      const fileRes = await fetch(`${DRIVE_API_URL}/files/${this.indexFileId}?alt=media`, {
        headers,
      });
      if (fileRes.ok) {
        const indexData: WorkspaceIndex = await fileRes.json();
        return { index: indexData, fileId: this.indexFileId };
      }
    }

    return { index: null, fileId: null };
  }

  /**
   * Save or update workspace-index.json in Drive
   */
  async saveWorkspaceIndex(index: WorkspaceIndex): Promise<string> {
    const folderId = await this.getOrCreateWorkspaceFolder();
    const headers = await this.getAuthHeader();

    const boundary = '-------SeshIndexBoundary' + Math.random().toString(36).substring(2);
    const metadata = {
      name: INDEX_FILE_NAME,
      mimeType: 'application/json',
      ...(!this.indexFileId ? { parents: [folderId] } : {}),
    };

    const multipartRequestBody =
      `--${boundary}\r\n` +
      `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
      JSON.stringify(metadata) +
      `\r\n` +
      `--${boundary}\r\n` +
      `Content-Type: application/json\r\n\r\n` +
      JSON.stringify(index, null, 2) +
      `\r\n` +
      `--${boundary}--`;

    let url = `${UPLOAD_API_URL}/files?uploadType=multipart`;
    let method = 'POST';

    if (this.indexFileId) {
      url = `${UPLOAD_API_URL}/files/${this.indexFileId}?uploadType=multipart`;
      method = 'PATCH';
    }

    const res = await fetch(url, {
      method,
      headers: {
        ...headers,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: multipartRequestBody,
    });

    if (!res.ok) {
      if (res.status === 401) throw new Error('TOKEN_EXPIRED');
      throw new Error(`Failed to save workspace index to Drive: ${res.statusText}`);
    }

    const file = await res.json();
    this.indexFileId = file.id;
    return file.id;
  }

  /**
   * Save or update an individual note in Drive
   */
  async saveNoteToDrive(note: Note): Promise<string> {
    const folderId = await this.getOrCreateWorkspaceFolder();
    const headers = await this.getAuthHeader();

    const fileName = `note_${note.id}.json`;
    const boundary = '-------SeshNoteBoundary' + Math.random().toString(36).substring(2);

    const metadata = {
      name: fileName,
      mimeType: 'application/json',
      description: `Sesh@ Note: ${note.title || 'Untitled'}`,
      ...(!note.driveFileId ? { parents: [folderId] } : {}),
    };

    const multipartRequestBody =
      `--${boundary}\r\n` +
      `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
      JSON.stringify(metadata) +
      `\r\n` +
      `--${boundary}\r\n` +
      `Content-Type: application/json\r\n\r\n` +
      JSON.stringify(note, null, 2) +
      `\r\n` +
      `--${boundary}--`;

    let url = `${UPLOAD_API_URL}/files?uploadType=multipart`;
    let method = 'POST';

    if (note.driveFileId) {
      url = `${UPLOAD_API_URL}/files/${note.driveFileId}?uploadType=multipart`;
      method = 'PATCH';
    }

    const res = await fetch(url, {
      method,
      headers: {
        ...headers,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: multipartRequestBody,
    });

    if (!res.ok) {
      if (res.status === 401) throw new Error('TOKEN_EXPIRED');
      throw new Error(`Failed to upload note to Drive: ${res.statusText}`);
    }

    const result = await res.json();
    return result.id;
  }

  /**
   * Load an individual note from Drive by file ID
   */
  async loadNoteFromDrive(fileId: string): Promise<Note | null> {
    const headers = await this.getAuthHeader();
    const res = await fetch(`${DRIVE_API_URL}/files/${fileId}?alt=media`, { headers });
    if (!res.ok) {
      if (res.status === 401) throw new Error('TOKEN_EXPIRED');
      return null;
    }
    const note: Note = await res.json();
    note.driveFileId = fileId;
    return note;
  }

  /**
   * Delete note file from Drive (or move to trash)
   */
  async deleteNoteFromDrive(fileId: string): Promise<void> {
    const headers = await this.getAuthHeader();
    const res = await fetch(`${DRIVE_API_URL}/files/${fileId}`, {
      method: 'DELETE',
      headers,
    });
    if (!res.ok && res.status !== 404) {
      if (res.status === 401) throw new Error('TOKEN_EXPIRED');
      throw new Error(`Failed to delete note from Drive: ${res.statusText}`);
    }
  }

  /**
   * Get direct web URL to the Sesh@ Workspace folder in Google Drive
   */
  async getWorkspaceFolderUrl(): Promise<string> {
    const folderId = await this.getOrCreateWorkspaceFolder();
    return `https://drive.google.com/drive/folders/${folderId}`;
  }

  /**
   * Upload an image attachment or drawing to Google Drive
   */
  async uploadImageToDrive(
    fileOrDataUrl: File | Blob | string,
    name: string
  ): Promise<{ fileId: string; webViewLink?: string; thumbnailLink?: string }> {
    const folderId = await this.getOrCreateWorkspaceFolder();
    const headers = await this.getAuthHeader();

    let mimeType = 'image/png';
    let base64Data = '';

    if (typeof fileOrDataUrl === 'string') {
      const match = fileOrDataUrl.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        mimeType = match[1];
        base64Data = match[2];
      } else {
        base64Data = btoa(fileOrDataUrl);
      }
    } else {
      mimeType = fileOrDataUrl.type || 'image/png';
      const arrayBuffer = await fileOrDataUrl.arrayBuffer();
      let binary = '';
      const bytes = new Uint8Array(arrayBuffer);
      const len = bytes.byteLength;
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      base64Data = btoa(binary);
    }

    const boundary = '-------SeshImgBoundary' + Math.random().toString(36).substring(2);
    const metadata = {
      name: `img_${Date.now()}_${name}`,
      mimeType,
      parents: [folderId],
    };

    const metadataHeader =
      `--${boundary}\r\n` +
      `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
      JSON.stringify(metadata) +
      `\r\n` +
      `--${boundary}\r\n` +
      `Content-Type: ${mimeType}\r\n` +
      `Content-Transfer-Encoding: base64\r\n\r\n`;

    const fullBody = metadataHeader + base64Data + `\r\n--${boundary}--`;

    const res = await fetch(
      `${UPLOAD_API_URL}/files?uploadType=multipart&fields=id,webViewLink,thumbnailLink`,
      {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': `multipart/related; boundary=${boundary}`,
        },
        body: fullBody,
      }
    );

    if (!res.ok) {
      if (res.status === 401) throw new Error('TOKEN_EXPIRED');
      throw new Error(`Failed to upload image to Drive: ${res.statusText}`);
    }

    const data = await res.json();
    return {
      fileId: data.id,
      webViewLink: data.webViewLink,
      thumbnailLink: data.thumbnailLink,
    };
  }

  /**
   * Load all notes in the Sesh@ Workspace folder
   */
  async loadAllWorkspaceNotes(): Promise<{ notes: Note[]; index: WorkspaceIndex | null }> {
    const folderId = await this.getOrCreateWorkspaceFolder();
    const headers = await this.getAuthHeader();

    // 1. Get index
    const { index } = await this.getWorkspaceIndex();

    // 2. Query all note JSON files in folder
    const query = encodeURIComponent(
      `'${folderId}' in parents and mimeType = 'application/json' and name contains 'note_' and trashed = false`
    );
    const res = await fetch(`${DRIVE_API_URL}/files?q=${query}&fields=files(id,name,modifiedTime)`, {
      headers,
    });

    if (!res.ok) {
      if (res.status === 401) throw new Error('TOKEN_EXPIRED');
      return { notes: [], index };
    }

    const data = await res.json();
    const files = data.files || [];

    const notes: Note[] = [];
    for (const f of files) {
      try {
        const note = await this.loadNoteFromDrive(f.id);
        if (note) notes.push(note);
      } catch (err) {
        console.warn(`Could not load note ${f.name} from Drive:`, err);
      }
    }

    return { notes, index };
  }

  /**
   * Sync Master Workspace Index (Custom Presets, Labels, Settings, Notes Metadata)
   */
  async syncWorkspaceMetadata(
    localPresets: AppearancePreset[],
    localLabels: Label[],
    localSettings: WorkspaceSettings,
    notes: Note[]
  ): Promise<{
    presets: AppearancePreset[];
    labels: Label[];
    settings: WorkspaceSettings;
  }> {
    const { index } = await this.getWorkspaceIndex();

    // Notes metadata registry
    const notesMeta = notes.map((n) => ({
      id: n.id,
      title: n.title || 'Untitled',
      driveFileId: n.driveFileId,
      updatedAt: n.updatedAt,
      isPinned: n.isPinned,
      isArchived: n.isArchived,
      isTrashed: n.isTrashed,
      labels: n.labels || [],
    }));

    // Merge custom presets
    const customLocal = localPresets.filter((p) => !p.isSystem);
    const customRemote = (index?.presets || []).filter((p) => !p.isSystem);

    const presetMap = new Map<string, AppearancePreset>();
    for (const p of customLocal) presetMap.set(p.id, p);
    for (const p of customRemote) {
      if (!presetMap.has(p.id) || (p.createdAt && presetMap.get(p.id)!.createdAt < p.createdAt)) {
        presetMap.set(p.id, p);
      }
    }
    const mergedCustom = Array.from(presetMap.values());
    const allPresets = [...SYSTEM_PRESETS, ...mergedCustom];

    // Merge labels
    const labelMap = new Map<string, Label>();
    for (const l of localLabels) labelMap.set(l.id, l);
    for (const l of index?.labels || []) {
      if (!labelMap.has(l.id)) labelMap.set(l.id, l);
    }
    const mergedLabels = Array.from(labelMap.values());

    const mergedSettings = index?.workspaceSettings || localSettings;

    const newIndex: WorkspaceIndex = {
      version: 1,
      workspaceName: WORKSPACE_FOLDER_NAME,
      lastUpdated: Date.now(),
      notesMeta,
      labels: mergedLabels,
      presets: mergedCustom,
      workspaceSettings: mergedSettings,
    };

    try {
      await this.saveWorkspaceIndex(newIndex);
    } catch (e) {
      console.warn('Workspace index save failed, will retry next sync:', e);
    }

    return {
      presets: allPresets,
      labels: mergedLabels,
      settings: mergedSettings,
    };
  }
}

export const driveService = new DriveService();
