import { useMemo } from 'react'
import type { GraphEdge, GraphNode } from '../../types/graph'
import './WorkspaceViews.css'

interface TimelineViewProps {
  nodes: GraphNode[]
  edges: GraphEdge[]
  onSelectNode: (nodeId: string) => void
  onSelectEdge: (edgeId: string) => void
}

interface TimelineGroup {
  year: string
  edges: GraphEdge[]
}

export function TimelineView({
  nodes,
  edges,
  onSelectNode,
  onSelectEdge,
}: TimelineViewProps) {
  const groups = useMemo<TimelineGroup[]>(() => {
    const grouped = new Map<string, GraphEdge[]>()

    edges.forEach((edge) => {
      const year = edge.startDate
        ? edge.startDate.slice(0, 4)
        : 'Undated'

      grouped.set(year, [
        ...(grouped.get(year) ?? []),
        edge,
      ])
    })

    return [...grouped.entries()]
      .map(([year, groupedEdges]) => ({
        year,
        edges: groupedEdges,
      }))
      .sort((first, second) => {
        if (first.year === 'Undated') {
          return 1
        }

        if (second.year === 'Undated') {
          return -1
        }

        return Number(first.year) - Number(second.year)
      })
  }, [edges])

  function nodeName(nodeId: string): string {
    return (
      nodes.find((node) => node.id === nodeId)?.label ??
      'Unknown node'
    )
  }

  if (edges.length === 0) {
    return (
      <div className="view-empty">
        <div className="view-empty-icon">◷</div>
        <h2>No relationships to display</h2>
        <p>
          Create relationships and add start dates to build a
          chronological network history.
        </p>
      </div>
    )
  }

  return (
    <div className="timeline-view">
      <div className="view-heading">
        <div>
          <h2>Relationship timeline</h2>
          <p>
            Relationships are grouped by their starting year.
          </p>
        </div>

        <span>{edges.length} relationships</span>
      </div>

      <div className="timeline-track">
        {groups.map((group) => (
          <section
            className="timeline-group"
            key={group.year}
          >
            <div className="timeline-year">
              {group.year}
            </div>

            <div className="timeline-events">
              {group.edges.map((edge) => (
                <article
                  className="timeline-event"
                  key={edge.id}
                  onClick={() => onSelectEdge(edge.id)}
                >
                  <div className="timeline-event-dot" />

                  <div className="timeline-event-content">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation()
                        onSelectNode(edge.source)
                      }}
                    >
                      {nodeName(edge.source)}
                    </button>

                    <span>{edge.label}</span>

                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation()
                        onSelectNode(edge.target)
                      }}
                    >
                      {nodeName(edge.target)}
                    </button>

                    {(edge.startDate || edge.endDate) && (
                      <small>
                        {edge.startDate || 'Unknown start'}
                        {edge.endDate
                          ? ` — ${edge.endDate}`
                          : ''}
                      </small>
                    )}

                    {edge.notes && <p>{edge.notes}</p>}
                  </div>

                  <div className="timeline-strength">
                    {edge.strength}%
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
