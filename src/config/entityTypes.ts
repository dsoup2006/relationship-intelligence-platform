import type { NodeType } from '../types/graph'

export interface EntityTypeDefinition {
  type: NodeType
  label: string
  singularLabel: string
  symbol: string
  color: string
  defaultRelationship: string
}

export const entityTypes: EntityTypeDefinition[] = [
  {
    type: 'person',
    label: 'People',
    singularLabel: 'Person',
    symbol: '👤',
    color: '#3b82f6',
    defaultRelationship: 'knows',
  },
  {
    type: 'company',
    label: 'Companies',
    singularLabel: 'Company',
    symbol: '🏢',
    color: '#10b981',
    defaultRelationship: 'works at',
  },
  {
    type: 'church',
    label: 'Churches',
    singularLabel: 'Church',
    symbol: '⛪',
    color: '#8b5cf6',
    defaultRelationship: 'attends',
  },
  {
    type: 'school',
    label: 'Schools',
    singularLabel: 'School',
    symbol: '🎓',
    color: '#f59e0b',
    defaultRelationship: 'attended',
  },
  {
    type: 'address',
    label: 'Addresses',
    singularLabel: 'Address',
    symbol: '📍',
    color: '#ef4444',
    defaultRelationship: 'lives at',
  },
  {
    type: 'location',
    label: 'Locations',
    singularLabel: 'Location',
    symbol: '🌍',
    color: '#06b6d4',
    defaultRelationship: 'located in',
  },
  {
    type: 'phone',
    label: 'Phones',
    singularLabel: 'Phone',
    symbol: '📞',
    color: '#64748b',
    defaultRelationship: 'uses',
  },
  {
    type: 'email',
    label: 'Emails',
    singularLabel: 'Email',
    symbol: '✉️',
    color: '#6366f1',
    defaultRelationship: 'uses',
  },
  {
    type: 'website',
    label: 'Websites',
    singularLabel: 'Website',
    symbol: '🌐',
    color: '#0ea5e9',
    defaultRelationship: 'owns',
  },
  {
    type: 'socialAccount',
    label: 'Social Accounts',
    singularLabel: 'Social Account',
    symbol: '@',
    color: '#ec4899',
    defaultRelationship: 'owns',
  },
  {
    type: 'vehicle',
    label: 'Vehicles',
    singularLabel: 'Vehicle',
    symbol: '🚗',
    color: '#f97316',
    defaultRelationship: 'owns',
  },
  {
    type: 'event',
    label: 'Events',
    singularLabel: 'Event',
    symbol: '📅',
    color: '#14b8a6',
    defaultRelationship: 'attended',
  },
  {
    type: 'document',
    label: 'Documents',
    singularLabel: 'Document',
    symbol: '📄',
    color: '#6b7280',
    defaultRelationship: 'mentions',
  },
  {
    type: 'photo',
    label: 'Photos',
    singularLabel: 'Photo',
    symbol: '🖼️',
    color: '#a855f7',
    defaultRelationship: 'contains',
  },
  {
    type: 'asset',
    label: 'Assets',
    singularLabel: 'Asset',
    symbol: '💎',
    color: '#84cc16',
    defaultRelationship: 'owns',
  },
]
export const entityTypeValues: NodeType[] =
  entityTypes.map((entity) => entity.type)
  
export function getEntityType(type: NodeType) {
  return (
    entityTypes.find((entity) => entity.type === type) ??
    entityTypes[0]
  )
}