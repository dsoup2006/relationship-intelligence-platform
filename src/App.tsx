import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import './App.css'
import { entityTypes } from './config/entityTypes'
import { GraphCanvas } from './features/graph/GraphCanvas'
import { NodeEditor } from './features/nodes/NodeEditor'
import { RelationshipEditor } from './features/relationships/RelationshipEditor'
import { IntelligencePanel } from './features/intelligence/IntelligencePanel'
import { TimelineView } from './features/views/TimelineView'
import { DashboardView } from './features/views/DashboardView'
import { analyzeGraph } from './features/intelligence/analytics'
import { buildSuggestedConnections } from './features/intelligence/suggestedConnections'
import { useHistoryState } from './hooks/useHistoryState'
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
      tags: [
        'leadership',
        'community',
      ],
    },
    {
      ...makeNode(
        'person-taylor',
        'Taylor',
        'person',
        'female',
      ),
      tags: [
        'technology',
        'community',
      ],
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
    updatedAt:
      new Date().toISOString(),
    nodes,
    edges,
  }
}

const nodeTypes = entityTypes

function App() {
  const fileInputRef =
    useRef<HTMLInputElement | null>(
      null,
    )

  const {
    value: project,
    commit,
    replace,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useHistoryState<ProjectData>(
    createStarterProject(),
  )

  const [selectedNodeId, setSelectedNodeId] =
    useState<string | null>(null)

  const [selectedEdgeId, setSelectedEdgeId] =
    useState<string | null>(null)

  const [connectSourceId, setConnectSourceId] =
    useState<string | null>(null)

  const [search, setSearch] =
    useState('')

  const [showIntelligence, setShowIntelligence] =
    useState(false)

  const [
    showSuggestedConnections,
    setShowSuggestedConnections,
  ] = useState(true)

  const [activeView, setActiveView] = useState<
    'graph' | 'timeline' | 'dashboard'
  >('graph')

  const [isLoaded, setIsLoaded] =
    useState(false)

  const [saveStatus, setSaveStatus] =
    useState<
      'saved' | 'saving' | 'error'
    >('saved')

  const nodes = project.nodes
  const edges = project.edges

  const analytics = useMemo(
    () => analyzeGraph(nodes, edges),
    [nodes, edges],
  )

  const suggestedConnections = useMemo(
    () => buildSuggestedConnections(nodes, edges),
    [nodes, edges],
  )

  useEffect(() => {
    const savedProject =
      loadProject()

    replace(
      savedProject ??
        createStarterProject(),
    )

    setIsLoaded(true)
  }, [replace])

  useEffect(() => {
    if (!isLoaded) {
      return
    }

    setSaveStatus('saving')

    const timer =
      window.setTimeout(() => {
        try {
          saveProject(project)
          setSaveStatus('saved')
        } catch (error) {
          console.error(
            'Autosave failed:',
            error,
          )

          setSaveStatus('error')
        }
      }, 500)

    return () =>
      window.clearTimeout(timer)
  }, [project, isLoaded])

  useEffect(() => {
    if (
      selectedNodeId &&
      !nodes.some(
        (node) =>
          node.id === selectedNodeId,
      )
    ) {
      setSelectedNodeId(null)
    }

    if (
      selectedEdgeId &&
      !edges.some(
        (edge) =>
          edge.id === selectedEdgeId,
      )
    ) {
      setSelectedEdgeId(null)
    }

    if (
      connectSourceId &&
      !nodes.some(
        (node) =>
          node.id === connectSourceId,
      )
    ) {
      setConnectSourceId(null)
    }
  }, [
    nodes,
    edges,
    selectedNodeId,
    selectedEdgeId,
    connectSourceId,
  ])

  const selectedNode = useMemo(
    () =>
      nodes.find(
        (node) =>
          node.id === selectedNodeId,
      ) ?? null,
    [nodes, selectedNodeId],
  )

  const selectedEdge = useMemo(
    () =>
      edges.find(
        (edge) =>
          edge.id === selectedEdgeId,
      ) ?? null,
    [edges, selectedEdgeId],
  )

  const filteredNodes =
    useMemo(() => {
      const term =
        search.trim().toLowerCase()

      if (!term) {
        return []
      }

      return nodes.filter((node) =>
        JSON.stringify(node)
          .toLowerCase()
          .includes(term),
      )
    }, [nodes, search])

  function updateProject(
    updater: (
      current: ProjectData,
    ) => ProjectData,
    mergeKey?: string,
  ) {
    commit(updater, {
      mergeKey,
    })
  }

  function createNode() {
    const node = makeNode(
      crypto.randomUUID(),
      'New person',
      'person',
    )

    updateProject((current) => ({
      ...current,
      nodes: [
        ...current.nodes,
        node,
      ],
      updatedAt:
        new Date().toISOString(),
    }))

    setSelectedNodeId(node.id)
    setSelectedEdgeId(null)
  }

  function updateNode(
    updatedNode: GraphNode,
  ) {
    updateProject(
      (current) => ({
        ...current,

        nodes: current.nodes.map(
          (node) =>
            node.id === updatedNode.id
              ? updatedNode
              : node,
        ),

        updatedAt:
          new Date().toISOString(),
      }),

      `node-${updatedNode.id}`,
    )
  }

  function updateEdge(
    updatedEdge: GraphEdge,
  ) {
    updateProject(
      (current) => ({
        ...current,

        edges: current.edges.map(
          (edge) =>
            edge.id === updatedEdge.id
              ? updatedEdge
              : edge,
        ),

        updatedAt:
          new Date().toISOString(),
      }),

      `edge-${updatedEdge.id}`,
    )
  }

  function updateProjectName(
    name: string,
  ) {
    updateProject(
      (current) => ({
        ...current,
        name,
        updatedAt:
          new Date().toISOString(),
      }),

      'project-name',
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

    updateProject((current) => ({
      ...current,

      nodes: current.nodes.filter(
        (node) =>
          node.id !== selectedNode.id,
      ),

      edges: current.edges.filter(
        (edge) =>
          edge.source !==
            selectedNode.id &&
          edge.target !==
            selectedNode.id,
      ),

      updatedAt:
        new Date().toISOString(),
    }))

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

    updateProject((current) => ({
      ...current,

      edges: current.edges.filter(
        (edge) =>
          edge.id !== selectedEdge.id,
      ),

      updatedAt:
        new Date().toISOString(),
    }))

    setSelectedEdgeId(null)
  }

  function startConnecting() {
    if (!selectedNodeId) {
      window.alert(
        'Select a starting node first.',
      )

      return
    }

    setConnectSourceId(
      selectedNodeId,
    )

    setSelectedEdgeId(null)
  }

  function handleConnectTarget(
    targetNodeId: string,
  ) {
    if (!connectSourceId) {
      return
    }

    if (
      targetNodeId ===
      connectSourceId
    ) {
      window.alert(
        'Choose a different target node.',
      )

      return
    }

    const edge = makeEdge(
      crypto.randomUUID(),
      connectSourceId,
      targetNodeId,
      'connected to',
    )

    updateProject((current) => ({
      ...current,
      edges: [
        ...current.edges,
        edge,
      ],
      updatedAt:
        new Date().toISOString(),
    }))

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

    replace(createEmptyProject())

    setSelectedNodeId(null)
    setSelectedEdgeId(null)
    setConnectSourceId(null)
    setSearch('')
  }

  async function importProject(
    file: File,
  ) {
    try {
      const importedProject =
        await readProjectFile(file)

      replace(importedProject)

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

  function deleteSelection() {
    if (selectedNode) {
      deleteSelectedNode()
      return
    }

    if (selectedEdge) {
      deleteSelectedEdge()
    }
  }

  useEffect(() => {
    function handleKeyboard(
      event: KeyboardEvent,
    ) {
      const target =
        event.target as HTMLElement | null

      const isTyping =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.tagName === 'SELECT' ||
        target?.isContentEditable

      const commandKey =
        event.metaKey ||
        event.ctrlKey

      if (
        commandKey &&
        event.key.toLowerCase() === 'z'
      ) {
        event.preventDefault()

        if (event.shiftKey) {
          redo()
        } else {
          undo()
        }

        return
      }

      if (
        commandKey &&
        event.key.toLowerCase() === 'n'
      ) {
        event.preventDefault()
        createNode()
        return
      }

      if (
        commandKey &&
        event.key.toLowerCase() === 's'
      ) {
        event.preventDefault()
        downloadProject(project)
        return
      }

      if (
        !isTyping &&
        (event.key === 'Delete' ||
          event.key === 'Backspace')
      ) {
        event.preventDefault()
        deleteSelection()
      }
    }

    window.addEventListener(
      'keydown',
      handleKeyboard,
    )

    return () =>
      window.removeEventListener(
        'keydown',
        handleKeyboard,
      )
  })

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
          <div className="brand-mark">
            N
          </div>

          <div>
            <h1>Nexus</h1>

            <p>
              Relationship Intelligence
              Platform
            </p>
          </div>
        </div>

        <input
          className="project-name-input"
          value={project.name}
          onChange={(event) =>
            updateProjectName(
              event.target.value,
            )
          }
          aria-label="Project name"
        />

        <label className="global-search">
          <span>⌕</span>

          <input
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value,
              )
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
              <span className="node-icon">
                ◎
              </span>

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
                <span className="node-icon">
                  ●
                </span>

                <span>{item.label}</span>

                <span className="node-count">
                  {
                    nodes.filter(
                      (node) =>
                        node.type ===
                        item.type,
                    ).length
                  }
                </span>
              </button>
            ))}
          </nav>

          {search && (
            <div className="search-results">
              <div className="sidebar-heading">
                <span>
                  Search results
                </span>
              </div>

              {filteredNodes.map(
                (node) => (
                  <button
                    key={node.id}
                    className="saved-view"
                    onClick={() => {
                      setSelectedNodeId(
                        node.id,
                      )

                      setSelectedEdgeId(
                        null,
                      )
                    }}
                  >
                    {node.label}
                  </button>
                ),
              )}
            </div>
          )}

          <div className="project-actions">
            <button
              onClick={createNewProject}
            >
              New project
            </button>

            <button
              onClick={() =>
                downloadProject(project)
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
                const file =
                  event.target.files?.[0]

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
              title="New node (Command N)"
            >
              ＋ New node
            </button>

            <button
              className="history-button"
              disabled={!canUndo}
              onClick={undo}
              title="Undo (Command Z)"
            >
              ↶ Undo
            </button>

            <button
              className="history-button"
              disabled={!canRedo}
              onClick={redo}
              title="Redo (Command Shift Z)"
            >
              ↷ Redo
            </button>

            <div className="view-switcher">
              <button
                className={activeView === 'graph' ? 'active' : ''}
                onClick={() => setActiveView('graph')}
              >
                Graph
              </button>

              <button
                className={activeView === 'timeline' ? 'active' : ''}
                onClick={() => setActiveView('timeline')}
              >
                Timeline
              </button>

              <button
                className={activeView === 'dashboard' ? 'active' : ''}
                onClick={() => setActiveView('dashboard')}
              >
                Dashboard
              </button>
            </div>

            <button
              className={
                showSuggestedConnections
                  ? 'suggestion-toggle active'
                  : 'suggestion-toggle'
              }
              onClick={() =>
                setShowSuggestedConnections(
                  (current) => !current,
                )
              }
              title="Show or hide automatic similarity links"
            >
              ◌ Suggested links
            </button>

            <button
              className={
                showIntelligence
                  ? 'intelligence-button active'
                  : 'intelligence-button'
              }
              onClick={() =>
                setShowIntelligence(
                  (current) => !current,
                )
              }
            >
              ◈ Intelligence
            </button>

            {connectSourceId ? (
              <>
                <span className="connect-message">
                  Click another node to
                  create the relationship.
                </span>

                <button
                  onClick={() =>
                    setConnectSourceId(
                      null,
                    )
                  }
                >
                  Cancel connection
                </button>
              </>
            ) : (
              <button
                onClick={startConnecting}
              >
                Connect selected node
              </button>
            )}
          </div>

          <section className="canvas">
            <div
              className={`workspace-view ${
                activeView === 'graph' ? '' : 'hidden'
              }`}
            >
              <GraphCanvas
                nodes={nodes}
                edges={edges}
                suggestedConnections={suggestedConnections}
                showSuggestedConnections={
                  showSuggestedConnections
                }
                selectedNodeId={selectedNodeId}
                selectedEdgeId={selectedEdgeId}
                connectSourceId={connectSourceId}
                onSelectNode={setSelectedNodeId}
                onSelectEdge={setSelectedEdgeId}
                onConnectTarget={handleConnectTarget}
              />
            </div>

            <div
              className={`workspace-view ${
                activeView === 'timeline' ? '' : 'hidden'
              }`}
            >
              <TimelineView
                nodes={nodes}
                edges={edges}
                onSelectNode={(nodeId) => {
                  setSelectedNodeId(nodeId)
                  setSelectedEdgeId(null)
                }}
                onSelectEdge={(edgeId) => {
                  setSelectedEdgeId(edgeId)
                  setSelectedNodeId(null)
                }}
              />
            </div>

            <div
              className={`workspace-view ${
                activeView === 'dashboard' ? '' : 'hidden'
              }`}
            >
              <DashboardView
                nodes={nodes}
                edges={edges}
                analytics={analytics}
                onSelectNode={(nodeId) => {
                  setSelectedNodeId(nodeId)
                  setSelectedEdgeId(null)
                }}
              />
            </div>
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

            <span>
              {nodes.length} nodes
            </span>

            <span>
              {edges.length}{' '}
              relationships
            </span>

            <span className="statusbar-spacer" />

            <span>
              ⌘Z Undo · ⇧⌘Z Redo ·
              ⌘N New · Delete Remove
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

          {showIntelligence ? (
            <IntelligencePanel
              analytics={analytics}
              selectedNodeId={selectedNodeId}
              onSelectNode={(nodeId) => {
                setSelectedNodeId(nodeId)
                setSelectedEdgeId(null)
              }}
              onClose={() =>
                setShowIntelligence(false)
              }
            />
          ) : selectedNode ? (
            <NodeEditor
              node={selectedNode}
              onChange={updateNode}
              onDelete={
                deleteSelectedNode
              }
            />
          ) : selectedEdge ? (
            <RelationshipEditor
              edge={selectedEdge}
              sourceNode={
                nodes.find(
                  (node) =>
                    node.id ===
                    selectedEdge.source,
                ) ?? null
              }
              targetNode={
                nodes.find(
                  (node) =>
                    node.id ===
                    selectedEdge.target,
                ) ?? null
              }
              onChange={updateEdge}
              onDelete={
                deleteSelectedEdge
              }
            />
          ) : (
            <div className="inspector-empty">
              <div className="inspector-empty-icon">
                ◎
              </div>

              <h3>
                Select a node or
                relationship
              </h3>

              <p>
                Click a node to edit its
                information, or click a
                line to edit the
                relationship.
              </p>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}

export default App
