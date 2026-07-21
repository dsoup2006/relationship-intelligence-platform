import type { GraphAnalytics } from './analytics'
import './IntelligencePanel.css'

interface IntelligencePanelProps {
  analytics: GraphAnalytics
  selectedNodeId: string | null
  onSelectNode: (nodeId: string) => void
  onClose: () => void
}

export function IntelligencePanel({
  analytics,
  selectedNodeId,
  onSelectNode,
  onClose,
}: IntelligencePanelProps) {
  const matches = selectedNodeId
    ? analytics.similarityMatches[selectedNodeId] ?? []
    : []

  return (
    <div className="intelligence-panel">
      <div className="intelligence-heading">
        <div>
          <h3>Network intelligence</h3>
          <p>Explainable graph analysis</p>
        </div>

        <button type="button" onClick={onClose}>
          ×
        </button>
      </div>

      <div className="intelligence-summary">
        <div>
          <strong>{analytics.totalNodes}</strong>
          <span>Nodes</span>
        </div>

        <div>
          <strong>{analytics.totalRelationships}</strong>
          <span>Relationships</span>
        </div>

        <div>
          <strong>{analytics.networkGroups}</strong>
          <span>Network groups</span>
        </div>

        <div>
          <strong>{analytics.isolatedNodes.length}</strong>
          <span>Isolated</span>
        </div>
      </div>

      <section className="intelligence-section">
        <h4>Most connected</h4>

        {analytics.mostConnected.slice(0, 8).map((item, index) => (
          <button
            type="button"
            className="intelligence-result"
            key={item.nodeId}
            onClick={() => onSelectNode(item.nodeId)}
          >
            <span className="result-rank">{index + 1}</span>

            <span className="result-content">
              <strong>{item.label}</strong>
              <small>
                {item.connectionCount} direct relationships
              </small>
            </span>

            <span className="result-score">
              {item.centralityScore}%
            </span>
          </button>
        ))}
      </section>

      <section className="intelligence-section">
        <h4>
          {selectedNodeId
            ? 'Similar to selected node'
            : 'Similarity matches'}
        </h4>

        {!selectedNodeId && (
          <p className="intelligence-empty">
            Select a node to see shared characteristics.
          </p>
        )}

        {selectedNodeId && matches.length === 0 && (
          <p className="intelligence-empty">
            No shared characteristics found.
          </p>
        )}

        {matches.slice(0, 8).map((match) => (
          <button
            type="button"
            className="intelligence-result"
            key={match.nodeId}
            onClick={() => onSelectNode(match.nodeId)}
          >
            <span className="result-content">
              <strong>{match.label}</strong>

              <small>
                {match.sharedReasons.join(' • ')}
              </small>

              {match.alreadyConnected && (
                <em>Already connected</em>
              )}
            </span>

            <span className="result-score">
              {match.score}%
            </span>
          </button>
        ))}
      </section>

      <section className="intelligence-section">
        <h4>Possible duplicates</h4>

        {analytics.duplicateCandidates.length === 0 ? (
          <p className="intelligence-empty">
            No obvious duplicates detected.
          </p>
        ) : (
          analytics.duplicateCandidates.map((candidate) => (
            <div
              className="duplicate-result"
              key={`${candidate.firstNodeId}-${candidate.secondNodeId}`}
            >
              <strong>
                {candidate.firstLabel} / {candidate.secondLabel}
              </strong>

              <small>{candidate.reasons.join(' • ')}</small>

              <div>
                <button
                  type="button"
                  onClick={() =>
                    onSelectNode(candidate.firstNodeId)
                  }
                >
                  View first
                </button>

                <button
                  type="button"
                  onClick={() =>
                    onSelectNode(candidate.secondNodeId)
                  }
                >
                  View second
                </button>
              </div>
            </div>
          ))
        )}
      </section>

      <section className="intelligence-section">
        <h4>Isolated nodes</h4>

        {analytics.isolatedNodes.length === 0 ? (
          <p className="intelligence-empty">
            Every node has at least one relationship.
          </p>
        ) : (
          analytics.isolatedNodes.map((node) => (
            <button
              type="button"
              className="isolated-node"
              key={node.id}
              onClick={() => onSelectNode(node.id)}
            >
              {node.label}
            </button>
          ))
        )}
      </section>

      <p className="intelligence-disclaimer">
        Scores indicate shared entered data. They do not prove that a
        relationship exists.
      </p>
    </div>
  )
}
