import type { NodeType } from '../types/graph'

export interface EntityTypeDefinition {
  type: NodeType
  label: string
  singularLabel: string
  defaultRelationship: string
}

export const entityTypes: EntityTypeDefinition[] = [
  {
    type: 'person',
    label: 'People',
    singularLabel: 'Person',
    defaultRelationship: 'connected to',
  },
  {
    type: 'company',
    label: 'Companies',
    singularLabel: 'Company',
    defaultRelationship: 'works at',
  },
  {
    type: 'church',
    label: 'Churches',
    singularLabel: 'Church',
    defaultRelationship: 'attends',
  },
  {
    type: 'school',
    label: 'Schools',
    singularLabel: 'School',
    defaultRelationship: 'attended',
  },
  {
    type: 'address',
    label: 'Addresses',
    singularLabel: 'Address',
    defaultRelationship: 'lives at',
  },
  {
    type: 'event',
    label: 'Events',
    singularLabel: 'Event',
    defaultRelationship: 'attended',
  },
  {
    type: 'document',
    label: 'Documents',
    singularLabel: 'Document',
    defaultRelationship: 'mentioned in',
  },
]

export const entityTypeValues = entityTypes.map(
  (definition) => definition.type,
)

export function getEntityTypeDefinition(
  type: NodeType,
): EntityTypeDefinition {
  return (
    entityTypes.find(
      (definition) => definition.type === type,
    ) ?? entityTypes[0]
  )
}
