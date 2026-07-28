import './StatusBar.css'

interface StatusBarProps {
  saveStatus: 'saved' | 'saving' | 'error'
  nodeCount: number
  relationshipCount: number
}

export function StatusBar({
  saveStatus,
  nodeCount,
  relationshipCount,
}: StatusBarProps) {
  return (
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

      <span>{nodeCount} nodes</span>

      <span>
        {relationshipCount} relationships
      </span>

      <span className="statusbar-spacer" />

      <span>
        ⌘Z Undo · ⇧⌘Z Redo · ⌘N New · Delete Remove
      </span>
    </footer>
  )
}