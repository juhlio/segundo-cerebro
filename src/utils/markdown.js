const TAG_LINE_RE = /\*\*Tags:\*\*(.+)/i
const TAG_RE = /#([\wÀ-ſ-]+)/g
const LINK_RE = /\[\[([^\]]+)\]\]/g
const HEADING1_RE = /^#\s+(.+)/m
const HEADING2_RE = /^##\s+(.+)/m

const STRIP_RE = [
  /^#{1,6}\s+/gm,       // headers
  /\*\*(.*?)\*\*/g,     // bold
  /\*(.*?)\*/g,         // italic
  /`{1,3}[^`]*`{1,3}/g, // inline code / fenced (single-line)
  /\[([^\]]+)\]\([^)]+\)/g, // [text](url)
  /\[\[([^\]]+)\]\]/g,  // [[wikilink]]
  /^[-*+]\s+/gm,        // list bullets
  /^\d+\.\s+/gm,        // ordered list
  /^>\s+/gm,            // blockquote
  /^---+$/gm,           // horizontal rule
]

const PREVIEW_LENGTH = 200

/**
 * Detects note type from tag list.
 * @param {string[]} tags
 * @returns {'project' | 'area' | 'note'}
 */
function detectType(tags) {
  const lower = tags.map((t) => t.toLowerCase())
  if (lower.some((t) => ['projeto', 'projetos', 'project', 'projects'].includes(t))) return 'project'
  if (lower.some((t) => ['área', 'áreas', 'area', 'areas'].includes(t))) return 'area'
  return 'note'
}

/**
 * Derives a stable ID from the file name (no extension, lowercased, spaces → hyphens).
 * @param {string} fileName
 * @returns {string}
 */
function idFromFileName(fileName) {
  return fileName
    .replace(/\.md$/i, '')
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9À-ſ-]/g, '')
}

/**
 * Parses a Markdown file and returns a structured note object.
 *
 * @param {string} content - Raw file content
 * @param {string} fileName - Original file name (e.g. "My Note.md")
 * @returns {{
 *   id: string,
 *   title: string,
 *   content: string,
 *   tags: string[],
 *   links: string[],
 *   category: string,
 *   fileName: string,
 *   type: 'project' | 'area' | 'note',
 *   createdAt: number,
 *   updatedAt: number
 * }}
 */
export function parseMD(content, fileName) {
  const now = Date.now()

  const titleMatch = content.match(HEADING1_RE)
  const title = titleMatch
    ? titleMatch[1].trim()
    : fileName.replace(/\.md$/i, '')

  const tagLineMatch = content.match(TAG_LINE_RE)
  const tags = tagLineMatch
    ? [...tagLineMatch[1].matchAll(TAG_RE)].map((m) => m[1])
    : []

  const links = [...content.matchAll(LINK_RE)].map((m) => m[1].trim())

  const categoryMatch = content.match(HEADING2_RE)
  const category = categoryMatch ? categoryMatch[1].trim() : 'Geral'

  return {
    id: idFromFileName(fileName),
    title,
    content,
    tags,
    links,
    category,
    fileName,
    type: detectType(tags),
    createdAt: now,
    updatedAt: now
  }
}

/**
 * Strips Markdown syntax and returns a plain-text preview (max 200 chars).
 *
 * @param {string} content
 * @returns {string}
 */
export function markdownToPreview(content) {
  if (!content) return ''

  let text = content
  for (const re of STRIP_RE) {
    text = text.replace(re, '$1')
  }

  text = text
    .replace(/\n{2,}/g, ' ')
    .replace(/\n/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim()

  if (text.length <= PREVIEW_LENGTH) return text
  return text.slice(0, PREVIEW_LENGTH).trimEnd() + '…'
}
