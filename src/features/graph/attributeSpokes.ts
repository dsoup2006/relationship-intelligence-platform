import type { GraphNode } from '../../types/graph'

export interface AttributeSpoke {
  id: string
  parentId: string
  label: string
  category:
    | 'gender'
    | 'address'
    | 'city'
    | 'tag'
    | 'description'
    | 'note'
    | 'photo'
    | 'custom'
}

function shortText(value: string, maximum = 45): string {
  const clean = value.trim()

  if (clean.length <= maximum) {
    return clean
  }

  return `${clean.slice(0, maximum - 1)}…`
}

export function buildAttributeSpokes(
  node: GraphNode,
): AttributeSpoke[] {
  const spokes: AttributeSpoke[] = []

  function add(
    category: AttributeSpoke['category'],
    label: string,
    suffix = '',
  ) {
    const cleanLabel = label.trim()

    if (!cleanLabel) {
      return
    }

    spokes.push({
      id: `attribute-${node.id}-${category}-${suffix || spokes.length}`,
      parentId: node.id,
      label: cleanLabel,
      category,
    })
  }

  if (node.type === 'person' && node.gender !== 'unspecified') {
    add('gender', `Gender: ${node.gender}`)
  }

  if (node.address) {
    add('address', `Address: ${shortText(node.address)}`)
  }

  if (node.city) {
    add('city', `City: ${node.city}`)
  }

  node.tags.forEach((tag, index) => {
    add('tag', `Tag: ${tag}`, String(index))
  })

  if (node.description) {
    add(
      'description',
      `Description: ${shortText(node.description)}`,
    )
  }

  if (node.notes) {
    add('note', `Notes: ${shortText(node.notes)}`)
  }

  if (node.photoUrl) {
    add('photo', 'Profile photo')
  }

  node.customFields.forEach((field, index) => {
    if (!field.key.trim() || !field.value.trim()) {
      return
    }

    add(
      'custom',
      `${field.key.trim()}: ${shortText(field.value)}`,
      String(index),
    )
  })

  return spokes
}
