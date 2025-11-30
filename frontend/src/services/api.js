const API_BASE = '/api'

export const api = {
  async get(url) {
    const response = await fetch(`${API_BASE}${url}`)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return response.json()
  },

  async post(url, data) {
    const response = await fetch(`${API_BASE}${url}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      const errorText = await response.text()
      let errorData
      try {
        errorData = JSON.parse(errorText)
      } catch {
        errorData = { message: errorText }
      }
      const error = new Error(`HTTP ${response.status}`)
      error.response = { data: errorData, status: response.status }
      throw error
    }
    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      return response.json()
    }
    return response.text()
  },

  async put(url, data) {
    const response = await fetch(`${API_BASE}${url}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      return response.json()
    }
    return response.text()
  },

  async delete(url) {
    const response = await fetch(`${API_BASE}${url}`, {
      method: 'DELETE',
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    if (response.status === 204) return null
    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      return response.json()
    }
    return response.text()
  },

  async postFormData(url, formData, token) {
    const headers = {}
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    const response = await fetch(`${API_BASE}${url}`, {
      method: 'POST',
      headers,
      body: formData,
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return response.json()
  },
}

export const productApi = {
  getAll: () => api.get('/products'),
  getById: (id) => api.get(`/products/${id}`),
  create: (data, token) => {
    return fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }).then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return res.json()
    })
  },
  update: (id, data, token) => {
    return fetch(`${API_BASE}/products/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }).then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return res.json()
    })
  },
  delete: (id, token) => {
    return fetch(`${API_BASE}/products/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }).then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      if (res.status === 204) return null
      return res.text()
    })
  },
}

export const orderApi = {
  create: (data) => api.post('/orders', data),
  getHistory: (email) => api.get(`/orders/history?email=${encodeURIComponent(email)}`),
  confirm: (data) => api.post('/orders/confirm', data),
  createTest: (data) => api.post('/orders/test', data),
}

export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/register', data),
}

export const configApi = {
  getStripe: () => api.get('/config/stripe'),
}

export const adminApi = {
  getOverview: (token) => {
    return fetch(`${API_BASE}/admin/overview`, {
      headers: { 'Authorization': `Bearer ${token}` },
    }).then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return res.json()
    })
  },
  getOrders: (token) => {
    return fetch(`${API_BASE}/orders`, {
      headers: { 'Authorization': `Bearer ${token}` },
    }).then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return res.json()
    })
  },
}

export const uploadApi = {
  uploadImage: (file, token) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.postFormData('/upload/image', formData, token)
  },
}

