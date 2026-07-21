import type { GraphEdge, GraphNode } from '../../types/graph'
import './RelationshipEditor.css'

interface RelationshipEditorProps {
  edge: GraphEdge
  sourceNode: GraphNode | null
  targetNode: GraphNode | null
  onChange: (edge: GraphEdge) => void
  onDelete: () => void
}

export function RelationshipEditor({
  edge,
  sourceNode,
  targetNode,
  onChange,
  onDelete,
}: RelationshipEditorProps) {
  function update<K extends keyof GraphEdge>(
    key: K,
    value: GraphEdge[K],
  ) {
    onChange({
      ...edge,
      [key]: value,
    })
  }

  return (
    <div className="relationship-editor">
      <div className="relationship-summary">
        <strong>{sourceNode?.label ?? 'Unknown'}</strong>
        <span>→</span>
        <strong>{targetNode?.label ?? 'Unknown'}</strong>
      </div>

      <label>
        Relationship type
        <input
          value={edge.label}
          onChange={(event) =>
            update('label', event.target.value)
          }
          placeholder="friend, parent of, works at…"
        />
      </label>

      <div className="relationship-row">
        <label>
          Start date
          <input
            type="date"
            value={edge.startDate}
            onChange={(event) =>
              update('startDate', event.target.value)
            }
          />
        </label>

        <label>
          End date
          <input
            type="date"
            value={edge.endDate}
            onChange={(event) =>
              update('endDate', event.target.value)
            }
          />
        </label>
      </div>

      <label>
        Strength: {edge.strength}%
        <input
          type="range"
          min="0"
          max="100"
          value={edge.strength}
          onChange={(event) =>
            update('strength', Number(event.target.value))
          }
        />
      </label>

      <label>
        Confidence: {edge.confidence}%
        <input
          type="range"
          min="0"
          max="100"
          value={edge.confidence}
          onChange={(event) =>
            update('confidence', Number(event.target.value))
          }
        />
      </label>

      <label>
        Notes
        <textarea
          rows={5}
          value={edge.notes}
          onChange={(event) =>
            update('notes', event.target.value)
          }
        />
      </label>

      <button
        type="button"
        className="delete-button"
        onClick={onDelete}
      >
        Delete relationship
      </button>
    </div>
  )
}
