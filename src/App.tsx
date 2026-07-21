import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import './App.css'
import { GraphCanvas } from './features/graph/GraphCanvas'
import { NodeEditor } from './features/nodes/NodeEditor'
import { RelationshipEditor } from './features/relationships/RelationshipEditor'
import {
  createEmptyProject,
  downloadProject,
  loadProject,
  readProjectFile,
  saveProject,
  type ProjectData,
} from './services/projectStorage'
import type {
  GraphEdge,
  GraphNode,
  NodeType,
} from './types/graph'

function makeNode(
  id: string,
  label: string,
  type: NodeType,
  gender: GraphNode['gender'] = 'unspecified',
): GraphNode {
  return {
    id,
    label,
    type,
    gender,
    description: '',
    photoUrl: '',
    address: '',
    city: '',
    tags: [],
    notes: '',
    customFields: [],
  }
}

function makeEdge(
  id: string,
  source: string,
  target: string,
  label: string,
): GraphEdge {
  return {
    id,
    source,
    target,
    label,
    startDate: '',
    endDate: '',
    strength: 50,
    confidence: 75,
    notes: '',
  }
}

function createStarterProject(): ProjectData {
  const nodes: GraphNode[] = [
    {
      ...makeNode(
        'person-drew',
        'Drew',
        'person',
        'male',
      ),
      description: 'Example person node',
      city: 'Cornelius',
      tags: ['leadership', 'community'],
    },
    {
      ...makeNode(
        'person-taylor',
        'Taylor',
        'person',
        'female',
      ),
      tags: ['technology', 'community'],
    },
    makeNode(
      'company-cfa',
      'Chick-fil-A',
      'company',
    ),
    makeNode(
      'church-life',
      'LIFE Fellowship',
      'church',
    ),
    makeNode(
      'school-example',
      'Example University',
      'school',
    ),
  ]

  const edges: GraphEdge[] = [
    makeEdge(
      'edge-1',
      'person-drew',
      'person-taylor',
      'parent of',
    ),
    makeEdge(
      'edge-2',
      'person-drew',
      'company-cfa',
      'works at',
    ),
    makeEdge(
      'edge-3',
      'person-drew',
      'church-life',
      'serves at',
    ),
    makeEdge(
      'edge-4',
      'person-taylor',
      'school-example',
      'attends',
    ),
  ]

  return {
    version: 1,
    name: 'My Nexus Project',
    updatedAt: new Date().toISOString(),
    nodes,
    edges,
  }
}

const nodeTypes: Array<{
  type: NodeType
  label: string
}> = [
  { type: 'person', label: 'People' },
  { type: 'company', label: 'Companies' },
  { type: 'church', label: 'Churches' },
  { type: 'school', label: 'Schools' },
  { type: 'address', label: 'Addresses' },
  { type: 'event', label: 'Events' },
  { type: 'document', label: 'Documents' },
]

