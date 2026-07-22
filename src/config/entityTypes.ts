import type { NodeType } from '../types/graph'

export interface EntityTypeDefinition {
  type: NodeType
  label: string
  singularLabel: string
  symbol: string
  defaultRelationship: string
  description: string
}

export const entityTypes: EntityTypeDefinition[] = [
  {
    type: 'person',
    label: 'People',
    singularLabel: 'Person',
    symbol: '●',
    defaultRelationship: 'connected to',
    description: 'An individual person',
  },
  {
    type: 'company',
    label: 'Companies',
    singularLabel: 'Company',
    symbol: '■',
    defaultRelationship: 'works at',
    description: 'A business or employer',
  },
  {
    type: 'church',
    label: 'Churches',
    singularLabel: 'Church',
    symbol: '◆',
    defaultRelationship: 'attends',
    description: 'A church or ministry',
  },
  {
    type: 'school',
    label: 'Schools',
    singularLabel: 'School',
    symbol: '⬢',
    defaultRelationship: 'attended',
    description: 'A school or educational institution',
  },
  {
    type: 'address',
    label: 'Addresses',
    singularLabel: 'Address',
    symbol: '⌂',
    defaultRelationship: 'lives at',
    description: 'A street address or household',
  },
  {
    type: 'location',
    label: 'Locations',
    singularLabel: 'Location',
    symbol: '⌖',
    defaultRelationship: 'located in',
    description: 'A city, region, or geographic place',
  },
  {
    type: 'phone',
    label: 'Phones',
    singularLabel: 'Phone',
    symbol: '☎',
    defaultRelationship: 'uses',
    description: 'A phone number',
  },
  {
    type: 'email',
    label: 'Emails',
    singularLabel: 'Email',
    symbol: '✉',
    defaultRelationship: 'uses',
    description: 'An email address',
  },
  {
    type: 'website',
    label: 'Websites',
    singularLabel: 'Website',
    symbol: '◎',
    defaultRelationship: 'associated with',
    description: 'A website or web page',
  },
  {
    type: 'socialAccount',
    label: 'Social accounts',
    singularLabel: 'Social account',
    symbol: '@',
    defaultRelationship: 'owns',
    description: 'A public social-media account',
  },
  {
    type: 'vehicle',
    label: 'Vehicles',
    singularLabel: 'Vehicle',
    symbol: '▰',
    defaultRelationship: 'owns',
    description: 'A car, truck, boat, or other vehicle',
  },
  {
    type: 'event',
    label: 'Events',
    singularLabel: 'Event',
    symbol: '◷',
    defaultRelationship: 'attended',
    description: 'A dated meeting or event',
  },
  {
    type: 'document',
    label: 'Documents',
    singularLabel: 'Document',
    symbol: '▤',
    defaultRelationship: 'mentioned in',
    description: 'A file, report, or record',
  },
  {
    type: 'photo',
    label: 'Photos',
    singularLabel: 'Photo',
    symbol: '▧',
    defaultRelationship: 'appears in',
    description: 'A photograph or image',
  },
  {
    type: 'asset',
    label: 'Assets',
    singularLabel: 'Asset',
    symbol: '◇',
    defaultRelationship: 'owns',
    description: 'A property or other asset',
  },
]

export const entityTypeValues: NodeType[] =
  entityTypes.map((definition) => definition.type)

export function getEntityTypeDefinition(
  type: NodeType,
): EntityTypeDefinition {
  return (
    entityTypes.find(
      (definition) => definition.type === type,
    ) ?? entityTypes[0]
  )
}
