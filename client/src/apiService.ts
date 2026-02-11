import axios from 'axios';

export const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000";

/** URL for viewing a contract PDF inline in the app (no download). Use as iframe src. */
export const getViewPdfUrl = (contractId: string, userId: string) =>
  `${API_BASE}/view/${contractId}/pdf?user_id=${encodeURIComponent(userId)}`;

export interface FolderItem {
  user_id: string;
  folder_id: string;
  name: string;
  color: string;
  symbol: string;
  contract_ids: string[];
}

export const api = {
  getContracts: (uid: string) => axios.get(`${API_BASE}/contracts?user_id=${uid}`),
  checkGoogle: (uid: string) => axios.get(`${API_BASE}/check-google-connection?user_id=${uid}`),
  authenticate: (endpoint: string, data: URLSearchParams) => axios.post(`${API_BASE}/${endpoint}`, data),
  connectGoogle: (uid: string) => axios.get(`${API_BASE}/auth/google?user_id=${uid}`),
  upload: (formData: FormData) => axios.post(`${API_BASE}/contracts/upload`, formData),
  deleteContract: (id: string, uid: string) => axios.delete(`${API_BASE}/contracts/${id}?user_id=${uid}`),
  updateReminder: (data: any) => axios.post(`${API_BASE}/update-reminder`, data),
  // Folders
  getFolders: (uid: string) => axios.get<{ folders: FolderItem[] }>(`${API_BASE}/folders?user_id=${uid}`),
  createFolder: (data: { user_id: string; name: string; color?: string; symbol?: string }) =>
    axios.post<{ folder: FolderItem }>(`${API_BASE}/folders`, data),
  updateFolder: (folderId: string, data: { user_id: string; name?: string; color?: string; symbol?: string; contract_ids?: string[] }) =>
    axios.patch<{ folder: FolderItem }>(`${API_BASE}/folders/${folderId}`, data),
  deleteFolder: (folderId: string, uid: string) => axios.delete(`${API_BASE}/folders/${folderId}?user_id=${uid}`),
};