function App() {
  const fileInputRef =
    useRef<HTMLInputElement | null>(null)

  const [projectName, setProjectName] =
    useState('My Nexus Project')

  const [nodes, setNodes] =
    useState<GraphNode[]>([])

  const [edges, setEdges] =
    useState<GraphEdge[]>([])

  const [selectedNodeId, setSelectedNodeId] =
    useState<string | null>(null)

  const [selectedEdgeId, setSelectedEdgeId] =
    useState<string | null>(null)

  const [connectSourceId, setConnectSourceId] =
    useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [isLoaded, setIsLoaded] = useState(false)

  const [saveStatus, setSaveStatus] = useState<
    'saved' | 'saving' | 'error'
  >('saved')

  useEffect(() => {
    const savedProject = loadProject()
    const project = savedProject ?? createStarterProject()

    setProjectName(project.name)
    setNodes(project.nodes)
    setEdges(project.edges)
    setIsLoaded(true)
  }, [])

  useEffect(() => {
    if (!isLoaded) {
      return
    }

    setSaveStatus('saving')

    const timer = window.setTimeout(() => {
      try {
        saveProject({
          version: 1,
          name: projectName,
          updatedAt: new Date().toISOString(),
          nodes,
          edges,
        })

        setSaveStatus('saved')
      } catch (error) {
        console.error('Autosave failed:', error)
        setSaveStatus('error')
      }
    }, 500)

    return () => window.clearTimeout(timer)
  }, [projectName, nodes, edges, isLoaded])

  const selectedNode = useMemo(
    () =>
      nodes.find(
        (node) => node.id === selectedNodeId,
      ) ?? null,
    [nodes, selectedNodeId],
  )

  const selectedEdge = useMemo(
    () =>
      edges.find(
        (edge) => edge.id === selectedEdgeId,
      ) ?? null,
    [edges, selectedEdgeId],
  )

  const filteredNodes = useMemo(() => {
    const term = search.trim().toLowerCase()

    if (!term) {
      return []
    }

    return nodes.filter((node) =>
      JSON.stringify(node)
        .toLowerCase()
        .includes(term),
    )
  }, [nodes, search])

  function currentProject(): ProjectData {
    return {
      version: 1,
      name: projectName,
      updatedAt: new Date().toISOString(),
      nodes,
      edges,
    }
  }

  function createNode() {
    const node = makeNode(
      crypto.randomUUID(),
      'New person',
      'person',
    )

    setNodes((current) => [...current, node])
    setSelectedNodeId(node.id)
    setSelectedEdgeId(null)
  }

  function updateNode(updatedNode: GraphNode) {
    setNodes((current) =>
      current.map((node) =>
        node.id === updatedNode.id
          ? updatedNode
          : node,
      ),
    )
  }

  function updateEdge(updatedEdge: GraphEdge) {
    setEdges((current) =>
      current.map((edge) =>
        edge.id === updatedEdge.id
          ? updatedEdge
          : edge,
      ),
    )
  }

  function deleteSelectedNode() {
    if (!selectedNode) {
      return
    }

    if (
      !window.confirm(
        `Delete "${selectedNode.label}" and all connected relationships?`,
      )
    ) {
      return
    }

    setNodes((current) =>
      current.filter(
        (node) => node.id !== selectedNode.id,
      ),
    )

    setEdges((current) =>
      current.filter(
        (edge) =>
          edge.source !== selectedNode.id &&
          edge.target !== selectedNode.id,
      ),
    )

    setSelectedNodeId(null)
  }

  function deleteSelectedEdge() {
    if (!selectedEdge) {
      return
    }

    if (
      !window.confirm(
        `Delete relationship "${selectedEdge.label}"?`,
      )
    ) {
      return
    }

    setEdges((current) =>
      current.filter(
        (edge) => edge.id !== selectedEdge.id,
      ),
    )

    setSelectedEdgeId(null)
  }

  function startConnecting() {
    if (!selectedNodeId) {
      window.alert('Select a starting node first.')
      return
    }

    setConnectSourceId(selectedNodeId)
    setSelectedEdgeId(null)
  }

  function handleConnectTarget(
    targetNodeId: string,
  ) {
    if (!connectSourceId) {
      return
    }

    if (targetNodeId === connectSourceId) {
      window.alert('Choose a different target node.')
      return
    }

    const edge = makeEdge(
      crypto.randomUUID(),
      connectSourceId,
      targetNodeId,
      'connected to',
    )

    setEdges((current) => [...current, edge])
    setConnectSourceId(null)
    setSelectedNodeId(null)
    setSelectedEdgeId(edge.id)
  }

  function createNewProject() {
    if (
      !window.confirm(
        'Create a new project? Export a backup first if you want to keep the current project.',
      )
    ) {
      return
    }

    const project = createEmptyProject()

    setProjectName(project.name)
    setNodes([])
    setEdges([])
    setSelectedNodeId(null)
    setSelectedEdgeId(null)
    setConnectSourceId(null)
    setSearch('')
  }

  async function importProject(file: File) {
    try {
      const project = await readProjectFile(file)

      setProjectName(project.name)
      setNodes(project.nodes)
      setEdges(project.edges)
      setSelectedNodeId(null)
      setSelectedEdgeId(null)
      setConnectSourceId(null)
      setSearch('')
      setSaveStatus('saved')
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Could not import this project.'

      window.alert(message)
    }
  }

  if (!isLoaded) {
    return (
      <div className="loading-screen">
        Loading Nexus project…
      </div>
    )
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">N</div>

          <div>
            <h1>Nexus</h1>
            <p>
              Relationship Intelligence Platform
            </p>
          </div>
        </div>

        <input
          className="project-name-input"
          value={projectName}
          onChange={(event) =>
            setProjectName(event.target.value)
          }
          aria-label="Project name"
        />

        <label className="global-search">
          <span>⌕</span>

          <input
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search people, places, organizations…"
          />

          <kbd>⌘ K</kbd>
        </label>
      </header>

      <div className="workspace">
        <aside className="sidebar">
          <div className="sidebar-heading">
            <span>Explorer</span>

            <button
              onClick={createNode}
              aria-label="Add node"
            >
              ＋
            </button>
          </div>

          <nav className="node-list">
            <button className="node-list-item active">
              <span className="node-icon">◎</span>
              <span>All nodes</span>
              <span className="node-count">
                {nodes.length}
              </span>
            </button>

            {nodeTypes.map((item) => (
              <button
                className="node-list-item"
                key={item.type}
              >
                <span className="node-icon">●</span>
                <span>{item.label}</span>
                <span className="node-count">
                  {
                    nodes.filter(
                      (node) =>
                        node.type === item.type,
                    ).length
                  }
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
                  onClick={() => {
                    setSelectedNodeId(node.id)
                    setSelectedEdgeId(null)
                  }}
                >
                  {node.label}
                </button>
              ))}
            </div>
          )}

          <div className="project-actions">
            <button onClick={createNewProject}>
              New project
            </button>

            <button
              onClick={() =>
                downloadProject(currentProject())
              }
            >
              Export backup
            </button>

            <button
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
                const file = event.target.files?.[0]

                if (file) {
                  void importProject(file)
                }

                event.target.value = ''
              }}
            />
          </div>
        </aside>

        <main className="canvas-area">
          <div className="canvas-toolbar">
            <button
              className="primary-button"
              onClick={createNode}
            >
              ＋ New node
            </button>

            {connectSourceId ? (
              <>
                <span className="connect-message">
                  Click another node to create the
                  relationship.
                </span>

                <button
                  onClick={() =>
                    setConnectSourceId(null)
                  }
                >
                  Cancel connection
                </button>
              </>
            ) : (
              <button onClick={startConnecting}>
                Connect selected node
              </button>
            )}
          </div>

          <section className="canvas">
            <GraphCanvas
              nodes={nodes}
              edges={edges}
              selectedNodeId={selectedNodeId}
              selectedEdgeId={selectedEdgeId}
              connectSourceId={connectSourceId}
              onSelectNode={setSelectedNodeId}
              onSelectEdge={setSelectedEdgeId}
              onConnectTarget={handleConnectTarget}
            />
          </section>

          <footer className="statusbar">
            <span>
              <i
                className={`status-dot ${
                  saveStatus === 'error'
                    ? 'error'
                    : 'online'
                }`}
              />

              {saveStatus === 'saving'
                ? 'Saving…'
                : saveStatus === 'error'
                  ? 'Save failed'
                  : 'Saved'}
            </span>

            <span>{nodes.length} nodes</span>

            <span>
              {edges.length} relationships
            </span>

            <span className="statusbar-spacer" />

            <span>
              {new Date().toLocaleTimeString([], {
                hour: 'numeric',
                minute: '2-digit',
              })}
            </span>
          </footer>
        </main>

        <aside className="inspector">
          <div className="inspector-header">
            <div>
              <h2>Inspector</h2>

              <p>
                {selectedNode
                  ? selectedNode.type
                  : selectedEdge
                    ? 'relationship'
                    : 'No selection'}
              </p>
            </div>
          </div>

          {selectedNode ? (
            <NodeEditor
              node={selectedNode}
              onChange={updateNode}
              onDelete={deleteSelectedNode}
            />
          ) : selectedEdge ? (
            <RelationshipEditor
              edge={selectedEdge}
              sourceNode={
                nodes.find(
                  (node) =>
                    node.id === selectedEdge.source,
                ) ?? null
              }
              targetNode={
                nodes.find(
                  (node) =>
                    node.id === selectedEdge.target,
                ) ?? null
              }
              onChange={updateEdge}
              onDelete={deleteSelectedEdge}
            />
          ) : (
            <div className="inspector-empty">
              <div className="inspector-empty-icon">
                ◎
              </div>

              <h3>
                Select a node or relationship
              </h3>

              <p>
                Click a node to edit its
                information, or click a line to
                edit the relationship.
              </p>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}

export default App
