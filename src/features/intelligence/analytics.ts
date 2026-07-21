import type { GraphEdge, GraphNode } from '../../types/graph'

export interface RankedNode {
  nodeId: string
  label: string
  connectionCount: number
  centralityScore: number
}

export interface SimilarityMatch {
  nodeId: string
  label: string
  score: number
  sharedReasons: string[]
  alreadyConnected: boolean
}

export interface DuplicateCandidate {
  firstNodeId: string
  firstLabel: string
  secondNodeId: string
  secondLabel: string
  reasons: string[]
}

export interface GraphAnalytics {
  totalNodes: number
  totalRelationships: number
  networkGroups: number
  isolatedNodes: GraphNode[]
  mostConnected: RankedNode[]
  similarityMatches: Record<string, SimilarityMatch[]>
  duplicateCandidates: DuplicateCandidate[]
}

function normalize(value: string): string {
  return value.trim().toLowerCase()
}

function relationshipExists(
  firstId: string,
  secondId: string,
  edges: GraphEdge[],
): boolean {
  return edges.some(
    (edge) =>
      (edge.source === firstId && edge.target === secondId) ||
      (edge.source === secondId && edge.target === firstId),
  )
}

function connectionCount(
  nodeId: string,
  edges: GraphEdge[],
): number {
  return edges.filter(
    (edge) =>
      edge.source === nodeId || edge.target === nodeId,
  ).length
}

function sharedNodeCharacteristics(
  first: GraphNode,
  second: GraphNode,
): string[] {
  const reasons: string[] = []

  if (
    first.city &&
    second.city &&
    normalize(first.city) === normalize(second.city)
  ) {
    reasons.push(`Same city: ${first.city}`)
  }

  if (
    first.address &&
    second.address &&
    normalize(first.address) === normalize(second.address)
  ) {
    reasons.push(`Same address: ${first.address}`)
  }

  const firstTags = new Set(first.tags.map(normalize))
  const sharedTags = second.tags
    .map(normalize)
    .filter((tag) => firstTags.has(tag))

  sharedTags.forEach((tag) => {
    reasons.push(`Shared tag: ${tag}`)
  })

  const firstFields = new Map(
    first.customFields
      .filter((field) => field.key.trim() && field.value.trim())
      .map((field) => [
        normalize(field.key),
        normalize(field.value),
      ]),
  )

  second.customFields.forEach((field) => {
    const key = normalize(field.key)
    const value = normalize(field.value)

    if (
      key &&
      value &&
      firstFields.get(key) === value
    ) {
      reasons.push(
        `Same ${field.key.trim()}: ${field.value.trim()}`,
      )
    }
  })

  return [...new Set(reasons)]
}

function similarityScore(reasons: string[]): number {
  return Math.min(
    100,
    reasons.reduce((score, reason) => {
      if (reason.startsWith('Same address')) {
        return score + 40
      }

      if (reason.startsWith('Same city')) {
        return score + 15
      }

      if (reason.startsWith('Shared tag')) {
        return score + 12
      }

      return score + 20
    }, 0),
  )
}

function countNetworkGroups(
  nodes: GraphNode[],
  edges: GraphEdge[],
): number {
  const adjacency = new Map<string, Set<string>>()

  nodes.forEach((node) => {
    adjacency.set(node.id, new Set())
  })

  edges.forEach((edge) => {
    adjacency.get(edge.source)?.add(edge.target)
    adjacency.get(edge.target)?.add(edge.source)
  })

  const visited = new Set<string>()
  let groups = 0

  nodes.forEach((node) => {
    if (visited.has(node.id)) {
      return
    }

    groups += 1
    const queue = [node.id]
    visited.add(node.id)

    while (queue.length > 0) {
      const current = queue.shift()

      if (!current) {
        continue
      }

      adjacency.get(current)?.forEach((neighbor) => {
        if (!visited.has(neighbor)) {
          visited.add(neighbor)
          queue.push(neighbor)
        }
      })
    }
  })

  return groups
}

function findDuplicateCandidates(
  nodes: GraphNode[],
): DuplicateCandidate[] {
  const results: DuplicateCandidate[] = []

  for (let firstIndex = 0; firstIndex < nodes.length; firstIndex += 1) {
    for (
      let secondIndex = firstIndex + 1;
      secondIndex < nodes.length;
      secondIndex += 1
    ) {
      const first = nodes[firstIndex]
      const second = nodes[secondIndex]
      const reasons: string[] = []

      if (
        normalize(first.label) === normalize(second.label)
      ) {
        reasons.push('Same name')
      }

      if (
        first.address &&
        second.address &&
        normalize(first.address) === normalize(second.address)
      ) {
        reasons.push('Same address')
      }

      if (
        first.photoUrl &&
        second.photoUrl &&
        first.photoUrl === second.photoUrl
      ) {
        reasons.push('Same photo')
      }

      if (reasons.length > 0) {
        results.push({
          firstNodeId: first.id,
          firstLabel: first.label,
          secondNodeId: second.id,
          secondLabel: second.label,
          reasons,
        })
      }
    }
  }

  return results
}

export function analyzeGraph(
  nodes: GraphNode[],
  edges: GraphEdge[],
): GraphAnalytics {
  const maximumPossibleConnections = Math.max(
    nodes.length - 1,
    1,
  )

  const mostConnected = nodes
    .map((node) => {
      const count = connectionCount(node.id, edges)

      return {
        nodeId: node.id,
        label: node.label,
        connectionCount: count,
        centralityScore: Math.round(
          (count / maximumPossibleConnections) * 100,
        ),
      }
    })
    .sort(
      (first, second) =>
        second.connectionCount - first.connectionCount ||
        first.label.localeCompare(second.label),
    )

  const similarityMatches: Record<string, SimilarityMatch[]> = {}

  nodes.forEach((selectedNode) => {
    similarityMatches[selectedNode.id] = nodes
      .filter((node) => node.id !== selectedNode.id)
      .map((otherNode) => {
        const sharedReasons = sharedNodeCharacteristics(
          selectedNode,
          otherNode,
        )

        return {
          nodeId: otherNode.id,
          label: otherNode.label,
          score: similarityScore(sharedReasons),
          sharedReasons,
          alreadyConnected: relationshipExists(
            selectedNode.id,
            otherNode.id,
            edges,
          ),
        }
      })
      .filter((match) => match.score > 0)
      .sort(
        (first, second) =>
          second.score - first.score ||
          first.label.localeCompare(second.label),
      )
  })

  return {
    totalNodes: nodes.length,
    totalRelationships: edges.length,
    networkGroups: countNetworkGroups(nodes, edges),
    isolatedNodes: nodes.filter(
      (node) => connectionCount(node.id, edges) === 0,
    ),
    mostConnected,
    similarityMatches,
    duplicateCandidates: findDuplicateCandidates(nodes),
  }
}
