import type { GraphNode } from '../../types/graph'
import type { SuggestedConnection } from './suggestedConnections'
import './RelationshipSuggestionsPanel.css'

interface RelationshipSuggestionsPanelProps {
  suggestions: SuggestedConnection[]
  nodes: GraphNode[]
  onAccept: (suggestion: SuggestedConnection) => void
  onIgnore: (suggestionId: string) => void
  onSelectNode: (nodeId: string) => void
  onClose: () => void
}

export function RelationshipSuggestionsPanel({
  suggestions,
  nodes,
  onAccept,
  onIgnore,
  onSelectNode,
  onClose,
}: RelationshipSuggestionsPanelProps) {
  function nodeName(nodeId: string): string {
    return (
      nodes.find((node) => node.id === nodeId)?.label ??
      'Unknown entity'
    )
  }

  return (
    <div className="suggestions-panel">
      <header className="suggestions-panel-header">
        <div>
          <h3>Relationship discovery</h3>
          <p>
            Suggested from shared information entered in Nexus.
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close relationship suggestions"
        >
          ×
        </button>
      </header>

      <div className="suggestions-panel-count">
        <strong>{suggestions.length}</strong>
        <span>
          {suggestions.length === 1
            ? 'suggestion found'
            : 'suggestions found'}
        </span>
      </div>

      {suggestions.length === 0 ? (
        <div className="suggestions-empty">
          <div>✓</div>
          <h4>No suggestions awaiting review</h4>
          <p>
            Add shared tags, cities, addresses, or matching custom
            fields to discover possible connections.
          </p>
        </div>
      ) : (
        <div className="suggestions-list">
          {suggestions.map((suggestion) => (
            <article
              className="suggestion-card"
              key={suggestion.id}
            >
              <div className="suggestion-entities">
                <button
                  type="button"
                  onClick={() =>
                    onSelectNode(suggestion.source)
                  }
                >
                  {nodeName(suggestion.source)}
                </button>

                <span>⇄</span>

                <button
                  type="button"
                  onClick={() =>
                    onSelectNode(suggestion.target)
                  }
                >
                  {nodeName(suggestion.target)}
                </button>
              </div>

              <div className="suggestion-score-row">
                <span>Similarity score</span>
                <strong>{suggestion.score}%</strong>
              </div>

              <div className="suggestion-score-track">
                <span
                  style={{
                    width: `${suggestion.score}%`,
                  }}
                />
              </div>

              <div className="suggestion-reasons">
                <h4>Why Nexus suggested this</h4>

                {suggestion.reasons.map((reason) => (
                  <div key={reason}>
                    <span>✓</span>
                    <p>{reason}</p>
                  </div>
                ))}
              </div>

              <footer className="suggestion-actions">
                <button
                  type="button"
                  className="ignore"
                  onClick={() =>
                    onIgnore(suggestion.id)
                  }
                >
                  Ignore
                </button>

                <button
                  type="button"
                  className="accept"
                  onClick={() =>
                    onAccept(suggestion)
                  }
                >
                  Accept relationship
                </button>
              </footer>
            </article>
          ))}
        </div>
      )}

      <p className="suggestions-disclaimer">
        Suggested links identify shared entered characteristics. They
        do not prove that two people or entities have a real
        relationship.
      </p>
    </div>
  )
}
