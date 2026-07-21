export type NodeType =
  | 'person'
  | 'company'
  | 'church'
  | 'school'
  | 'address'
  | 'event'
  | 'document'

export interface GraphNode {
  id: string
  label: string
  type: NodeType
  gender?: 'male' | 'female' | 'unspecified'
  description?: string
}

export interface GraphEdge {
  id: string
  source: string
  target: string
  label: string
}
