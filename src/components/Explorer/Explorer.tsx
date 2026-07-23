import { useState } from 'react'

import type { EntityTypeDefinition } from '../../config/entityTypes'
import type {
  GraphNode,
  NodeType,
} from '../../types/graph'

import './Explorer.css'

interface ExplorerProps {
  nodes: GraphNode[]
  entityTypes: EntityTypeDefinition[]
  selectedNodeId: string | null
  onSelectNode: (nodeId: string) => void
  onClearSelection: () => void
}

export function Explorer({
  nodes,
  entityTypes,
  selectedNodeId,
  onSelectNode,
  onClearSelection,
}: ExplorerProps) {
  const [expandedType, setExpandedType] =
    useState<NodeType | null>('person')

  return (
    <nav className="nexus-explorer">
      <div className="nexus-explorer-heading">
        <span>Entities</span>
        <span>{nodes.length}</span>
      </div>

      <button
        type="button"
        className={
          expandedType === null
            ? 'explorer-category active'
            : 'explorer-category'
        }
        onClick={() => {
          setExpandedType(null)
          onClearSelection()
        }}
      >
        <span className="explorer-chevron" />

        <span className="explorer-icon">
          ◉
        </span>

        <span className="explorer-label">
          All entities
        </span>

        <span className="explorer-count">
          {nodes.length}
        </span>
      </button>

      {entityTypes.map((entityType) => {
        const typeNodes = nodes.filter(
          (node) =>
            node.type === entityType.type,
        )

        const isExpanded =
          expandedType === entityType.type

        return (
          <div
            className="explorer-group"
            key={entityType.type}
          >
            <button
              type="button"
              className={
                isExpanded
                  ? 'explorer-category active'
                  : 'explorer-category'
              }
              onClick={() =>
                setExpandedType((current) =>
                  current === entityType.type
                    ? null
                    : entityType.type,
                )
              }
            >
              <span
                className={
                  isExpanded
                    ? 'explorer-chevron expanded'
                    : 'explorer-chevron'
                }
              >
                ›
              </span>

              <span className="explorer-icon">
                {entityType.symbol}
              </span>

              <span className="explorer-label">
                {entityType.label}
              </span>

              <span className="explorer-count">
                {typeNodes.length}
              </span>
            </button>

            {isExpanded && (
              <div className="explorer-children">
                {typeNodes.length === 0 ? (
                  <div className="explorer-empty">
                    No{' '}
                    {entityType.label.toLowerCase()}{' '}
                    yet
                  </div>
                ) : (
                  typeNodes.map((node) => (
                    <button
                      type="button"
                      key={node.id}
                      className={
                        selectedNodeId === node.id
                          ? 'explorer-entity active'
                          : 'explorer-entity'
                      }
                      onClick={() =>
                        onSelectNode(node.id)
                      }
                      title={node.label}
                    >
                      <span>
                        {entityType.symbol}
                      </span>

                      <span>{node.label}</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        )
      })}
    </nav>
  )
}