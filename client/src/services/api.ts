export interface ApiHealthResponse {
  ok: boolean
  service: string
  version: string
  time: string
}

export async function checkApiHealth(): Promise<ApiHealthResponse> {
  const response = await fetch('/api/health')

  if (!response.ok) {
    throw new Error(`Nexus API returned ${response.status}.`)
  }

  return response.json() as Promise<ApiHealthResponse>
}
