import './Dashboard.css'

function NoteCard({ note, isSelected, onSelect }) {
  const preview = note.content?.slice(0, 60) ?? ''
  const tags = note.tags?.slice(0, 2) ?? []

  return (
    <article
      className={`note-card ${isSelected ? 'note-card--selected' : ''}`}
      onClick={() => onSelect(note)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onSelect(note)}
      aria-pressed={isSelected}
    >
      <h3 className="note-card__title">{note.title}</h3>

      {preview && (
        <p className="note-card__preview">
          {preview}{note.content?.length > 60 ? '…' : ''}
        </p>
      )}

      {tags.length > 0 && (
        <div className="note-card__tags">
          {tags.map((tag) => (
            <span key={tag} className="note-card__tag">#{tag}</span>
          ))}
        </div>
      )}
    </article>
  )
}

function CategoryGroup({ category, notes, selectedNote, onSelectNote }) {
  return (
    <section className="category-group">
      <h2 className="category-group__title">{category}</h2>
      <div className="notes-grid">
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
}

export default function Dashboard({ notes = [], selectedNote, onSelectNote }) {
  if (notes.length === 0) {
    return (
      <div className="dashboard-empty">
        <p>👆 Comece enviando seus arquivos MD acima</p>
      </div>
    )
  }

  const grouped = notes.reduce((acc, note) => {
    const category = note.category || 'Sem categoria'
    if (!acc[category]) acc[category] = []
    acc[category].push(note)
    return acc
  }, {})

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
