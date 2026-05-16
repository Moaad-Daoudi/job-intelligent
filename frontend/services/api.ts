import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000', // Your FastAPI backend
});

export const getJobs = (params: any) => api.get('/jobs', { params });
export const getJobById = (id: string) => api.get(`/jobs/${id}`);
export const getAnalytics = () => api.get('/analytics/stats');