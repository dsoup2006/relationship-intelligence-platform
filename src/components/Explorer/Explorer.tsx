import { useMemo, useState } from 'react'

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

function normalize(value: unknown): string {
  return String(value ?? '')
    .trim()
    .toLowerCase()
}

function nodeMatchesSearch(
  node: GraphNode,
  search: string,
): boolean {
  if (!search) {
    return true
  }

  const searchableValues = [
    node.label,
    node.type,
    node.description,
    node.address,
    node.city,
    ...node.tags,
  ]

  return searchableValues.some((value) =>
    normalize(value).includes(search),
  )
}

export function Explorer({
  nodes,
  entityTypes,
  selectedNodeId,
  onSelectNode,
  onClearSelection,
}: ExplorerProps) {
  const [searchText, setSearchText] =
    useState('')

  const [expandedTypes, setExpandedTypes] =
    useState<Set<NodeType>>(
      () => new Set<NodeType>(['person']),
    )

  const normalizedSearch =
    normalize(searchText)

  const filteredNodes = useMemo(
    () =>
      nodes.filter((node) =>
        nodeMatchesSearch(
          node,
          normalizedSearch,
        ),
      ),
    [nodes, normalizedSearch],
  )

  function toggleType(type: NodeType) {
    setExpandedTypes((current) => {
      const next = new Set(current)

      if (next.has(type)) {
        next.delete(type)
      } else {
        next.add(type)
      }

      return next
    })
  }

  return (
    <nav className="nexus-explorer">
      <div className="explorer-search">
        <span aria-hidden="true">⌕</span>

        <input
          type="search"
          value={searchText}
          onChange={(event) =>
            setSearchText(event.target.value)
          }
          placeholder="Search entities"
          aria-label="Search entities"
        />

        {searchText && (
          <button
            type="button"
            onClick={() => setSearchText('')}
            aria-label="Clear search"
          >
            ×
          </button>
        )}
      </div>

      <div className="nexus-explorer-heading">
        <span>Entities</span>
        <span>{filteredNodes.length}</span>
      </div>

      <button
        type="button"
        className="explorer-category"
        onClick={onClearSelection}
      >
        <span className="explorer-chevron" />

        <span className="explorer-icon">
          ◉
        </span>

        <span className="explorer-label">
          All entities
        </span>

        <span className="explorer-count">
          {filteredNodes.length}
        </span>
      </button>

      {entityTypes.map((entityType) => {
        const typeNodes =
          filteredNodes.filter(
            (node) =>
              node.type === entityType.type,
          )

        const isExpanded =
          expandedTypes.has(entityType.type)

        const shouldShow =
          !normalizedSearch ||
          typeNodes.length > 0

        if (!shouldShow) {
          return null
        }

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
                toggleType(entityType.type)
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

      {filteredNodes.length === 0 && (
        <div className="explorer-no-results">
          No entities match “{searchText}”.
        </div>
      )}
    </nav>
  )
}