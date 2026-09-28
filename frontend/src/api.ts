/**
 * BhuLekh-AI Frontend API Client
 */

export interface User {
  id: string
  username: string
  full_name: string
  role: string
  state_code?: string
  district_code?: string
  tehsil_code?: string
}

export interface DocumentPageSummary {
  page_no: number
  quality_score: number
  width: number
  height: number
  rotation_deg: number
  flags: string[]
  metrics?: {
    blur: number
    contrast: number
    brightness: number
    skew_angle: number
    noise: number
    text_density: number
  }
  steps_applied?: string[]
  has_pdf_text?: boolean
}

export interface DocumentDetail {
  id: string
  filename: string
  mime?: string
  doc_type: string
  status: string
  quality_score: number
  quality_flags: string[]
  pages_count: number
  state_code?: string
  district_code?: string
  tehsil_code?: string
  village_code?: string
  uploaded_at?: string
  processed_at?: string
  is_duplicate?: boolean
  pages: DocumentPageSummary[]
}

const API_BASE = '/api'

export function getAuthToken(): string | null {
  return localStorage.getItem('bhulekh_token')
}

export function setAuthToken(token: string) {
  localStorage.setItem('bhulekh_token', token)
}

export function removeAuthToken() {
  localStorage.removeItem('bhulekh_token')
  localStorage.removeItem('bhulekh_user')
}

export function getStoredUser(): User | null {
  const data = localStorage.getItem('bhulekh_user')
  return data ? JSON.parse(data) : null
}

export function setStoredUser(user: User) {
  localStorage.setItem('bhulekh_user', JSON.stringify(user))
}

export async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken()
  const headers = new Headers(options.headers || {})

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    let errMsg = `Request failed: ${response.statusText}`
    try {
      const errData = await response.json()
      errMsg = errData.detail || errMsg
    } catch {
      // ignore
    }
    throw new Error(errMsg)
  }

  return response.json()
}

export async function login(username: string, password: string = 'Demo@1234') {
  const formData = new URLSearchParams()
  formData.append('username', username)
  formData.append('password', password)

  const data = await apiRequest<{
    access_token: string
    refresh_token: string
    role: string
    username: string
  }>('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formData.toString(),
  })

  setAuthToken(data.access_token)
  
  // Fetch user profile
  const user = await apiRequest<User>('/auth/me')
  setStoredUser(user)
  return user
}

export async function uploadDocument(
  files: File[],
  metadata: {
    state_code?: string
    district_code?: string
    tehsil_code?: string
    village_code?: string
    expected_doc_type?: string
  }
): Promise<any> {
  const formData = new FormData()
  files.forEach((f) => formData.append('files', f))

  if (metadata.state_code) formData.append('state_code', metadata.state_code)
  if (metadata.district_code) formData.append('district_code', metadata.district_code)
  if (metadata.tehsil_code) formData.append('tehsil_code', metadata.tehsil_code)
  if (metadata.village_code) formData.append('village_code', metadata.village_code)
  if (metadata.expected_doc_type) formData.append('expected_doc_type', metadata.expected_doc_type)

  const token = getAuthToken()
  const headers = new Headers()
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const response = await fetch(`${API_BASE}/documents/upload`, {
    method: 'POST',
    headers,
    body: formData,
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.detail || 'Upload failed')
  }

  return response.json()
}

export async function listDocuments(params: {
  status?: string
  doc_type?: string
  search?: string
  page?: number
  size?: number
} = {}) {
  const qs = new URLSearchParams()
  if (params.status) qs.set('status', params.status)
  if (params.doc_type) qs.set('doc_type', params.doc_type)
  if (params.search) qs.set('search', params.search)
  if (params.page) qs.set('page', params.page.toString())
  if (params.size) qs.set('size', params.size.toString())

  return apiRequest<{
    items: any[]
    total: number
    page: number
    size: number
  }>(`/documents?${qs.toString()}`)
}

export async function getDocument(docId: string): Promise<DocumentDetail> {
  return apiRequest<DocumentDetail>(`/documents/${docId}`)
}

export function getPageImageUrl(docId: string, pageNo: number = 1, variant: 'original' | 'restored' | 'binary' | 'no_stamp' = 'restored'): string {
  const token = getAuthToken()
  const tokenParam = token ? `&token=${token}` : ''
  return `${API_BASE}/documents/${docId}/pages/${pageNo}/image?variant=${variant}${tokenParam}`
}
