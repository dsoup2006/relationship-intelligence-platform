import type { GraphEdge, GraphNode } from '../../types/graph'
import type { GraphAnalytics } from '../intelligence/analytics'
import './WorkspaceViews.css'

interface DashboardViewProps {
  nodes: GraphNode[]
  edges: GraphEdge[]
  analytics: GraphAnalytics
  onSelectNode: (nodeId: string) => void
}

export function DashboardView({
  nodes,
  edges,
  analytics,
  onSelectNode,
}: DashboardViewProps) {
  const nodeTypes = nodes.reduce<Record<string, number>>(
    (counts, node) => ({
      ...counts,
      [node.type]: (counts[node.type] ?? 0) + 1,
    }),
    {},
  )

  const averageStrength =
    edges.length === 0
      ? 0
      : Math.round(
          edges.reduce(
            (total, edge) => total + edge.strength,
            0,
          ) / edges.length,
        )

  return (
    <div className="dashboard-view">
      <div className="view-heading">
        <div>
          <h2>Network dashboard</h2>
          <p>
            A high-level overview of the current project.
          </p>
        </div>
      </div>

      <div className="dashboard-metrics">
        <div className="dashboard-metric">
          <span>Total nodes</span>
          <strong>{analytics.totalNodes}</strong>
        </div>

        <div className="dashboard-metric">
          <span>Relationships</span>
          <strong>{analytics.totalRelationships}</strong>
        </div>

        <div className="dashboard-metric">
          <span>Network groups</span>
          <strong>{analytics.networkGroups}</strong>
        </div>

        <div className="dashboard-metric">
          <span>Average strength</span>
          <strong>{averageStrength}%</strong>
        </div>

        <div className="dashboard-metric">
          <span>Isolated nodes</span>
          <strong>{analytics.isolatedNodes.length}</strong>
        </div>

        <div className="dashboard-metric">
          <span>Possible duplicates</span>
          <strong>
            {analytics.duplicateCandidates.length}
          </strong>
        </div>
      </div>

      <div className="dashboard-columns">
        <section className="dashboard-panel">
          <h3>Most connected</h3>

          {analytics.mostConnected
            .slice(0, 10)
            .map((item, index) => (
              <button
                type="button"
                className="dashboard-ranking"
                key={item.nodeId}
                onClick={() => onSelectNode(item.nodeId)}
              >
                <span className="dashboard-rank">
                  {index + 1}
                </span>

                <span className="dashboard-ranking-name">
                  <strong>{item.label}</strong>
                  <small>
                    {item.connectionCount} relationships
                  </small>
                </span>

                <span className="dashboard-score">
                  {item.centralityScore}%
                </span>
              </button>
            ))}
        </section>

        <section className="dashboard-panel">
          <h3>Node types</h3>

          {Object.entries(nodeTypes)
            .sort(
              (first, second) => second[1] - first[1],
            )
            .map(([type, count]) => {
              const percentage =
                nodes.length === 0
                  ? 0
                  : Math.round((count / nodes.length) * 100)

              return (
                <div
                  className="node-type-row"
                  key={type}
                >
                  <div>
                    <span>{type}</span>
                    <strong>{count}</strong>
                  </div>

                  <div className="node-type-bar">
                    <span
                      style={{
                        width: `${percentage}%`,
                      }}
                    />
                  </div>
                </div>
              )
            })}
        </section>

        <section className="dashboard-panel">
          <h3>Needs attention</h3>

          {analytics.isolatedNodes.length === 0 &&
          analytics.duplicateCandidates.length === 0 ? (
            <p className="dashboard-empty">
              No isolated nodes or obvious duplicates.
            </p>
          ) : (
            <>
              {analytics.isolatedNodes.map((node) => (
                <button
                  type="button"
                  className="attention-item"
                  key={node.id}
                  onClick={() => onSelectNode(node.id)}
                >
                  <strong>{node.label}</strong>
                  <small>Isolated node</small>
                </button>
              ))}

              {analytics.duplicateCandidates.map(
                (candidate) => (
                  <button
                    type="button"
                    className="attention-item warning"
                    key={`${candidate.firstNodeId}-${candidate.secondNodeId}`}
                    onClick={() =>
                      onSelectNode(candidate.firstNodeId)
                    }
                  >
                    <strong>
                      {candidate.firstLabel} /{' '}
                      {candidate.secondLabel}
                    </strong>
                    <small>
                      {candidate.reasons.join(' • ')}
                    </small>
                  </button>
                ),
              )}
            </>
          )}
        </section>
      </div>
    </div>
  )
}
