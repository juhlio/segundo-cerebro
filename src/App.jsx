import { useState, useEffect, useRef } from 'react'
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
  const [navOpen, setNavOpen] = useState(false)
  const navRef = useRef(null)

  useEffect(() => {
    document.documentElement.dataset.theme = darkMode ? 'dark' : ''
    localStorage.setItem(STORAGE_DARK, darkMode)
  }, [darkMode])

  // Fecha nav ao clicar fora no mobile
  useEffect(() => {
    function handleOutsideClick(e) {
      if (navOpen && navRef.current && !navRef.current.contains(e.target)) {
        setNavOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [navOpen])

  // Fecha nav ao redimensionar para desktop
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 768) setNavOpen(false)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  function selectView(id) {
    setView(id)
    setNavOpen(false)
  }

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

        {/* Desktop nav */}
        <nav className="app-nav" role="navigation" aria-label="Visualizações">
          {VIEWS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              className={`app-nav__btn ${view === id ? 'app-nav__btn--active' : ''}`}
              onClick={() => selectView(id)}
              aria-current={view === id ? 'page' : undefined}
            >
              {label}
            </button>
          ))}
        </nav>

        <div className="app-header__controls">
          <button
            type="button"
            className="app-dark-toggle"
            onClick={() => setDarkMode((p) => !p)}
            aria-label={darkMode ? 'Ativar modo claro' : 'Ativar modo escuro'}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>

          {/* Hamburger – só visível em mobile via CSS */}
          <button
            type="button"
            className={`app-hamburger ${navOpen ? 'app-hamburger--open' : ''}`}
            onClick={() => setNavOpen((p) => !p)}
            aria-label="Abrir menu"
            aria-expanded={navOpen}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      {/* Mobile nav drawer */}
      {navOpen && (
        <div className="app-nav-overlay" aria-hidden="true" onClick={() => setNavOpen(false)} />
      )}
      <nav
        ref={navRef}
        className={`app-nav-mobile ${navOpen ? 'app-nav-mobile--open' : ''}`}
        role="navigation"
        aria-label="Menu mobile"
      >
        {VIEWS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            className={`app-nav-mobile__btn ${view === id ? 'app-nav-mobile__btn--active' : ''}`}
            onClick={() => selectView(id)}
          >
            {label}
          </button>
        ))}
      </nav>

      <main className="app-main">
        <Upload onNotesAdd={handleNotesAdd} />

        <div className="app-view">
          {view === 'dashboard' && (
            <Dashboard
              notes={notes}
              selectedNote={selectedNote}
              onSelectNote={setSelectedNote}
            />
          )}
          {view === 'graph' && (
            <Graph
              notes={notes}
              onSelectNote={setSelectedNote}
            />
          )}
          {view === 'editor' && (
            <Editor
              notes={notes}
              selectedNote={selectedNote}
              onSelectNote={setSelectedNote}
              onUpdateNote={handleNoteUpdate}
              onDeleteNote={handleNoteDelete}
            />
          )}
        </div>
      </main>
    </div>
  )
}
