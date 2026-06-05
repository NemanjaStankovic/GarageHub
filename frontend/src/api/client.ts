import { getAccessToken } from '../lib/authStorage.ts'

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? ''

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

function formatValidationErrors(errors: Record<string, unknown>): string | null {
  const messages: string[] = []

  for (const [field, value] of Object.entries(errors)) {
    if (Array.isArray(value)) {
      value.forEach((msg) => {
        if (typeof msg === 'string') messages.push(`${field}: ${msg}`)
      })
    } else if (typeof value === 'string') {
      messages.push(`${field}: ${value}`)
    }
  }

  return messages.length > 0 ? messages.join(' ') : null
}

async function parseErrorMessage(response: Response): Promise<string> {
  const text = await response.text()
  if (!text) return response.statusText || 'Request failed'

  try {
    const json = JSON.parse(text) as unknown
    if (typeof json === 'string') return json
    if (json && typeof json === 'object') {
      const record = json as Record<string, unknown>

      if (record.errors && typeof record.errors === 'object') {
        const validation = formatValidationErrors(record.errors as Record<string, unknown>)
        if (validation) return validation
      }

      if (typeof record.title === 'string' && record.title !== 'One or more validation errors occurred.') {
        return record.title
      }

      if (typeof record.detail === 'string') return record.detail
      if (typeof record.message === 'string') return record.message
    }
  } catch {
    return text
  }

  return text
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers)

  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const token = getAccessToken()
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    throw new ApiError(response.status, await parseErrorMessage(response))
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}
