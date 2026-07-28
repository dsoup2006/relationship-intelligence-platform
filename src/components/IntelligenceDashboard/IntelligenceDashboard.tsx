import type {
  GraphEdge,
  GraphNode,
} from '../../types/graph'

import './IntelligenceDashboard.css'

interface IntelligenceDashboardProps {
  nodes: GraphNode[]
  edges: GraphEdge[]
  favoriteNodeIds: string[]
}

function countByType(
  nodes: GraphNode[],
  type: GraphNode['type'],
): number {
  return nodes.filter(
    (node) => node.type === type,
  ).length
}

function getMostConnectedNode(
  nodes: GraphNode[],
  edges: GraphEdge[],
): GraphNode | null {
  if (nodes.length === 0) {
    return null
  }

  const connectionCounts = new Map<
    string,
    number
  >()

  nodes.forEach((node) => {
    connectionCounts.set(node.id, 0)
  })

  edges.forEach((edge) => {
    connectionCounts.set(
      edge.source,
      (connectionCounts.get(edge.source) ?? 0) + 1,
    )

    connectionCounts.set(
      edge.target,
      (connectionCounts.get(edge.target) ?? 0) + 1,
    )
  })

  return (
    [...nodes].sort(
      (left, right) =>
        (connectionCounts.get(right.id) ?? 0) -
        (connectionCounts.get(left.id) ?? 0),
    )[0] ?? null
  )
}

export function IntelligenceDashboard({
  nodes,
  edges,
  favoriteNodeIds,
}: IntelligenceDashboardProps) {
  const peopleCount = countByType(
    nodes,
    'person',
  )

  const organizationCount = nodes.filter(
    (node) =>
      node.type === 'company' ||
      node.type === 'church' ||
      node.type === 'school',
  ).length

  const missingPhoneCount = nodes.filter(
    (node) =>
      node.type === 'person' &&
      !nodes.some(
        (candidate) =>
          candidate.type === 'phone' &&
          edges.some(
            (edge) =>
              (edge.source === node.id &&
                edge.target === candidate.id) ||
              (edge.target === node.id &&
                edge.source === candidate.id),
          ),
      ),
  ).length

  const mostConnected = getMostConnectedNode(
    nodes,
    edges,
  )

  return (
    <section className="intelligence-dashboard">
      <header className="intelligence-dashboard-header">
        <div>
          <p>Nexus Intelligence</p>
          <h2>Relationship Overview</h2>
        </div>

        <span>
          {nodes.length} total entities
        </span>
      </header>

      <div className="intelligence-metrics">
        <article className="intelligence-card">
          <span>People</span>
          <strong>{peopleCount}</strong>
          <small>Known individuals</small>
        </article>

        <article className="intelligence-card">
          <span>Organizations</span>
          <strong>{organizationCount}</strong>
          <small>
            Companies, churches, and schools
          </small>
        </article>

        <article className="intelligence-card">
          <span>Relationships</span>
          <strong>{edges.length}</strong>
          <small>Confirmed connections</small>
        </article>

        <article className="intelligence-card">
          <span>Favorites</span>
          <strong>
            {favoriteNodeIds.length}
          </strong>
          <small>Pinned entities</small>
        </article>

        <article className="intelligence-card">
          <span>Missing Phone</span>
          <strong>
            {missingPhoneCount}
          </strong>
          <small>
            People without a linked phone
          </small>
        </article>

        <article className="intelligence-card featured">
          <span>Most Connected</span>
          <strong>
            {mostConnected?.label ?? 'None'}
          </strong>
          <small>
            Highest relationship count
          </small>
        </article>
      </div>
    </section>
  )
}