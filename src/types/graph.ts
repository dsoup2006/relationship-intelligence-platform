export type NodeType =
  | 'person'
  | 'company'
  | 'church'
  | 'school'
  | 'address'
  | 'location'
  | 'phone'
  | 'email'
  | 'website'
  | 'socialAccount'
  | 'vehicle'
  | 'event'
  | 'document'
  | 'photo'
  | 'asset'

export type Gender = 'male' | 'female' | 'unspecified'

export interface CustomField {
  id: string
  key: string
  value: string
}

export interface GraphNode {
  id: string
  label: string
  type: NodeType
  gender: Gender
  description: string
  photoUrl: string
  address: string
  city: string
  tags: string[]
  notes: string
  customFields: CustomField[]
}

export interface GraphEdge {
  id: string
  source: string
  target: string
  label: string
  startDate: string
  endDate: string
  strength: number
  confidence: number
  notes: string
}
