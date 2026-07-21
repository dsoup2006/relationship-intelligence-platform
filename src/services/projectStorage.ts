import type { GraphEdge, GraphNode } from '../types/graph'

const STORAGE_KEY = 'nexus-project-v1'

export interface ProjectData {
  version: 1
  name: string
  updatedAt: string
  nodes: GraphNode[]
  edges: GraphEdge[]
}

export function createEmptyProject(): ProjectData {
  return {
    version: 1,
    name: 'Untitled Project',
    updatedAt: new Date().toISOString(),
    nodes: [],
    edges: [],
  }
}

export function saveProject(project: ProjectData): void {
  const updatedProject: ProjectData = {
    ...project,
    updatedAt: new Date().toISOString(),
  }

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(updatedProject),
  )
}

export function loadProject(): ProjectData | null {
  const saved = localStorage.getItem(STORAGE_KEY)

  if (!saved) {
    return null
  }

  try {
    const project = JSON.parse(saved) as ProjectData

    if (
      project.version !== 1 ||
      !Array.isArray(project.nodes) ||
      !Array.isArray(project.edges)
    ) {
      throw new Error('Invalid project format')
    }

    return project
  } catch (error) {
    console.error('Could not load saved project:', error)
    return null
  }
}

export function clearSavedProject(): void {
  localStorage.removeItem(STORAGE_KEY)
}

export function downloadProject(project: ProjectData): void {
  const fileContents = JSON.stringify(
    {
      ...project,
      updatedAt: new Date().toISOString(),
    },
    null,
    2,
  )

  const blob = new Blob([fileContents], {
    type: 'application/json',
  })

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  const safeName =
    project.name
      .trim()
      .replace(/[^a-z0-9-_]+/gi, '-')
      .replace(/^-|-$/g, '') || 'nexus-project'

  link.href = url
  link.download = `${safeName}.json`
  link.click()

  URL.revokeObjectURL(url)
}

export async function readProjectFile(
  file: File,
): Promise<ProjectData> {
  const contents = await file.text()
  const project = JSON.parse(contents) as ProjectData

  if (
    project.version !== 1 ||
    !Array.isArray(project.nodes) ||
    !Array.isArray(project.edges)
  ) {
    throw new Error('This is not a valid Nexus project file.')
  }

  return project
}
