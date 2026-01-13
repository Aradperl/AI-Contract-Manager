import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000";

export const api = {
  getContracts: (uid: string) => axios.get(`${API_BASE}/contracts?user_id=${uid}`),
  checkGoogle: (uid: string) => axios.get(`${API_BASE}/check-google-connection?user_id=${uid}`),
  authenticate: (endpoint: string, data: URLSearchParams) => axios.post(`${API_BASE}/${endpoint}`, data),
  connectGoogle: (uid: string) => axios.get(`${API_BASE}/auth/google?user_id=${uid}`),
  upload: (formData: FormData) => axios.post(`${API_BASE}/upload`, formData),
  deleteContract: (id: string, uid: string) => axios.delete(`${API_BASE}/contracts/${id}?user_id=${uid}`),
  updateReminder: (data: any) => axios.post(`${API_BASE}/update-reminder`, data),
  viewContract: (id: string, uid: string) => axios.get(`${API_BASE}/view/${id}?user_id=${uid}`),
};