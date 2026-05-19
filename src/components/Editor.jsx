import { useState, useEffect } from 'react'
import './Editor.css'

function NotesList({ notes, selectedNote, onSelectNote }) {
  return (
    <aside className="notes-list">
      <h2 className="notes-list__title">Suas notas</h2>
      <ul className="notes-list__items" role="listbox" aria-label="Lista de notas">
        {notes.length === 0 && (
          <li className="notes-list__empty">Nenhuma nota ainda</li>
        )}
        {notes.map((note) => (
          <li
            key={note.id}
            role="option"
            aria-selected={selectedNote?.id === note.id}
            className={`notes-list__item ${selectedNote?.id === note.id ? 'notes-list__item--active' : ''}`}
            onClick={() => onSelectNote(note)}
            onKeyDown={(e) => e.key === 'Enter' && onSelectNote(note)}
            tabIndex={0}
          >
            {note.title || 'Sem título'}
          </li>
        ))}
      </ul>
    </aside>
  )
}

export default function Editor({ notes = [], selectedNote, onSelectNote, onUpdateNote, onDeleteNote }) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isDirty, setIsDirty] = useState(false)

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
  }, [selectedNote?.id])

  function handleTitleChange(e) {
    setTitle(e.target.value)
    setIsDirty(true)
  }

  function handleContentChange(e) {
    setContent(e.target.value)
    setIsDirty(true)
  }

  function handleSave() {
    if (!selectedNote) return
    const updated = { ...selectedNote, title, content }
    onUpdateNote?.(updated)
    persistToStorage(updated)
    setIsDirty(false)
  }

  function handleDelete() {
    if (!selectedNote) return
    const confirmed = window.confirm(`Deletar "${title || 'esta nota'}"?`)
    if (!confirmed) return
    removeFromStorage(selectedNote.id)
    onDeleteNote?.(selectedNote.id)
  }

  function persistToStorage(note) {
    try {
      const stored = JSON.parse(localStorage.getItem('segundo-cerebro-notes') ?? '[]')
      const updated = stored.some((n) => n.id === note.id)
        ? stored.map((n) => (n.id === note.id ? note : n))
        : [...stored, note]
      localStorage.setItem('segundo-cerebro-notes', JSON.stringify(updated))
    } catch {
      // localStorage indisponível
    }
  }

  function removeFromStorage(id) {
    try {
      const stored = JSON.parse(localStorage.getItem('segundo-cerebro-notes') ?? '[]')
      localStorage.setItem('segundo-cerebro-notes', JSON.stringify(stored.filter((n) => n.id !== id)))
    } catch {
      // localStorage indisponível
    }
  }

  return (
    <div className="editor-layout">
      <NotesList notes={notes} selectedNote={selectedNote} onSelectNote={onSelectNote} />

      <div className="editor-panel">
        {!selectedNote ? (
          <div className="editor-empty">
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
                aria-label="Título"
              />
              <textarea
                className="editor-content"
                placeholder="Conteúdo em Markdown..."
                value={content}
                onChange={handleContentChange}
                aria-label="Conteúdo"
                spellCheck
              />
            </div>

            <footer className="editor-footer">
              {isDirty && <span className="editor-unsaved">● Alterações não salvas</span>}
              <div className="editor-actions">
                <button
                  className="btn btn--danger"
                  onClick={handleDelete}
                  type="button"
                >
                  Deletar
                </button>
                <button
                  className="btn btn--primary"
                  onClick={handleSave}
                  type="button"
                  disabled={!isDirty}
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
