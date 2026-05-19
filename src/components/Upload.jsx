import { useRef } from 'react'
import { parseMD } from '../utils/markdown'
import './Upload.css'

async function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target.result)
    reader.onerror = () => reject(new Error(`Falha ao ler ${file.name}`))
    reader.readAsText(file, 'utf-8')
  })
}

export default function Upload({ onNotesAdd }) {
  const inputRef = useRef(null)

  async function handleFiles(e) {
    const files = [...e.target.files].filter((f) => f.name.endsWith('.md'))
    if (files.length === 0) return

    const notes = await Promise.all(
      files.map(async (file) => {
        const raw = await readFile(file)
        return parseMD(raw, file.name)
      })
    )

    onNotesAdd?.(notes)
    e.target.value = ''
  }

  return (
    <section className="upload">
      <h2 className="upload__title">📁 Carregar seus arquivos Markdown</h2>

      <div className="upload__actions">
        <button
          className="upload__btn upload__btn--primary"
          type="button"
          onClick={() => inputRef.current?.click()}
        >
          📄 Arquivos MD
        </button>

        <button
          className="upload__btn upload__btn--secondary"
          type="button"
          disabled
          title="Disponível em breve"
        >
          📁 Pasta ZIP
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".md"
        multiple
        hidden
        onChange={handleFiles}
        aria-label="Selecionar arquivos Markdown"
      />
    </section>
  )
}
