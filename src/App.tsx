import './App.css'

const nodeTypes = [
  { icon: '●', label: 'People', count: 0 },
  { icon: '■', label: 'Companies', count: 0 },
  { icon: '◆', label: 'Churches', count: 0 },
  { icon: '▲', label: 'Schools', count: 0 },
  { icon: '⌖', label: 'Addresses', count: 0 },
  { icon: '◷', label: 'Events', count: 0 },
  { icon: '▤', label: 'Documents', count: 0 },
]

function App() {
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

        <div className="topbar-actions">
          <label className="global-search">
            <span>⌕</span>
            <input placeholder="Search people, places, organizations…" />
            <kbd>⌘ K</kbd>
          </label>

          <button className="icon-button" aria-label="Notifications">
            ◉
          </button>

          <button className="avatar-button" aria-label="Account">
            DS
          </button>
        </div>
      </header>

      <div className="workspace">
        <aside className="sidebar">
          <div className="sidebar-heading">
            <span>Explorer</span>
            <button aria-label="Add item">＋</button>
          </div>

          <nav className="node-list">
            <button className="node-list-item active">
              <span className="node-icon">◎</span>
              <span>All nodes</span>
              <span className="node-count">0</span>
            </button>

            {nodeTypes.map((item) => (
              <button className="node-list-item" key={item.label}>
                <span className="node-icon">{item.icon}</span>
                <span>{item.label}</span>
                <span className="node-count">{item.count}</span>
              </button>
            ))}
          </nav>

          <div className="sidebar-section">
            <div className="sidebar-heading">
              <span>Saved views</span>
              <button aria-label="Add saved view">＋</button>
            </div>

            <button className="saved-view">Most connected</button>
            <button className="saved-view">Recent additions</button>
            <button className="saved-view">Unlinked nodes</button>
          </div>

          <div className="sidebar-footer">
            <button>⚙ Settings</button>
          </div>
        </aside>

        <main className="canvas-area">
          <div className="canvas-toolbar">
            <button className="primary-button">＋ New node</button>
            <button>Connect</button>
            <button>Auto layout</button>
            <button>Fit view</button>

            <div className="canvas-toolbar-spacer" />

            <button>−</button>
            <span className="zoom-value">100%</span>
            <button>＋</button>
          </div>

          <section className="canvas">
            <div className="canvas-grid" />

            <div className="empty-state">
              <div className="empty-graphic">
                <span className="empty-node node-one" />
                <span className="empty-node node-two" />
                <span className="empty-node node-three" />
                <span className="empty-line line-one" />
                <span className="empty-line line-two" />
              </div>

              <h2>Build your knowledge graph</h2>
              <p>
                Create people, organizations, places, and events, then connect
                them to discover meaningful relationships.
              </p>
              <button className="primary-button">Create your first node</button>
            </div>
          </section>

          <footer className="statusbar">
            <span><i className="status-dot online" /> Autosave ready</span>
            <span>0 nodes</span>
            <span>0 relationships</span>
            <span>Physics: paused</span>
            <span className="statusbar-spacer" />
            <span>Local project</span>
          </footer>
        </main>

        <aside className="inspector">
          <div className="inspector-header">
            <div>
              <h2>Inspector</h2>
              <p>No selection</p>
            </div>
            <button aria-label="Close inspector">×</button>
          </div>

          <div className="inspector-empty">
            <div className="inspector-empty-icon">◎</div>
            <h3>Select a node</h3>
            <p>
              Click a node on the canvas to view and edit its properties,
              relationships, notes, and activity.
            </p>
          </div>

          <div className="inspector-tabs">
            <button className="active">Properties</button>
            <button>Connections</button>
            <button>Notes</button>
          </div>
        </aside>
      </div>
    </div>
  )
}

export default App
