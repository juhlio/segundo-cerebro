import { useEffect, useRef, useState, useMemo } from 'react'
import * as d3 from 'd3'
import './Graph.css'

const NODE_COLORS = {
  project: '#3b82f6',
  area: '#10b981',
  note: '#e5e3db'
}

const NODE_RADIUS = 10

function buildGraph(notes) {
  const idSet = new Set(notes.map((n) => n.id))
  const nodes = notes.map((n) => ({ id: n.id, title: n.title, type: n.type || 'note' }))
  const links = []

  for (const note of notes) {
    for (const targetId of note.links ?? []) {
      if (idSet.has(targetId) && targetId !== note.id) {
        links.push({ source: note.id, target: targetId })
      }
    }
  }

  return { nodes, links }
}

export default function Graph({ notes = [], onSelectNote }) {
  const svgRef = useRef(null)
  const wrapperRef = useRef(null)
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, title: '' })
  const [isLoading, setIsLoading] = useState(false)

  const noteById = useMemo(
    () => Object.fromEntries(notes.map((n) => [n.id, n])),
    [notes]
  )

  const { nodes, links } = useMemo(() => buildGraph(notes), [notes])

  useEffect(() => {
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    if (notes.length === 0) return

    setIsLoading(true)

    const width = svgRef.current.clientWidth
    const height = svgRef.current.clientHeight || 600

    svg.attr('viewBox', `0 0 ${width} ${height}`)

    // Deep-clone so D3 can mutate without affecting the memoized originals
    const simNodes = nodes.map((n) => ({ ...n }))
    const simLinks = links.map((l) => ({ ...l }))

    const simulation = d3
      .forceSimulation(simNodes)
      .force('link', d3.forceLink(simLinks).id((d) => d.id).distance(120))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide(NODE_RADIUS + 4))

    const link = svg
      .append('g')
      .attr('class', 'graph-links')
      .selectAll('line')
      .data(simLinks)
      .join('line')
      .attr('class', 'graph-link')

    const node = svg
      .append('g')
      .attr('class', 'graph-nodes')
      .selectAll('circle')
      .data(simNodes)
      .join('circle')
      .attr('class', 'graph-node')
      .attr('r', NODE_RADIUS)
      .attr('fill', (d) => NODE_COLORS[d.type] ?? NODE_COLORS.note)
      .on('mouseenter', (event, d) => {
        const rect = svgRef.current.getBoundingClientRect()
        setTooltip({
          visible: true,
          x: event.clientX - rect.left + 12,
          y: event.clientY - rect.top - 8,
          title: d.title
        })
      })
      .on('mousemove', (event) => {
        const rect = svgRef.current.getBoundingClientRect()
        setTooltip((prev) => ({
          ...prev,
          x: event.clientX - rect.left + 12,
          y: event.clientY - rect.top - 8
        }))
      })
      .on('mouseleave', () => setTooltip((prev) => ({ ...prev, visible: false })))
      .on('click', (_, d) => onSelectNote?.(noteById[d.id]))
      .call(
        d3.drag()
          .on('start', (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart()
            d.fx = d.x
            d.fy = d.y
          })
          .on('drag', (event, d) => {
            d.fx = event.x
            d.fy = event.y
          })
          .on('end', (event, d) => {
            if (!event.active) simulation.alphaTarget(0)
            d.fx = null
            d.fy = null
          })
      )

    simulation
      .on('tick', () => {
        link
          .attr('x1', (d) => d.source.x)
          .attr('y1', (d) => d.source.y)
          .attr('x2', (d) => d.target.x)
          .attr('y2', (d) => d.target.y)
        node.attr('cx', (d) => d.x).attr('cy', (d) => d.y)
      })
      .on('end', () => setIsLoading(false))

    const ro = new ResizeObserver(() => {
      const el = svgRef.current
      if (!el) return
      const newWidth = el.clientWidth
      const newHeight = el.clientHeight || height
      svg.attr('viewBox', `0 0 ${newWidth} ${newHeight}`)
      simulation.force('center', d3.forceCenter(newWidth / 2, newHeight / 2))
      simulation.alpha(0.3).restart()
    })
    ro.observe(svgRef.current)

    return () => {
      simulation.stop()
      ro.disconnect()
      setIsLoading(false)
    }
  }, [nodes, links, noteById, onSelectNote])

  if (notes.length === 0) {
    return (
      <div className="graph-empty" role="status" aria-live="polite">
        <p>Envie arquivos MD para visualizar o grafo</p>
      </div>
    )
  }

  return (
    <div className="graph-wrapper" ref={wrapperRef}>
      {isLoading && (
        <div className="graph-loading" aria-label="Calculando grafo…" aria-live="polite">
          <span className="graph-loading__spinner" aria-hidden="true" />
          <span>Calculando…</span>
        </div>
      )}
      <svg ref={svgRef} className="graph-svg" aria-label="Grafo de conexões entre notas" role="img" />
      {tooltip.visible && (
        <div
          className="graph-tooltip"
          style={{ left: tooltip.x, top: tooltip.y }}
          aria-hidden="true"
        >
          {tooltip.title}
        </div>
      )}
    </div>
  )
}
