import axios from 'axios'

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL || ''}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
})

export const chatApi = {
  sendMessage: (fundId, message) =>
    api.post('/chat', { fundId, message }),
}