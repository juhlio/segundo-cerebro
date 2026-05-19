import { useState, useEffect } from 'react'
import Upload from './components/Upload'
import Dashboard from './components/Dashboard'
import Graph from './components/Graph'
import Editor from './components/Editor'
import './App.css'

const STORAGE_NOTES = 'segundo-cerebro-notes'
const STORAGE_DARK = 'segundo-cerebro-dark'

function loadNotes() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_NOTES) ?? '[]')
  } catch {
    return []
  }
}

function saveNotes(notes) {
  try {
    localStorage.setItem(STORAGE_NOTES, JSON.stringify(notes))
  } catch {
    // localStorage indisponível
  }
}

const VIEWS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'graph', label: 'Grafo' },
  { id: 'editor', label: 'Editor' }
]

export default function App() {
  const [notes, setNotes] = useState(loadNotes)
  const [selectedNote, setSelectedNote] = useState(null)
  const [view, setView] = useState('dashboard')
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem(STORAGE_DARK) === 'true'
  )

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
    localStorage.setItem(STORAGE_DARK, darkMode)
  }, [darkMode])

  function handleNotesAdd(incoming) {
    setNotes((prev) => {
      const existingIds = new Set(prev.map((n) => n.id))
      const merged = [
        ...prev,
        ...incoming.filter((n) => !existingIds.has(n.id))
      ]
      saveNotes(merged)
      return merged
    })
  }

  function handleNoteUpdate(updated) {
    setNotes((prev) => {
      const next = prev.map((n) => (n.id === updated.id ? updated : n))
      saveNotes(next)
      return next
    })
    setSelectedNote(updated)
  }

  function handleNoteDelete(id) {
    setNotes((prev) => {
      const next = prev.filter((n) => n.id !== id)
      saveNotes(next)
      return next
    })
    setSelectedNote((prev) => (prev?.id === id ? null : prev))
  }

  function handleSelectNote(note) {
    setSelectedNote(note)
  }

  function toggleDarkMode() {
    setDarkMode((prev) => !prev)
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header__brand">
          <span className="app-header__logo">🧠</span>
          <h1 className="app-header__title">Segundo Cérebro</h1>
          <span className="app-header__count">
            {notes.length} {notes.length === 1 ? 'nota' : 'notas'}
          </span>
        </div>

        <nav className="app-nav" role="navigation" aria-label="Visualizações">
          {VIEWS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              className={`app-nav__btn ${view === id ? 'app-nav__btn--active' : ''}`}
              onClick={() => setView(id)}
              aria-current={view === id ? 'page' : undefined}
            >
              {label}
            </button>
          ))}
        </nav>

        <button
          type="button"
          className="app-dark-toggle"
          onClick={toggleDarkMode}
          aria-label={darkMode ? 'Ativar modo claro' : 'Ativar modo escuro'}
        >
          {darkMode ? '☀️' : '🌙'}
        </button>
      </header>

      <main className="app-main">
        <Upload onNotesAdd={handleNotesAdd} />

        <div className="app-view">
          {view === 'dashboard' && (
            <Dashboard
              notes={notes}
              selectedNote={selectedNote}
              onSelectNote={handleSelectNote}
            />
          )}
          {view === 'graph' && (
            <Graph
              notes={notes}
              onSelectNote={handleSelectNote}
            />
          )}
          {view === 'editor' && (
            <Editor
              notes={notes}
              selectedNote={selectedNote}
              onSelectNote={handleSelectNote}
              onUpdateNote={handleNoteUpdate}
              onDeleteNote={handleNoteDelete}
            />
          )}
        </div>
      </main>
    </div>
  )
}
