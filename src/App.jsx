import { useEffect, useMemo, useRef, useState } from 'react'
import { loadNotes, saveNotes, makeNote } from './storage.js'

function formatWhen(ts) {
  const d = new Date(ts)
  const now = new Date()
  const sameDay = d.toDateString() === now.toDateString()
  if (sameDay) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

function previewOf(note) {
  const line = (note.body || '').split('\n').find((l) => l.trim()) || ''
  return line.trim() || 'Empty note'
}

function titleOf(note) {
  return note.title.trim() || 'Untitled'
}

export default function App() {
  const [notes, setNotes] = useState(() => loadNotes())
  const [activeId, setActiveId] = useState(() => loadNotes()[0]?.id ?? null)
  const [query, setQuery] = useState('')
  const [saved, setSaved] = useState(true)
  const saveTimer = useRef(null)

  // Persist on every change (debounced) so data is retained.
  useEffect(() => {
    setSaved(false)
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      setSaved(saveNotes(notes))
    }, 250)
    return () => clearTimeout(saveTimer.current)
  }, [notes])

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    const sorted = [...notes].sort((a, b) => b.updatedAt - a.updatedAt)
    if (!q) return sorted
    return sorted.filter(
      (n) => titleOf(n).toLowerCase().includes(q) || (n.body || '').toLowerCase().includes(q),
    )
  }, [notes, query])

  const active = notes.find((n) => n.id === activeId) ?? null

  function createNote() {
    const note = makeNote()
    setNotes((prev) => [note, ...prev])
    setActiveId(note.id)
    setQuery('')
  }

  function updateActive(patch) {
    if (!active) return
    setNotes((prev) =>
      prev.map((n) => (n.id === active.id ? { ...n, ...patch, updatedAt: Date.now() } : n)),
    )
  }

  function deleteActive() {
    if (!active) return
    const remaining = notes.filter((n) => n.id !== active.id)
    setNotes(remaining)
    setActiveId(remaining[0]?.id ?? null)
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-head">
          <div className="brand">
            <span className="brand-mark">✎</span> Notes
          </div>
          <button className="btn-new" onClick={createNote}>
            + New note
          </button>
          <input
            className="search"
            type="search"
            placeholder="Search notes…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="note-list" role="list">
          {visible.length === 0 && (
            <p className="empty-list">{query ? 'No matches.' : 'No notes yet — create one!'}</p>
          )}
          {visible.map((n) => (
            <button
              key={n.id}
              role="listitem"
              className={`note-item ${n.id === activeId ? 'active' : ''}`}
              onClick={() => setActiveId(n.id)}
            >
              <span className="note-item-title">{titleOf(n)}</span>
              <span className="note-item-meta">
                <span className="note-item-preview">{previewOf(n)}</span>
                <span className="note-item-date">{formatWhen(n.updatedAt)}</span>
              </span>
            </button>
          ))}
        </div>

        <div className="sidebar-foot">
          <span className={`save-state ${saved ? 'is-saved' : ''}`}>
            {saved ? '● Saved locally' : '○ Saving…'}
          </span>
        </div>
      </aside>

      <main className="editor">
        {active ? (
          <>
            <div className="editor-bar">
              <input
                className="title-input"
                placeholder="Untitled"
                value={active.title}
                onChange={(e) => updateActive({ title: e.target.value })}
              />
              <button className="btn-delete" onClick={deleteActive} title="Delete this note">
                🗑 Delete
              </button>
            </div>
            <textarea
              className="body-input"
              placeholder="Start writing…"
              value={active.body}
              onChange={(e) => updateActive({ body: e.target.value })}
              spellCheck={false}
            />
            <div className="editor-status">
              <span>
                {active.body.length} chars · {active.body.split(/\s+/).filter(Boolean).length} words
              </span>
              <span>Edited {formatWhen(active.updatedAt)}</span>
            </div>
          </>
        ) : (
          <div className="editor-empty">
            <div className="editor-empty-glyph">✎</div>
            <p>No note selected</p>
            <button className="btn-new" onClick={createNote}>
              + New note
            </button>
          </div>
        )}
      </main>
    </div>
  )
}