import axios from 'axios'
import type { Contact, Account, Deal, Activity, Task, DashboardMetrics, Briefing } from '../types'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Contacts
export const contactsApi = {
  getAll: () => api.get('/api/contacts').then(res => res.data.contacts),
  getById: (id: string) => api.get(`/api/contacts/${id}`).then(res => res.data),
  create: (data: Partial<Contact>) => api.post('/api/contacts', data).then(res => res.data),
  update: (id: string, data: Partial<Contact>) => api.patch(`/api/contacts/${id}`, data).then(res => res.data),
  delete: (id: string) => api.delete(`/api/contacts/${id}`).then(res => res.data),
}

// Accounts
export const accountsApi = {
  getAll: () => api.get('/api/accounts').then(res => res.data.accounts),
  getById: (id: string) => api.get(`/api/accounts/${id}`).then(res => res.data),
  create: (data: Partial<Account>) => api.post('/api/accounts', data).then(res => res.data),
  update: (id: string, data: Partial<Account>) => api.patch(`/api/accounts/${id}`, data).then(res => res.data),
}

// Deals
export const dealsApi = {
  getAll: () => api.get('/api/deals').then(res => res.data.deals),
  getById: (id: string) => api.get(`/api/deals/${id}`).then(res => res.data),
  create: (data: Partial<Deal>) => api.post('/api/deals', data).then(res => res.data),
  update: (id: string, data: Partial<Deal>) => api.patch(`/api/deals/${id}`, data).then(res => res.data),
  getPipeline: () => api.get('/api/deals/pipeline').then(res => res.data),
  getVelocity: (id: string) => api.get(`/api/deals/${id}/velocity`).then(res => res.data),
  getScore: (id: string) => api.get(`/api/deals/${id}/score`).then(res => res.data),
}

// Activities
export const activitiesApi = {
  getAll: (params?: { contact_id?: string; deal_id?: string }) => 
    api.get('/api/activities', { params }).then(res => res.data.activities),
  create: (data: Partial<Activity>) => api.post('/api/activities', data).then(res => res.data),
}

// Tasks
export const tasksApi = {
  getAll: (params?: { status?: string; owner_id?: string }) => 
    api.get('/api/tasks', { params }).then(res => res.data.tasks),
  create: (data: Partial<Task>) => api.post('/api/tasks', data).then(res => res.data),
  complete: (id: string) => api.post(`/api/tasks/${id}/complete`).then(res => res.data),
}

// Dashboard
export const dashboardApi = {
  getMetrics: () => api.get('/api/dashboard').then(res => res.data),
  getBriefing: () => api.get('/api/briefing').then(res => res.data),
}

// Search
export const searchApi = {
  search: (query: string) => api.get(`/api/search?q=${encodeURIComponent(query)}`).then(res => res.data.results),
}

// AI Features
export const aiApi = {
  generateTasks: () => api.post('/api/ai/generate-tasks').then(res => res.data),
  createAITasks: () => api.post('/api/ai/create-tasks').then(res => res.data),
  getDealSuggestions: (dealId: string) => 
    api.get(`/api/deals/${dealId}/ai-suggestions`).then(res => res.data),
}

// Email
export const emailApi = {
  send: (data: { to: string; subject: string; body: string; contact_id?: string; deal_id?: string }) =>
    api.post('/api/emails/send', data).then(res => res.data),
  sync: (days: number = 7) => api.post('/api/emails/sync', { days }).then(res => res.data),
}

// Calendar
export const calendarApi = {
  getEvents: (days: number = 7) => api.get(`/api/calendar/events?days=${days}`).then(res => res.data),
  createEvent: (data: { title: string; start_time: string; end_time: string; attendees: string[]; description?: string }) =>
    api.post('/api/calendar/events', data).then(res => res.data),
}

// Templates
export const templatesApi = {
  getAll: () => api.get('/api/templates').then(res => res.data.templates),
  getById: (id: string) => api.get(`/api/templates/${id}`).then(res => res.data),
  render: (id: string, variables: Record<string, string>) =>
    api.post(`/api/templates/${id}/render`, { variables }).then(res => res.data),
}

export default api
