import type { RefObject } from 'react'

import type { EntityTypeDefinition } from '../../config/entityTypes'
import type { GraphNode } from '../../types/graph'
import { Explorer } from '../Explorer/Explorer'

import './ExplorerPanel.css'

interface ExplorerPanelProps {
  nodes: GraphNode[]
  entityTypes: EntityTypeDefinition[]
  selectedNodeId: string | null
  favoriteNodeIds: string[]
  search: string
  filteredNodes: GraphNode[]
  fileInputRef: RefObject<HTMLInputElement | null>

  onCreateNode: () => void
  onSelectNode: (nodeId: string) => void
  onClearSelection: () => void
  onToggleFavorite: (nodeId: string) => void
  onCreateProject: () => void
  onExportProject: () => void
  onImportProject: (file: File) => void
}

export function ExplorerPanel({
  nodes,
  entityTypes,
  selectedNodeId,
  favoriteNodeIds,
  search,
  filteredNodes,
  fileInputRef,
  onCreateNode,
  onSelectNode,
  onClearSelection,
  onToggleFavorite,
  onCreateProject,
  onExportProject,
  onImportProject,
}: ExplorerPanelProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar-heading">
        <span>Explorer</span>

        <button
          type="button"
          onClick={onCreateNode}
          aria-label="Add entity"
        >
          ＋
        </button>
      </div>

      <Explorer
        nodes={nodes}
        entityTypes={entityTypes}
        selectedNodeId={selectedNodeId}
        favoriteNodeIds={favoriteNodeIds}
        onToggleFavorite={onToggleFavorite}
        onSelectNode={onSelectNode}
        onClearSelection={onClearSelection}
      />

      {search && (
        <div className="search-results">
          <div className="sidebar-heading">
            <span>Search results</span>
          </div>

          {filteredNodes.length === 0 ? (
            <p className="explorer-panel-empty">
              No matching entities.
            </p>
          ) : (
            filteredNodes.map((node) => (
              <button
                type="button"
                key={node.id}
                className={
                  selectedNodeId === node.id
                    ? 'saved-view active'
                    : 'saved-view'
                }
                onClick={() =>
                  onSelectNode(node.id)
                }
              >
                {node.label}
              </button>
            ))
          )}
        </div>
      )}

      <div className="project-actions">
        <button
          type="button"
          onClick={onCreateProject}
        >
          New project
        </button>

        <button
          type="button"
          onClick={onExportProject}
        >
          Export backup
        </button>

        <button
          type="button"
          onClick={() =>
            fileInputRef.current?.click()
          }
        >
          Import project
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={(event) => {
            const file =
              event.target.files?.[0]

            if (file) {
              onImportProject(file)
            }

            event.target.value = ''
          }}
        />
      </div>
    </aside>
  )
}