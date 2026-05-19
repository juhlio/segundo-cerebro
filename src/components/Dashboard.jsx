import { memo, useMemo } from 'react'
import { markdownToPreview } from '../utils/markdown'
import './Dashboard.css'

const NoteCard = memo(function NoteCard({ note, isSelected, onSelect }) {
  const preview = useMemo(() => markdownToPreview(note.content), [note.content])
  const tags = note.tags?.slice(0, 2) ?? []

  return (
    <article
      className={`note-card ${isSelected ? 'note-card--selected' : ''}`}
      onClick={() => onSelect(note)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onSelect(note)}
      aria-pressed={isSelected}
      aria-label={`Nota: ${note.title || 'Sem título'}`}
    >
      <h3 className="note-card__title">{note.title || 'Sem título'}</h3>

      {preview && (
        <p className="note-card__preview">{preview}</p>
      )}

      {tags.length > 0 && (
        <div className="note-card__tags" aria-label="Tags">
          {tags.map((tag) => (
            <span key={tag} className="note-card__tag">#{tag}</span>
          ))}
        </div>
      )}
    </article>
  )
})

const CategoryGroup = memo(function CategoryGroup({ category, notes, selectedNote, onSelectNote }) {
  return (
    <section className="category-group" aria-labelledby={`cat-${category}`}>
      <h2 id={`cat-${category}`} className="category-group__title">{category}</h2>
      <div className="notes-grid" role="list">
        {notes.map((note) => (
          <NoteCard
            key={note.id}
            note={note}
            isSelected={selectedNote?.id === note.id}
            onSelect={onSelectNote}
          />
        ))}
      </div>
    </section>
  )
})

export default function Dashboard({ notes = [], selectedNote, onSelectNote }) {
  const grouped = useMemo(() => {
    return notes.reduce((acc, note) => {
      const category = note.category || 'Sem categoria'
      if (!acc[category]) acc[category] = []
      acc[category].push(note)
      return acc
    }, {})
  }, [notes])

  if (notes.length === 0) {
    return (
      <div className="dashboard-empty" role="status" aria-live="polite">
        <p>👆 Comece enviando seus arquivos MD acima</p>
      </div>
    )
  }

  return (
    <div className="dashboard">
      {Object.entries(grouped).map(([category, categoryNotes]) => (
        <CategoryGroup
          key={category}
          category={category}
          notes={categoryNotes}
          selectedNote={selectedNote}
          onSelectNote={onSelectNote}
        />
      ))}
    </div>
  )
}
