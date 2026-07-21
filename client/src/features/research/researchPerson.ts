export interface ResearchFact {
  field:
    | 'employer'
    | 'role'
    | 'city'
    | 'education'
    | 'organization'
    | 'website'
    | 'publicSocialProfile'
    | 'biography'
  value: string
  confidence: number
  sourceTitle: string
  sourceUrl: string
  reason: string
}

export interface PersonResearchResult {
  summary: string
  identityConfidence: number
  possibleMismatch: boolean
  facts: ResearchFact[]
}

export interface PersonResearchRequest {
  name: string
  city?: string
  employer?: string
  organization?: string
}

export async function researchPerson(
  request: PersonResearchRequest,
): Promise<PersonResearchResult> {
  const response = await fetch(
    'http://localhost:8787/api/research-person',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    },
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error ?? 'Research failed.')
  }

  return data as PersonResearchResult
}
