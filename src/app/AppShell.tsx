import type { ReactNode } from 'react'

import './AppShell.css'

interface AppShellProps {
  toolbar: ReactNode
  explorer: ReactNode
  workspace: ReactNode
  inspector: ReactNode
  timeline?: ReactNode
}

export function AppShell({
  toolbar,
  explorer,
  workspace,
  inspector,
  timeline,
}: AppShellProps) {
  return (
    <div className="nexus-shell">
      <header className="nexus-shell-toolbar">
        {toolbar}
      </header>

      <aside className="nexus-shell-explorer">
        {explorer}
      </aside>

      <main className="nexus-shell-workspace">
        {workspace}
      </main>

      <aside className="nexus-shell-inspector">
        {inspector}
      </aside>

      {timeline && (
        <section className="nexus-shell-timeline">
          {timeline}
        </section>
      )}
    </div>
  )
}