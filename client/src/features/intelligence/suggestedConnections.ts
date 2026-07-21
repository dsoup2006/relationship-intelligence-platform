import type { GraphEdge, GraphNode } from '../../types/graph'

export interface SuggestedConnection {
  id: string
  source: string
  target: string
  score: number
  reasons: string[]
}

function normalize(value: string): string {
  return value.trim().toLowerCase()
}

function alreadyConnected(
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

function findSharedReasons(
  first: GraphNode,
  second: GraphNode,
): string[] {
  const reasons: string[] = []

  if (
    first.address &&
    second.address &&
    normalize(first.address) === normalize(second.address)
  ) {
    reasons.push(`Same address: ${first.address}`)
  }

  if (
    first.city &&
    second.city &&
    normalize(first.city) === normalize(second.city)
  ) {
    reasons.push(`Same city: ${first.city}`)
  }

  const firstTags = new Set(first.tags.map(normalize))

  second.tags.forEach((tag) => {
    if (firstTags.has(normalize(tag))) {
      reasons.push(`Shared tag: ${tag}`)
    }
  })

  const firstFields = new Map(
    first.customFields
      .filter(
        (field) =>
          field.key.trim().length > 0 &&
          field.value.trim().length > 0,
      )
      .map((field) => [
        normalize(field.key),
        normalize(field.value),
      ]),
  )

  second.customFields.forEach((field) => {
    const key = normalize(field.key)
    const value = normalize(field.value)

    if (key && value && firstFields.get(key) === value) {
      reasons.push(
        `Same ${field.key.trim()}: ${field.value.trim()}`,
      )
    }
  })

  return [...new Set(reasons)]
}

function calculateScore(reasons: string[]): number {
  return Math.min(
    100,
    reasons.reduce((total, reason) => {
      if (reason.startsWith('Same address')) {
        return total + 45
      }

      if (reason.startsWith('Same city')) {
        return total + 15
      }

      if (reason.startsWith('Shared tag')) {
        return total + 12
      }

      return total + 20
    }, 0),
  )
}

export function buildSuggestedConnections(
  nodes: GraphNode[],
  edges: GraphEdge[],
  minimumScore = 20,
): SuggestedConnection[] {
  const suggestions: SuggestedConnection[] = []

  for (
    let firstIndex = 0;
    firstIndex < nodes.length;
    firstIndex += 1
  ) {
    for (
      let secondIndex = firstIndex + 1;
      secondIndex < nodes.length;
      secondIndex += 1
    ) {
      const first = nodes[firstIndex]
      const second = nodes[secondIndex]

      if (alreadyConnected(first.id, second.id, edges)) {
        continue
      }

      const reasons = findSharedReasons(first, second)
      const score = calculateScore(reasons)

      if (score >= minimumScore) {
        suggestions.push({
          id: `suggested-${first.id}-${second.id}`,
          source: first.id,
          target: second.id,
          score,
          reasons,
        })
      }
    }
  }

  return suggestions.sort(
    (first, second) => second.score - first.score,
  )
}
