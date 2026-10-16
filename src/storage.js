const STORAGE_KEY = 'notes-app.notes.v1'

const SEED_NOTE = {
  id: 'seed-welcome',
  title: 'Welcome to Notes',
  body:
    'Everything you write here is saved locally in your browser — it survives refreshes and restarts.\n\n' +
    'Things to try:\n' +
    '  • Click "+ New note" to create a file\n' +
    '  • Click any note in the sidebar to open it\n' +
    '  • Just type — edits autosave instantly\n' +
    '  • Search notes with the box at the top\n' +
    '  • Delete a note with the trash icon\n\n' +
    'Happy vibecoding!',
  createdAt: Date.now(),
  updatedAt: Date.now(),
}

export function loadNotes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return [SEED_NOTE]
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return [SEED_NOTE]
    return parsed
  } catch {
    return [SEED_NOTE]
  }
}

export function saveNotes(notes) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes))
    return true
  } catch {
    return false
  }
}

export function makeNote() {
  const now = Date.now()
  return { id: `note-${now}-${Math.random().toString(36).slice(2, 7)}`, title: '', body: '', createdAt: now, updatedAt: now }
}