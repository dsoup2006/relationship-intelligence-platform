import { useMemo, useState } from 'react'
import './App.css'
import { GraphCanvas } from './features/graph/GraphCanvas'
import type { GraphEdge, GraphNode, NodeType } from './types/graph'

const initialNodes: GraphNode[] = [
  {
    id: 'person-drew',
    label: 'Drew',
    type: 'person',
    gender: 'male',
    description: 'Selected example person',
  },
  {
    id: 'person-taylor',
    label: 'Taylor',
    type: 'person',
    gender: 'female',
  },
  {
    id: 'company-cfa',
    label: 'Chick-fil-A',
    type: 'company',
  },
  {
    id: 'church-life',
    label: 'LIFE Fellowship',
    type: 'church',
  },
  {
    id: 'school-example',
    label: 'Example University',
    type: 'school',
  },
]

const initialEdges: GraphEdge[] = [
  {
    id: 'edge-1',
    source: 'person-drew',
    target: 'person-taylor',
    label: 'parent of',
  },
  {
    id: 'edge-2',
    source: 'person-drew',
    target: 'company-cfa',
    label: 'works at',
  },
  {
    id: 'edge-3',
    source: 'person-drew',
    target: 'church-life',
    label: 'serves at',
  },
  {
    id: 'edge-4',
    source: 'person-taylor',
    target: 'school-example',
    label: 'attends',
  },
]

const nodeTypes: Array<{ type: NodeType; label: string }> = [
  { type: 'person', label: 'People' },
  { type: 'company', label: 'Companies' },
  { type: 'church', label: 'Churches' },
  { type: 'school', label: 'Schools' },
  { type: 'address', label: 'Addresses' },
  { type: 'event', label: 'Events' },
  { type: 'document', label: 'Documents' },
]

function App() {
  const [nodes, setNodes] = useState<GraphNode[]>(initialNodes)
  const [edges, setEdges] = useState<GraphEdge[]>(initialEdges)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const selectedNode = useMemo(
    () => nodes.find((node) => node.id === selectedNodeId) ?? null,
    [nodes, selectedNodeId],
  )

  const filteredNodes = useMemo(() => {
    const term = search.trim().toLowerCase()

    if (!term) {
      return nodes
    }

    return nodes.filter((node) =>
      `${node.label} ${node.type} ${node.description ?? ''}`
        .toLowerCase()
        .includes(term),
    )
  }, [nodes, search])

  function createNode() {
    const label = window.prompt('What should this node be called?')

    if (!label?.trim()) {
      return
    }

    const requestedType = window
      .prompt(
        'Node type: person, company, church, school, address, event, or document',
        'person',
      )
      ?.trim()
      .toLowerCase()

    const validTypes: NodeType[] = [
      'person',
      'company',
      'church',
      'school',
      'address',
      'event',
      'document',
    ]

    const type = validTypes.includes(requestedType as NodeType)
      ? (requestedType as NodeType)
      : 'person'

    const id = `${type}-${crypto.randomUUID()}`

    setNodes((currentNodes) => [
      ...currentNodes,
      {
        id,
        label: label.trim(),
        type,
        gender: 'unspecified',
      },
    ])

    setSelectedNodeId(id)
  }

  function deleteSelectedNode() {
    if (!selectedNode) {
      return
    }

    const confirmed = window.confirm(
      `Delete "${selectedNode.label}" and all connected relationships?`,
    )

    if (!confirmed) {
      return
    }

    setNodes((currentNodes) =>
      currentNodes.filter((node) => node.id !== selectedNode.id),
    )

    setEdges((currentEdges) =>
      currentEdges.filter(
        (edge) =>
          edge.source !== selectedNode.id &&
          edge.target !== selectedNode.id,
      ),
    )

    setSelectedNodeId(null)
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">N</div>
          <div>
            <h1>Nexus</h1>
            <p>Relationship Intelligence Platform</p>
          </div>
        </div>

        <label className="global-search">
          <span>⌕</span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search people, places, organizations…"
          />
          <kbd>⌘ K</kbd>
        </label>
      </header>

      <div className="workspace">
        <aside className="sidebar">
          <div className="sidebar-heading">
            <span>Explorer</span>
            <button onClick={createNode} aria-label="Add node">
              ＋
            </button>
          </div>

          <nav className="node-list">
            <button className="node-list-item active">
              <span className="node-icon">◎</span>
              <span>All nodes</span>
              <span className="node-count">{nodes.length}</span>
            </button>

            {nodeTypes.map((item) => (
              <button className="node-list-item" key={item.type}>
                <span className="node-icon">●</span>
                <span>{item.label}</span>
                <span className="node-count">
                  {nodes.filter((node) => node.type === item.type).length}
                </span>
              </button>
            ))}
          </nav>

          {search && (
            <div className="search-results">
              <div className="sidebar-heading">
                <span>Search results</span>
              </div>

              {filteredNodes.map((node) => (
                <button
                  key={node.id}
                  className="saved-view"
                  onClick={() => setSelectedNodeId(node.id)}
                >
                  {node.label}
                </button>
              ))}
            </div>
          )}
        </aside>

        <main className="canvas-area">
          <div className="canvas-toolbar">
            <button className="primary-button" onClick={createNode}>
              ＋ New node
            </button>

            <span className="toolbar-message">
              Drag nodes, scroll to zoom, and click a node to select it.
            </span>
          </div>

          <section className="canvas">
            <GraphCanvas
              nodes={nodes}
              edges={edges}
              selectedNodeId={selectedNodeId}
              onSelectNode={setSelectedNodeId}
            />
          </section>

          <footer className="statusbar">
            <span>
              <i className="status-dot online" /> Graph ready
            </span>
            <span>{nodes.length} nodes</span>
            <span>{edges.length} relationships</span>
            <span className="statusbar-spacer" />
            <span>Local project</span>
          </footer>
        </main>

        <aside className="inspector">
          <div className="inspector-header">
            <div>
              <h2>Inspector</h2>
              <p>{selectedNode ? selectedNode.type : 'No selection'}</p>
            </div>
          </div>

          {selectedNode ? (
            <div className="selected-node-panel">
              <div
                className={`selected-node-avatar ${selectedNode.gender ?? 'unspecified'}`}
              >
                {selectedNode.label.slice(0, 2).toUpperCase()}
              </div>

              <h3>{selectedNode.label}</h3>
              <p>{selectedNode.description ?? 'No description yet.'}</p>

              <dl>
                <div>
                  <dt>Type</dt>
                  <dd>{selectedNode.type}</dd>
                </div>
                <div>
                  <dt>Connected relationships</dt>
                  <dd>
                    {
                      edges.filter(
                        (edge) =>
                          edge.source === selectedNode.id ||
                          edge.target === selectedNode.id,
                      ).length
                    }
                  </dd>
                </div>
              </dl>

              <button
                className="delete-button"
                onClick={deleteSelectedNode}
              >
                Delete selected node
              </button>
            </div>
          ) : (
            <div className="inspector-empty">
              <div className="inspector-empty-icon">◎</div>
              <h3>Select a node</h3>
              <p>
                Click a node on the canvas to view and edit its information.
              </p>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}

export default App
