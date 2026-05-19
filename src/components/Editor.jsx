import { useState, useEffect, useRef, useMemo, useCallback, memo } from 'react'
import './Editor.css'

const AUTO_SAVE_DELAY = 1500 // ms

const NoteItem = memo(function NoteItem({ note, isActive, onSelect }) {
  return (
    <li
      role="option"
      aria-selected={isActive}
      className={`notes-list__item ${isActive ? 'notes-list__item--active' : ''}`}
      onClick={() => onSelect(note)}
      onKeyDown={(e) => e.key === 'Enter' && onSelect(note)}
      tabIndex={0}
    >
      {note.title || 'Sem título'}
    </li>
  )
})

const NotesList = memo(function NotesList({ notes, selectedNote, onSelectNote }) {
  return (
    <aside className="notes-list" aria-label="Lista de notas">
      <h2 className="notes-list__title">Suas notas</h2>
      <ul className="notes-list__items" role="listbox" aria-label="Notas">
        {notes.length === 0 && (
          <li className="notes-list__empty" aria-live="polite">Nenhuma nota ainda</li>
        )}
        {notes.map((note) => (
          <NoteItem
            key={note.id}
            note={note}
            isActive={selectedNote?.id === note.id}
            onSelect={onSelectNote}
          />
        ))}
      </ul>
    </aside>
  )
})

export default function Editor({ notes = [], selectedNote, onSelectNote, onUpdateNote, onDeleteNote, onSaveSuccess }) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isDirty, setIsDirty] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Always-fresh ref to avoid stale closures in effects
  const latestRef = useRef({})
  latestRef.current = { selectedNote, title, content, isDirty, onUpdateNote, onSaveSuccess }

  const isFirstRender = useRef(true)

  // Sync local state when the selected note changes
  useEffect(() => {
    if (!selectedNote) {
      setTitle('')
      setContent('')
      setIsDirty(false)
      return
    }
    setTitle(selectedNote.title ?? '')
    setContent(selectedNote.content ?? '')
    setIsDirty(false)
    isFirstRender.current = true
  }, [selectedNote?.id])

  const doSave = useCallback(() => {
    const { selectedNote, title, content, isDirty, onUpdateNote, onSaveSuccess } = latestRef.current
    if (!selectedNote || !isDirty) return
    setIsSaving(true)
    const updated = { ...selectedNote, title, content, updatedAt: Date.now() }
    onUpdateNote?.(updated)
    setIsDirty(false)
    setTimeout(() => setIsSaving(false), 600)
    onSaveSuccess?.()
  }, [])

  // Auto-save debounce
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    if (!latestRef.current.isDirty || !latestRef.current.selectedNote) return
    const timer = setTimeout(doSave, AUTO_SAVE_DELAY)
    return () => clearTimeout(timer)
  }, [title, content, doSave])

  // Ctrl+S / Cmd+S shortcut
  useEffect(() => {
    function onKeyDown(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        doSave()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [doSave])

  function handleTitleChange(e) {
    setTitle(e.target.value)
    setIsDirty(true)
  }

  function handleContentChange(e) {
    setContent(e.target.value)
    setIsDirty(true)
  }

  function handleDelete() {
    if (!selectedNote) return
    const confirmed = window.confirm(`Deletar "${title || 'esta nota'}"?`)
    if (!confirmed) return
    onDeleteNote?.(selectedNote.id)
  }

  const sortedNotes = useMemo(
    () => [...notes].sort((a, b) => (a.title ?? '').localeCompare(b.title ?? '', 'pt-BR')),
    [notes]
  )

  return (
    <div className="editor-layout">
      <NotesList notes={sortedNotes} selectedNote={selectedNote} onSelectNote={onSelectNote} />

      <div className="editor-panel">
        {!selectedNote ? (
          <div className="editor-empty" aria-live="polite">
            <p>Selecione uma nota para editar</p>
          </div>
        ) : (
          <>
            <div className="editor-body">
              <input
                className="editor-title"
                type="text"
                placeholder="Título da nota"
                value={title}
                onChange={handleTitleChange}
                aria-label="Título da nota"
                maxLength={200}
              />
              <textarea
                className="editor-content"
                placeholder="Conteúdo em Markdown…"
                value={content}
                onChange={handleContentChange}
                aria-label="Conteúdo da nota em Markdown"
                spellCheck
              />
            </div>

            <footer className="editor-footer">
              <span
                className={`editor-status ${isSaving ? 'editor-status--saving' : isDirty ? 'editor-status--dirty' : 'editor-status--saved'}`}
                aria-live="polite"
              >
                {isSaving ? '⟳ Salvando…' : isDirty ? '● Não salvo' : '✓ Salvo'}
              </span>

              <div className="editor-actions">
                <button
                  className="btn btn--danger"
                  onClick={handleDelete}
                  type="button"
                  aria-label={`Deletar nota: ${title || 'sem título'}`}
                >
                  Deletar
                </button>
                <button
                  className="btn btn--primary"
                  onClick={doSave}
                  type="button"
                  disabled={!isDirty}
                  aria-label="Salvar nota (Ctrl+S)"
                  title="Ctrl+S"
                >
                  Salvar
                </button>
              </div>
            </footer>
          </>
        )}
      </div>
    </div>
  )
}
