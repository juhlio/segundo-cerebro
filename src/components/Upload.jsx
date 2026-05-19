import { useRef } from 'react'
import './Upload.css'

function parseMarkdown(filename, raw) {
  const lines = raw.split('\n')

  const titleLine = lines.find((l) => l.startsWith('# '))
  const title = titleLine ? titleLine.replace(/^#\s+/, '').trim() : filename.replace(/\.md$/i, '')

  const tagLine = lines.find((l) => /\*\*Tags:\*\*/i.test(l))
  const tags = tagLine
    ? [...tagLine.matchAll(/#([\w-]+)/g)].map((m) => m[1])
    : []

  const links = [...raw.matchAll(/\[\[([^\]]+)\]\]/g)].map((m) => m[1].trim())

  const categoryLine = lines.find((l) => l.startsWith('## '))
  const category = categoryLine ? categoryLine.replace(/^##\s+/, '').trim() : 'Sem categoria'

  const type = detectType(tags)

  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

  return { id, title, content: raw, tags, links, category, type }
}

function detectType(tags) {
  const lower = tags.map((t) => t.toLowerCase())
  if (lower.some((t) => ['projeto', 'project', 'projetos'].includes(t))) return 'project'
  if (lower.some((t) => ['area', 'área', 'areas', 'áreas'].includes(t))) return 'area'
  return 'note'
}

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
        return parseMarkdown(file.name, raw)
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
