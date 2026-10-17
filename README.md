# Sesh@
### A Highly Customizable, Google Drive-Powered Notes Workspace

Inspired by the quick usability of Google Keep, elevated with **Note Design Studio**, interactive checklists, stylus drawings, images, and 100% user-owned Google Drive storage.

---

## 🎨 Official Brand Identity
- **Sesh Yellow**: `#FFBF24` (Primary highlights, buttons, badges)
- **Amber**: `#F59E0B` (Interactive hover accents)
- **Sage**: `#84A98C` (Botanical labels, calm tones)
- **Sky**: `#93C5FD` (Informational accents, links)
- **Peach**: `#FCA5A5` (Reminders, priorities, emphasis)
- **Midnight**: `#0F172A` (Headings, typography, dark mode)
- **Ivory**: `#FFFBF2` (Workspace surface, light mode)

## 📁 Google Drive-First Storage Architecture
- Root Workspace Folder: `Sesh@ Workspace`
- Index file: `workspace-index.json`
- Individual Notes: `notes/note_<id>.json`
- Attachments & Drawings: stored as files directly in user's Drive folder
- **Zero Paid Database Requirement**: Uses Google Drive API v3 + IndexedDB local cache for offline-first reliability.

## 🚀 Two-Application Repository Structure
- `frontend/` - Next.js TypeScript application for **Vercel Hobby** deployment
- `backend/` - Node.js TypeScript API with `/api/health` for **Render Free Web Service** deployment
- Root application runs as a high-performance React SPA on Vite inside AI Studio on port 3000.

## ⚡ Key Features
1. **Google Drive Sync & Indicator**: Real-time sync with saving, saved, and offline cache status.
2. **Note Design Studio**: Per-note customization of solid colors, gradients, background textures, typography, corner radii, borders, and shadow elevation.
3. **Reusable Appearance Presets**: Save and apply custom card presets.
4. **Drawing Canvas**: Freehand stylus/pen, highlighter, eraser, line tool, background grids/ruled lines, undo/redo, and PNG export.
5. **Interactive Checklists**: Drag-and-drop feeling, strike-through completion, and auto-move to bottom.
6. **Image Gallery**: Multiple image uploads with lightbox modal.
7. **Safe Collaboration & Sharing**: Invite by email, Viewer/Editor roles, and share links.
8. **Workspace Customization**: Light/Dark theme, wallpaper patterns, and layouts (Masonry, Compact, List).
