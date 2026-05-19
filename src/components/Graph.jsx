import { useEffect, useRef, useState } from 'react'
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
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, title: '' })

  useEffect(() => {
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    if (notes.length === 0) return

    const { nodes, links } = buildGraph(notes)
    const width = svgRef.current.clientWidth
    const height = svgRef.current.clientHeight || 600

    svg.attr('viewBox', `0 0 ${width} ${height}`)

    const noteById = Object.fromEntries(notes.map((n) => [n.id, n]))

    const simulation = d3
      .forceSimulation(nodes)
      .force('link', d3.forceLink(links).id((d) => d.id).distance(120))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide(NODE_RADIUS + 4))

    const link = svg
      .append('g')
      .attr('class', 'graph-links')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('class', 'graph-link')

    const node = svg
      .append('g')
      .attr('class', 'graph-nodes')
      .selectAll('circle')
      .data(nodes)
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
        d3
          .drag()
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

    simulation.on('tick', () => {
      link
        .attr('x1', (d) => d.source.x)
        .attr('y1', (d) => d.source.y)
        .attr('x2', (d) => d.target.x)
        .attr('y2', (d) => d.target.y)

      node.attr('cx', (d) => d.x).attr('cy', (d) => d.y)
    })

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
    }
  }, [notes, onSelectNote])

  if (notes.length === 0) {
    return (
      <div className="graph-empty">
        <p>Envie arquivos MD para visualizar o grafo</p>
      </div>
    )
  }

  return (
    <div className="graph-wrapper">
      <svg ref={svgRef} className="graph-svg" />
      {tooltip.visible && (
        <div
          className="graph-tooltip"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          {tooltip.title}
        </div>
      )}
    </div>
  )
}
