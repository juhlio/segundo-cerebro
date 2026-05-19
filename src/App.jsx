import { useState, useEffect, useRef, lazy, Suspense, useCallback } from 'react'
import ErrorBoundary from './components/ErrorBoundary'
import Toast from './components/Toast'
import Upload from './components/Upload'
import './App.css'

const Dashboard = lazy(() => import('./components/Dashboard'))
const Graph     = lazy(() => import('./components/Graph'))
const Editor    = lazy(() => import('./components/Editor'))

const STORAGE_NOTES = 'segundo-cerebro-notes'
const STORAGE_DARK  = 'segundo-cerebro-dark'

function loadNotes() {
  try { return JSON.parse(localStorage.getItem(STORAGE_NOTES) ?? '[]') }
  catch { return [] }
}

function saveNotes(notes) {
  try { localStorage.setItem(STORAGE_NOTES, JSON.stringify(notes)) }
  catch { /* localStorage indisponível */ }
}

const VIEWS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'graph',     label: 'Grafo' },
  { id: 'editor',    label: 'Editor' }
]

function ViewFallback() {
  return (
    <div className="view-loading" aria-label="Carregando…">
      <span className="view-loading__spinner" aria-hidden="true" />
    </div>
  )
}

export default function App() {
  const [notes, setNotes]             = useState(loadNotes)
  const [selectedNote, setSelectedNote] = useState(null)
  const [view, setView]               = useState('dashboard')
  const [darkMode, setDarkMode]       = useState(() => localStorage.getItem(STORAGE_DARK) === 'true')
  const [navOpen, setNavOpen]         = useState(false)
  const [toast, setToast]             = useState(null) // { id, message, type }
  const navRef = useRef(null)

  useEffect(() => {
    document.documentElement.dataset.theme = darkMode ? 'dark' : ''
    localStorage.setItem(STORAGE_DARK, darkMode)
  }, [darkMode])

  // Close nav when clicking outside
  useEffect(() => {
    function handleOutside(e) {
      if (navOpen && navRef.current && !navRef.current.contains(e.target)) setNavOpen(false)
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [navOpen])

  // Close nav on resize to desktop
  useEffect(() => {
    function onResize() { if (window.innerWidth >= 768) setNavOpen(false) }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const showToast = useCallback((message, type = 'success') => {
    setToast({ id: Date.now(), message, type })
  }, [])

  function selectView(id) {
    setView(id)
    setNavOpen(false)
  }

  function handleNotesAdd(incoming) {
    setNotes((prev) => {
      const existingIds = new Set(prev.map((n) => n.id))
      const merged = [...prev, ...incoming.filter((n) => !existingIds.has(n.id))]
      saveNotes(merged)
      return merged
    })
    showToast(`${incoming.length} nota${incoming.length !== 1 ? 's' : ''} importada${incoming.length !== 1 ? 's' : ''}`)
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
    showToast('Nota deletada', 'info')
  }

  const handleSaveSuccess = useCallback(() => showToast('Nota salva'), [showToast])

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header__brand">
          <span className="app-header__logo" aria-hidden="true">🧠</span>
          <h1 className="app-header__title">Segundo Cérebro</h1>
          <span className="app-header__count" aria-label={`${notes.length} notas`}>
            {notes.length} {notes.length === 1 ? 'nota' : 'notas'}
          </span>
        </div>

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

          <button
            type="button"
            className={`app-hamburger ${navOpen ? 'app-hamburger--open' : ''}`}
            onClick={() => setNavOpen((p) => !p)}
            aria-label={navOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={navOpen}
            aria-controls="mobile-nav"
          >
            <span aria-hidden="true" />
            <span aria-hidden="true" />
            <span aria-hidden="true" />
          </button>
        </div>
      </header>

      {navOpen && <div className="app-nav-overlay" onClick={() => setNavOpen(false)} aria-hidden="true" />}

      <nav
        id="mobile-nav"
        ref={navRef}
        className={`app-nav-mobile ${navOpen ? 'app-nav-mobile--open' : ''}`}
        role="navigation"
        aria-label="Menu mobile"
        aria-hidden={!navOpen}
      >
        {VIEWS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            className={`app-nav-mobile__btn ${view === id ? 'app-nav-mobile__btn--active' : ''}`}
            onClick={() => selectView(id)}
            tabIndex={navOpen ? 0 : -1}
          >
            {label}
          </button>
        ))}
      </nav>

      <main className="app-main">
        <Upload onNotesAdd={handleNotesAdd} />

        <div className="app-view">
          <ErrorBoundary>
            <Suspense fallback={<ViewFallback />}>
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
                  onSaveSuccess={handleSaveSuccess}
                />
              )}
            </Suspense>
          </ErrorBoundary>
        </div>
      </main>

      {toast && (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onDismiss={() => setToast(null)}
        />
      )}
    </div>
  )
}
