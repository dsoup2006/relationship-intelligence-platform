import type { GraphNode } from '../../types/graph'

export interface AttributeSpoke {
  id: string
  parentId: string
  label: string
  value: string
  fieldKey?: string
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
    value: string,
    suffix = '',
    fieldKey?: string,
  ) {
    const cleanLabel = label.trim()
    const cleanValue = value.trim()

    if (!cleanLabel || !cleanValue) {
      return
    }

    spokes.push({
      id: `attribute-${node.id}-${category}-${suffix || spokes.length}`,
      parentId: node.id,
      label: cleanLabel,
      value: cleanValue,
      fieldKey,
      category,
    })
  }

  if (
    node.type === 'person' &&
    node.gender !== 'unspecified'
  ) {
    add(
      'gender',
      `Gender: ${node.gender}`,
      node.gender,
    )
  }

  if (node.address) {
    add(
      'address',
      `Address: ${shortText(node.address)}`,
      node.address,
    )
  }

  if (node.city) {
    add(
      'city',
      `City: ${node.city}`,
      node.city,
    )
  }

  node.tags.forEach((tag, index) => {
    add(
      'tag',
      `Tag: ${tag}`,
      tag,
      String(index),
    )
  })

  if (node.description) {
    add(
      'description',
      `Description: ${shortText(node.description)}`,
      node.description,
    )
  }

  if (node.notes) {
    add(
      'note',
      `Notes: ${shortText(node.notes)}`,
      node.notes,
    )
  }

  if (node.photoUrl) {
    add(
      'photo',
      'Profile photo',
      node.photoUrl,
    )
  }

  node.customFields.forEach((field, index) => {
    if (
      !field.key.trim() ||
      !field.value.trim()
    ) {
      return
    }

    add(
      'custom',
      `${field.key.trim()}: ${shortText(field.value)}`,
      field.value,
      String(index),
      field.key,
    )
  })

  return spokes
}
