import axios from 'axios'

// All API calls use relative paths — Vite proxy forwards them to the BFF.
// In production, an nginx reverse proxy would do the same job.
const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Intercept every response — if it's an error, log it and rethrow.
// This means we only handle errors once, here, not in every component.
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API error:', error.response?.status, error.message)
    return Promise.reject(error)
  }
)

export const fundApi = {
  // GET /api/v1/funds
  getAllFunds: () => api.get('/funds'),

  // GET /api/v1/funds?category=Equity
  getFundsByCategory: (category) => api.get('/funds', { params: { category } }),

  // GET /api/v1/funds?riskLevel=High
  getFundsByRiskLevel: (riskLevel) => api.get('/funds', { params: { riskLevel } }),

  // GET /api/v1/funds/:id
  getFundById: (id) => api.get(`/funds/${id}`),

  // POST /api/v1/funds
  createFund: (fund) => api.post('/funds', fund),

  // PUT /api/v1/funds/:id
  updateFund: (id, fund) => api.put(`/funds/${id}`, fund),

  // DELETE /api/v1/funds/:id
  deleteFund: (id) => api.delete(`/funds/${id}`),
}